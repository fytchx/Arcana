#!/usr/bin/env python3
"""Offline Arcana editorial translation builder using MIT-licensed M2M100.

Keeps Markdown structure, IDs, links and numbers intact. Generated files are
source-version-bound and for preview/review before any production release.
"""
import argparse
import json
import re
from pathlib import Path

MODEL = "facebook/m2m100_418M"
LOCALES = ("de", "es", "fr", "it", "ja", "ko", "pl", "pt", "ru", "tr", "zh")
ROOT = Path(__file__).resolve().parent.parent
INPUT = Path("/tmp/arcana-i18n/source.json")
OUTPUT = ROOT / "next" / "generated-locales"
MARKUP = re.compile(r'(\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\x60[^\x60]+\x60)')
NUMBERS = re.compile(r'(?<![A-Za-z])(?:[+\-−]?\d[\d.,]*%?|[Aa]\d+)(?![A-Za-z])')

def nums(text):
    return sorted(NUMBERS.findall(text))

def parts(line):
    result = []
    for token in MARKUP.split(line):
        if not token: continue
        if token.startswith("[[") and token.endswith("]]"):
            contents = token[2:-2]
            if "|" in contents:
                target, label = contents.split("|",1)
                result.append(("token","[["+target+"|",label,"]]"))
            else: result.append(("literal",token))
        elif token.startswith("[") and "](" in token and token.endswith(")"):
            idx=token.find("](")
            result.append(("token","[",token[1:idx],token[idx:]))
        elif token.startswith("**") and token.endswith("**"):
            result.append(("token","**",token[2:-2],"**"))
        elif token.startswith(chr(96)):
            result.append(("literal",token))
        else:
            result.append(("plain",token))
    return result

def parse_line(line):
    if re.match(r'^\s*\|\s*:?-{2,}',line):
        return ("literal",line)
    if line.lstrip().startswith("|") and line.rstrip().endswith("|"):
        return ("table",[parse_line(c) for c in line.split("|")])
    prefix = re.match(r'^(\s*(?:#{1,4}\s+|[-*]\s+|\d+\.\s+|>\s+|Table:\s+))',line)
    head=prefix.group(0) if prefix else ""
    return ("line",head,parts(line[len(head):]))

def strings_in(source):
    found=set()
    def visit(seg):
        if seg[0]=="table":
            for cell in seg[1]: visit(cell)
        elif seg[0]=="line":
            for part in seg[2]:
                value=part[2] if part[0]=="token" else part[1] if part[0]=="plain" else ""
                if re.search("[A-Za-z]",value): found.add(value)
    for category in ("handbook","guides"):
        for doc in source[category].values():
            for field in ("title","answer","summary","body"):
                if isinstance(doc.get(field),str):
                    for line in doc[field].split("\n"): visit(parse_line(line))
    return sorted(found)

def render(seg,translations):
    if seg[0]=="literal": return seg[1]
    if seg[0]=="table": return "|".join(render(c,translations) for c in seg[1])
    head, tokens=seg[1:]
    result=head
    for token in tokens:
        if token[0]=="literal": result+=token[1]
        elif token[0]=="plain": result+=translations.get(token[1],token[1])
        else: result+=token[1]+translations.get(token[2],token[2])+token[3]
    return result

def translated_field(value,translations):
    return "\n".join(render(parse_line(line),translations) for line in value.split("\n"))

def model_translate(values,locale,tokenizer,model,torch):
    output={}
    tokenizer.src_lang="en"
    for start in range(0,len(values),6):
        batch=values[start:start+6]
        encoded=tokenizer(batch,return_tensors="pt",padding=True,truncation=True,max_length=430)
        with torch.inference_mode():
            generated=model.generate(**encoded,forced_bos_token_id=tokenizer.get_lang_id(locale),max_new_tokens=240,num_beams=1)
        translations=tokenizer.batch_decode(generated,skip_special_tokens=True)
        for original,translation in zip(batch,translations):
            clean=translation.strip()
            output[original]=clean if clean and nums(original)==nums(clean) else original
        if start%120==0: print(f"{locale}: {min(start+6,len(values))}/{len(values)} fragments",flush=True)
    return output

def main(codes,limit):
    import torch
    from transformers import M2M100Tokenizer, M2M100ForConditionalGeneration
    torch.set_num_threads(3)
    source=json.loads(INPUT.read_text(encoding="utf8"))
    chunks=strings_in(source)
    if limit: chunks=chunks[:limit]
    print(f"Found {len(chunks)} unique source fragments",flush=True)
    tokenizer=M2M100Tokenizer.from_pretrained(MODEL)
    model=M2M100ForConditionalGeneration.from_pretrained(MODEL).eval()
    OUTPUT.mkdir(exist_ok=True,parents=True)
    for code in codes:
        translated=model_translate(chunks,code,tokenizer,model,torch)
        result={"schema":1,"language":code,"engine":{"id":MODEL,"license":"MIT","mode":"offline-build"},"handbook":{},"guides":{}}
        for kind in ("handbook","guides"):
            for name,doc in source[kind].items():
                fields={k:translated_field(v,translated) for k,v in doc.items() if k in ("title","answer","summary","body")}
                result[kind][name]={"sourceHash":doc["sourceHash"],**fields}
        dest=OUTPUT/(code+".json")
        dest.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        changed=sum(1 for original,proposal in translated.items() if original!=proposal)
        print(f"Wrote {dest}: {len(result['handbook'])} pages, {len(result['guides'])} guides; "
              f"{changed} of {len(translated)} fragments translated.",flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--languages",default="de",help="Comma-separated target languages")
    p.add_argument("--limit",type=int,default=0,help="Translation sample count; 0=complete")
    args=p.parse_args()
    codes=[x.strip() for x in args.languages.split(",")]
    if any(c not in LOCALES for c in codes): raise SystemExit("Invalid language")
    main(codes,args.limit)
