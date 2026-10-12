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
    # Theme bridge writes --theme-highlight; footer must follow it on the deployed app.
    swatches=['#00FF88','#A98BFF','#13C5F4','#F062BE','#FFC14D',
              '#EC464D','#80F0E6','#B8FF29','#6964E8','#E8E9ED']
    for accent in swatches:
        result=page.evaluate("""accent => {
            const root=document.documentElement, sign=document.querySelector('.arcanaSignature');
            root.style.setProperty('--theme-highlight',accent);
            root.style.setProperty('--accent',accent);
            return {
                text:getComputedStyle(sign.querySelector('.arcanaSigText em')).color,
                info:getComputedStyle(sign.querySelector('.arcanaSigInfo summary')).color
            };
        }""",accent)
        expected=tuple(int(accent[i:i+2],16) for i in (1,3,5))
        import re
        for field in ('text','info'):
            rgb=tuple(int(x) for x in re.findall(r'\d+',result[field])[:3])
            assert rgb==expected, "Signature not synchronized with theme: "+accent+" "+repr(result)
    page.evaluate("""() => {
        document.documentElement.style.removeProperty('--theme-highlight');
        document.documentElement.style.removeProperty('--accent');
    }""")
    page.get_by_text("ArcanaWiki",exact=True).first.dispatch_event("click")
    page.locator('[data-route="wiki/library"]').first.dispatch_event("click")
    page.wait_for_selector(".wikiCategoryScroll")
    page.wait_for_selector("#wikiRecords .wikiRecord",timeout=25000)
    # Mobile Codex live-search never destroys input focus or loses the reset affordance.
    assert page.locator('.wikiClearFilter').is_hidden()
    page.locator('#wikiFilter').fill('no-such-entry-in-idlearc-2026')
    assert page.locator('.wikiClearFilter').is_visible(), "Clear search missing while typing"
    assert page.locator('#wikiFoundCount').inner_text().startswith('0 ')
    assert page.locator('.wikiEmptyActions [data-action="wikiclear"]').count()==1
    page.locator('.wikiEmptyActions [data-action="wikiclear"]').dispatch_event('click')
    page.wait_for_timeout(120)
    assert page.locator('#wikiFilter').input_value()==''
    assert page.locator('.wikiClearFilter').is_hidden()
    assert page.locator('#wikiRecords .wikiRecord').count()>0
    page.locator('#wikiRecords .wikiRecord').first.dispatch_event('click')
    page.wait_for_timeout(150)
    assert page.locator('.wikiReferencePage').count()==1
    assert page.locator('.wikiReferencePage .wikiBack[data-params="kind=item"]').count()==1, "Back link lost Codex collection"
    page.locator('.wikiReferencePage .wikiBack').dispatch_event('click')
    page.wait_for_timeout(150)
    assert page.locator('.wikiShelf-atlas #wikiRecords .wikiRecord').count()>0
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


    assert page.locator(".wikiShelf-atlas .wikiGalleryList").count()==1, "Atlas must use artwork gallery"
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=class-skill"]').dispatch_event("click")
    page.wait_for_timeout(400)
    skill_names={"Counterstrike":"counterstrike","Keen Edge":"keen-edge","Lethal Blow":"lethal-blow","Strong pet bound":"strong-pet-bound"}
    for display,slug in skill_names.items():
        page.locator("#wikiFilter").fill(display)
        page.wait_for_timeout(130)
        icon=page.locator('#wikiRecords [data-asset-key="skill-override:'+slug+'"][data-art-status="user-confirmed"]')
        assert icon.count()==1, "Missing verified skill art "+display
        resp=page.request.get(BASE+"/assets/skill-overrides/"+slug+".webp",timeout=18000)
        assert resp.status==200 and resp.body()[:4]==b"RIFF", "Invalid skill image "+display
    page.locator("#wikiFilter").fill("")
    page.wait_for_timeout(200)
    page.screenshot(path=str(OUT/"arcana-staging-skills.png"),full_page=True)
    page.locator('.wikiShelfSwitch a[href="#/wiki/library?kind=material"]').dispatch_event("click")
    page.wait_for_timeout(280)
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=pet-bonus"]').dispatch_event("click")
    page.wait_for_timeout(250)
    assert page.locator(".wikiShelf-reference .wikiTextList").count()==1,"Game Systems mode missing"
    assert page.locator('#wikiRecords .wikiRecordText').count()>0,"Expected concise reference rows"
    assert page.locator('#wikiRecords [data-art-status="category-emblem"]').count()==0,"Mechanics still showing generic repeated pictures"
    page.screenshot(path=str(OUT/"arcana-staging-mechanics.png"),full_page=True)
    page.locator('.wikiShelfSwitch a[href="#/wiki/library?kind=item"]').dispatch_event("click")
    page.wait_for_timeout(200)
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=pet"]').dispatch_event("click")
    page.wait_for_timeout(200)
    active=page.locator(".wikiCategoryScroll a.active")
    pos=active.evaluate("(e)=>{const a=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {left:a.left,right:a.right,viewLeft:p.left,viewRight:p.right}}")
    assert pos["left"]>=pos["viewLeft"]-2 and pos["right"]<=pos["viewRight"]+2, "Active tab offscreen: "+repr(pos)
    page.screenshot(path=str(OUT/"arcana-staging-mobile.png"),full_page=True)
    # Simulate a temporary catalog outage and verify one-tap recovery.
    retry_page=browser.new_page(viewport={"width":390,"height":844})
    retry_page.route("**/api/search/catalog", lambda route: route.fulfill(status=503,body="Service unavailable"))
    retry_page.goto(BASE+"/",wait_until="domcontentloaded",timeout=30000)
    retry_page.get_by_text("ArcanaWiki",exact=True).first.dispatch_event("click")
    retry_page.locator('[data-route="wiki/library"]').first.dispatch_event("click")
    retry_page.locator('[data-action="wikiretry"]').wait_for(timeout=20000)
    retry_page.unroute("**/api/search/catalog")
    retry_page.locator('[data-action="wikiretry"]').dispatch_event("click")
    retry_page.wait_for_selector('#wikiRecords .wikiRecord',timeout=30000)
    assert retry_page.locator('[data-action="wikiretry"]').count()==0,"Retry message persisted after recovery"
    retry_page.close()
    assert not errors, "Browser exceptions "+repr(errors)
    print(json.dumps({"result":"PASS","staging":BASE,"localArtSheets":len(categories),"catalogTotal":len(entries),"currencies":counts["currency"],"pets":counts["pet"],"browserErrors":len(errors),"categoryScroll":after},indent=2))
    browser.close()
