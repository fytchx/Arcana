"""Classic Arcana language bridge: smoke test against local static HTTP files."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
class QuietFiles(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass

server=ThreadingHTTPServer(("127.0.0.1",0),partial(QuietFiles,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
        page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
        page.set_default_timeout(10000)
        page.route('**/api/**',lambda route:route.fulfill(status=200,json={
            "user":None,"guilds":[],"posts":[],"articles":[],"entries":[],"pages":[],"theme":{},
            "release":"arcana-localization-qa","accountsConfigured":False,"wikiStorageConfigured":True
        }))
        page.goto(f"http://127.0.0.1:{server.server_port}/index.html#/home",wait_until="domcontentloaded")
        page.locator("#arcanaClassicLanguage [data-language-toggle]").wait_for(timeout=20000)
        assert page.evaluate("document.documentElement.lang")=="en","English should be the untouched default"
        assert page.locator('#arcanaDock [data-dock="home"]').inner_text().strip()=="Home"
        page.locator("#arcanaClassicLanguage [data-language-toggle]").click()
        assert page.locator('#arcanaClassicLanguage [data-language-choose]').count()==12
        page.locator('#arcanaClassicLanguage [data-language-choose="de"]').click()
        assert page.evaluate("document.documentElement.lang")=="de"
        assert "Startseite" in page.locator('#arcanaDock [data-dock="home"]').inner_text()
        page.locator("#arcanaClassicLanguage [data-language-toggle]").click()
        page.locator('#arcanaClassicLanguage [data-language-choose="en"]').click()
        assert page.locator('#arcanaDock [data-dock="home"]').inner_text().strip()=="Home"
        assert page.evaluate("document.documentElement.lang")=="en"
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),"Classic overflowed on 390px"
        browser.close()
        print("Classic header selector, twelve languages, German and English restoration PASS")
finally:
    server.shutdown()
    server.server_close()
