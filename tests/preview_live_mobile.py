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
        assert result["url"].startswith(URL),"Preview unexpectedly redirects away"
        assert result["bodyWidth"]<=result["viewport"]+3,"Mobile horizontal overflow"
        assert not errors,"JavaScript page errors: "+repr(errors)
        assert not broken,"Failed browser requests: "+repr(broken)
    finally:
        print("Navigations:",json.dumps(redirects))
        print("Page errors:",json.dumps(errors))
        print("Request failures:",json.dumps(broken))
        page.screenshot(path=str(out/"preview-live-mobile.png"),full_page=True,timeout=15000)
        browser.close()
