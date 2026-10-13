"""Mirror currently deployed official IdleArc sprite sheets for reproducible Arcana builds.
Runs only in a controlled GitHub Actions job. Never changes gameplay data.
"""
from pathlib import Path
import hashlib
import json
import os
import re
import urllib.request

ORIGIN = os.environ.get("ARCANA_ART_ORIGIN", "https://arcana-v4-official-art-production.up.railway.app").rstrip("/")
DEST = Path("assets/official-art")
DEST.mkdir(parents=True, exist_ok=True)
def fetch(path, max_bytes=12_000_000):
    req = urllib.request.Request(ORIGIN + "/" + path, headers={"User-Agent": "Arcana-Recovery-Asset-Mirror/1"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        if resp.status != 200:
            raise RuntimeError(f"{path}: HTTP {resp.status}")
        data = resp.read(max_bytes + 1)
        if len(data)>max_bytes:
            raise RuntimeError(f"{path}: exceeds size limit")
        return data
raw = fetch("manifest.json", 2_000_000)
manifest = json.loads(raw)
groups = manifest.get("categories")
if not isinstance(groups, dict) or len(groups)<10:
    raise RuntimeError("Official art manifest is incomplete")
out = {}
for category, group in sorted(groups.items()):
    if not re.fullmatch(r"[a-z][a-z0-9-]*", category):
        raise RuntimeError("Unexpected art category: " + str(category))
    cols,rows = group.get("cols"),group.get("rows")
    mapping=group.get("mapping")
    if not isinstance(cols,int) or cols<1 or not isinstance(rows,int) or rows<1 or not isinstance(mapping,dict):
        raise RuntimeError("Invalid image group "+category)
    if any(not isinstance(v,int) or v<0 or v>=cols*rows for v in mapping.values()):
        raise RuntimeError("Invalid sprite index in "+category)
    name=category+".webp"
    image=fetch(name)
    if len(image)<32 or image[:4]!=b"RIFF" or image[8:12]!=b"WEBP":
        raise RuntimeError("Invalid WEBP sprite sheet "+name)
    (DEST/name).write_bytes(image)
    out[name]={"bytes":len(image),"sha256":hashlib.sha256(image).hexdigest(),"spriteKeys":len(mapping)}
(DEST/"manifest.json").write_bytes(raw)
out["manifest.json"]={"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"categories":len(groups),"version":manifest.get("version")}
(DEST/"checksums.json").write_text(json.dumps(out,indent=2,sort_keys=True)+"\n")
print("Mirrored",len(groups),"sprite sheets with",sum(x["spriteKeys"] for x in out.values() if "spriteKeys" in x),"sprite keys.")
