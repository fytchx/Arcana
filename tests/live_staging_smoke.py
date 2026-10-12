"""Read-only deployed Arcana QA. Runs against staging only."""
from collections import Counter
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

BASE=os.environ.get("ARCANA_STAGING_URL","https://arcana-stable-app-staging.up.railway.app").rstrip("/")
assert BASE.endswith(".up.railway.app"), "Refusing to run deployment tests against an unknown host"
OUT=Path("qa-output")
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
    page.set_default_timeout(12000)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    health=page.request.get(BASE+"/health",timeout=20000)
    assert health.status==200, "Staging health "+str(health.status)
    status=health.json()
    assert status.get("ok") and status.get("artwork",{}).get("local"), "Stage not serving vendored art"
    assert status["artwork"]["groups"]==19
    manifest_response=page.request.get(BASE+"/official-art/manifest.json",timeout=25000)
    assert manifest_response.status==200
    assert manifest_response.headers.get("x-arcana-art-origin")=="verified-git-source"
    manifest=manifest_response.json()
    categories=manifest["categories"]
    assert len(categories)==19
    for category in categories:
        r=page.request.get(BASE+"/official-art/"+category+".webp",timeout=25000)
        assert r.status==200, category+" "+str(r.status)
        data=r.body()
        assert r.headers.get("x-arcana-art-origin")=="verified-git-source",category
        assert data[:4]==b"RIFF" and data[8:12]==b"WEBP", category+" damaged image"
    catalog=page.request.get(BASE+"/api/search/catalog",timeout=30000)
    assert catalog.status==200, "Catalog HTTP "+str(catalog.status)
    entries=catalog.json()["entries"]
    counts=Counter(x["kind"] for x in entries)
    assert len(entries)>=486 and counts["currency"]>=12 and counts["pet"]>=28,counts

    page.goto(BASE+"/",wait_until="domcontentloaded",timeout=30000)
    page.wait_for_selector(".arcanaSignature",timeout=20000)
    assert page.locator(".arcanaSignature").count()==1
    assert "PDX & OVK" in page.locator(".arcanaSignature").inner_text()
    page.get_by_text("ArcanaWiki",exact=True).first.dispatch_event("click")
    page.locator('[data-route="wiki/library"]').first.dispatch_event("click")
    page.wait_for_selector(".wikiCategoryScroll")
    page.wait_for_selector("#wikiRecords .wikiRecord",timeout=25000)
    rail=page.locator(".wikiCategoryScroll")
    rail.evaluate("(e)=>e.scrollLeft=140")
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=monster"]').dispatch_event("click")
    page.wait_for_timeout(350)
    assert "Monsters" in page.locator(".wikiCategoryScroll .active").inner_text()
    after=page.locator(".wikiCategoryScroll").evaluate("(e)=>e.scrollLeft")
    assert after>0, "Category rail reset to left"
    assert page.locator('#wikiRecords [data-art-status="official"]').count()>0,"Monster artwork not rendered"
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=currency"]').dispatch_event("click")
    page.wait_for_timeout(350)
    assert page.locator("#wikiRecords .wikiRecord").count()>=12, "Currency category empty"
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=pet"]').dispatch_event("click")
    page.wait_for_timeout(350)
    assert page.locator("#wikiRecords .wikiRecord").count()>=28, "Pet category empty"
    assert page.locator('#wikiRecords [data-art-status="official"],#wikiRecords [data-art-status="representative"]').count()>0, "Pet artwork not rendered"
    octopusia=page.locator("#wikiRecords .wikiRecord").filter(has_text="Octopusia")
    assert octopusia.count()==1, "Octopusia pet record missing"
    assert octopusia.locator('[data-asset-key="pets:octopussy"][data-art-status="name-alias"]').count()==1, "Octopusia does not show the verified blue octopus sprite"

    active=page.locator(".wikiCategoryScroll a.active")
    pos=active.evaluate("(e)=>{const a=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {left:a.left,right:a.right,viewLeft:p.left,viewRight:p.right}}")
    assert pos["left"]>=pos["viewLeft"]-2 and pos["right"]<=pos["viewRight"]+2, "Active tab offscreen: "+repr(pos)
    page.screenshot(path=str(OUT/"arcana-staging-mobile.png"),full_page=True)
    assert not errors, "Browser exceptions "+repr(errors)
    print(json.dumps({"result":"PASS","staging":BASE,"localArtSheets":len(categories),"catalogTotal":len(entries),"currencies":counts["currency"],"pets":counts["pet"],"browserErrors":len(errors),"categoryScroll":after},indent=2))
    browser.close()
