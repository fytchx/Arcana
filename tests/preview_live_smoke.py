"""Read-only browser verification of the current isolated preview deployment."""
import json, os, time
from pathlib import Path
from urllib.error import URLError, HTTPError
from urllib.request import urlopen
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE=os.environ.get('ARCANA_STAGING_URL','https://arcana-preview-app-preview.up.railway.app').rstrip('/')
assert urlparse(BASE).hostname=='arcana-preview-app-preview.up.railway.app', 'This gate only targets the isolated preview'
EXPECTED=os.environ.get('GITHUB_SHA')
OUT=Path('qa-output'); OUT.mkdir(exist_ok=True)
def fetch(path):
    with urlopen(BASE+path,timeout=20) as response:
        assert response.status==200
        return json.load(response)
deadline=time.monotonic()+360
while True:
    try:
        health=fetch('/health')
        if health.get('ok') and (not EXPECTED or health.get('commit')==EXPECTED): break
    except (URLError,HTTPError,TimeoutError): pass
    if time.monotonic()>deadline: raise AssertionError('Preview did not deploy the expected commit '+str(EXPECTED))
    time.sleep(8)
assert health.get('artwork',{}).get('local'), 'Official artwork missing'
assert fetch('/api/journal').get('articles'), 'Published Journal unavailable'
assert 'enabled' in fetch('/api/account/me'), 'Account API unavailable'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errors=[]; page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(BASE+'/#/home',wait_until='domcontentloaded')
    page.locator('.atlasUpdate').wait_for()
    page.locator('#arcanaBoot').wait_for(state='detached',timeout=20000)
    page.locator('.atlasUpdate').click(timeout=20000)
    page.locator('.journalNativeBody').wait_for(timeout=20000)
    assert 'journal/article' in page.url, 'Home headline did not open the Journal article'
    assert page.locator('#arcanaDock').is_visible(), 'Journal lost the app navigation'
    for width in (390,1440):
        page.set_viewport_size({'width':width,'height':900})
        crumb=page.locator('.journalNativePage>.wikiBreadcrumbs')
        assert crumb.evaluate("e=>getComputedStyle(e).display")=='flex', 'Journal breadcrumb layout missing'
        assert crumb.locator('button').first.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgba(0, 0, 0, 0)', 'Breadcrumb has a default browser button background'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Journal overflows viewport'
        page.screenshot(path=str(OUT/f'journal-{width}.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.wikiBack[data-route="journal"]').click()
    page.locator('.journalStoryGrid').wait_for()
    page.locator('#arcanaDock [data-dock="home"]').click()
    page.locator('.atlasHeroGo').click()
    page.locator('.studioProfileGroup').wait_for()
    page.locator('#arcanaDock [data-dock="search"]').click()
    search=page.locator('#globalSearch'); search.wait_for()
    assert search.evaluate('e=>document.activeElement===e'), 'Search is not focused'
    assert page.locator('.arcanaSearchDiscoverGrid').count()==0
    search.fill('Pathfinder')
    page.locator('#searchResults').wait_for()
    page.locator('#layer [data-close]').first.click()
    # Old shared URLs must still open inside the app shell.
    page.goto(BASE+'/journal/idlearc-1-3-7-the-timing-couldnt-be-better',wait_until='domcontentloaded')
    page.locator('.journalNativeBody').wait_for(timeout=20000)
    assert page.locator('#arcanaDock').is_visible()
    assert not errors, 'Uncaught browser errors: '+repr(errors)
    browser.close()
print('Preview commit, headline, Journal breadcrumbs, shared URLs, Build Studio and search PASS')
