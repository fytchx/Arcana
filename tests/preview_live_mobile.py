"""Read-only live browser check of the standalone Arcana Preview domain."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

URL="https://arcana-preview-app-preview.up.railway.app/"
out=Path("qa-output")
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
    errors=[]
    broken=[]
    redirects=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("requestfailed",lambda r:broken.append((r.url,str(r.failure))))
    page.on("framenavigated",lambda f:redirects.append(f.url))
    try:
        response=page.goto(URL,wait_until="domcontentloaded",timeout=30000)
        print("Initial HTTP:",response.status if response else None)
        assert response and response.status==200,"Preview homepage returned HTTP "+str(response.status if response else "no response")
        page.locator(".launchQuickCard").first.wait_for(timeout=20000)
        page.wait_for_timeout(1000)
        result=page.evaluate("""() => ({
          url:location.href,title:document.title,
          css:getComputedStyle(document.querySelector('.launchQuickGrid')).display,
          hero:getComputedStyle(document.querySelector('.launchHero')).display,
          cards:document.querySelectorAll('.launchQuickCard').length,
          content:document.querySelector('#content')?.innerText.slice(0,500),
          bodyWidth:document.body.scrollWidth,viewport:innerWidth
        })""")
        print("Rendered:",json.dumps(result))
        assert result["cards"]==6,"Six navigation cards did not render"
        assert result["css"]=="grid","Live navigation stylesheet failed to apply"
        assert result["hero"]=="flex","Live hero stylesheet failed to apply"
        slate=page.locator(".launchQuickCard").evaluate_all("""els => {
            const a=els[0].getBoundingClientRect(),b=els[1].getBoundingClientRect();
            return {top:a.y,next:b.y,left:a.x,nextLeft:b.x,cardHeight:a.height,
                    heroHeight:document.querySelector('.launchHero').getBoundingClientRect().height};
        }""")
        print("Slate geometry:",json.dumps(slate))
        assert slate["next"]>slate["top"]+45 and abs(slate["left"]-slate["nextLeft"])<3,"Slate must use one-column navigation"
        assert 52<=slate["cardHeight"]<=80,"Slate cards are too large or too small"
        assert 110<=slate["heroHeight"]<=200,"Build Studio feature too tall for Slate"
        page.locator("#accountBtn").click()
        page.locator('[data-route="settings"]').click()
        assert page.locator(".slateAccentChoice").count()==10,"Ten theme colors must be selectable"
        page.locator('[data-action="accent"][data-arg="cyan-blue"]').click()
        chosen=page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-highlight').trim()")
        assert chosen.lower()=="#13c5f4","Personal accent was not applied"
        page.reload(wait_until="domcontentloaded")
        page.locator(".slateAccentChoice").first.wait_for(timeout=20000)
        persisted=page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-highlight').trim()")
        assert persisted.lower()=="#13c5f4","Personal accent choice did not survive reload"
        print("Player accent persisted:",persisted)
        page.goto(URL+"#/labs/build",wait_until="domcontentloaded",timeout=30000)
        page.locator(".studioProfile").wait_for(timeout=16000)
        assert page.locator(".studioPrimaryEquipment .loadoutSlot").count()==13,"Live loadout lost gear slots"
        assert page.locator(".studioPrimaryEquipment .arcanaSilhouette").count()==13,"Live equipment silhouettes not applied"
        assert page.locator(".studioProfileVisual .arcanaSilhouette").count()==1,"Class profile emblem missing"
        assert page.locator(".pageHead").count()==0,"Old oversized heading still present"
        assert page.locator(".launchReturnHome").count()==0,"Duplicate home bar returned"
        profile=page.locator(".studioProfile").bounding_box()
        equipment=page.locator(".studioPrimaryEquipment").bounding_box()
        assert profile and equipment and equipment["y"]>profile["y"],"Equipment must follow compact build profile"
        assert equipment["y"]<500,"Equipment is below the first mobile screen"
        print("Live Studio geometry:",json.dumps({"profile":profile,"equipment":equipment}))


        assert result["url"].startswith(URL),"Preview unexpectedly redirects away"
        assert result["bodyWidth"]<=result["viewport"]+3,"Mobile horizontal overflow"
        assert not errors,"JavaScript page errors: "+repr(errors)
        required=[x for x in broken if x[0].startswith(URL)]
        optional=[x for x in broken if not x[0].startswith(URL)]
        print("Optional external requests:",json.dumps(optional))
        assert not required,"Failed Arcana Preview assets: "+repr(required)
    finally:
        print("Navigations:",json.dumps(redirects))
        print("Page errors:",json.dumps(errors))
        print("Request failures:",json.dumps(broken))
        page.screenshot(path=str(out/"preview-live-mobile.png"),full_page=True,timeout=15000)
        browser.close()
