"""Offline DOM smoke test for Arcana. Uses in-memory modules and MOCKED network feeds.
Install: pip install playwright; python -m playwright install chromium
Run: python tests/mobile_smoke.py
This verifies UI behavior, NOT live art/API availability.
"""
from pathlib import Path
from html import escape
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import base64, json, re, os, shutil

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'qa-output'
OUT.mkdir(exist_ok=True)
HTML=(ROOT/'index.html').read_text()
STYLE=(ROOT/'styles.css').read_text()
IMPORTS={}
for module in sorted((ROOT/'src').glob('*.js')):
    source=module.read_text()
    source=re.sub(r"from\s*(['\"])\.\/([a-z0-9-]+\.js)(?:\?[^'\"]*)?\1",lambda m:"from "+m.group(1)+"@arcana/"+m.group(2)+m.group(1),source)
    IMPORTS[f'@arcana/{module.name}']='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
HTML=re.sub(r'<script[^>]+src="/src/app\.js[^>]*></script>', '',HTML)
HTML=HTML.replace('<link rel="stylesheet" href="/styles.css">','<style>'+STYLE+'</style>')
HTML=HTML.replace('</head>', '<script type="importmap">'+json.dumps({'imports': IMPORTS})+'</script></head>')
HTML=HTML.replace('</body>', '''<script>
window.fetch = async function(input) {
 const path = String(input);
 if(path.includes('/api/search/catalog')) return new Response(JSON.stringify({entries:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guilds')) return new Response(JSON.stringify({guilds:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/lfg/public')) return new Response(JSON.stringify({listings:[],plans:[],issues:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/codex-art/manifest.json')) return new Response(JSON.stringify({categories:{}}),{status:200,headers:{'content-type':'application/json'}});
 return new Response('Unavailable in isolated QA',{status:404});
};
</script><script type="module">import '@arcana/app.js';</script></body>''')

args=['--no-sandbox','--disable-dev-shm-usage']
executable=shutil.which('chromium') or shutil.which('google-chrome') or None
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True, executable_path=executable, args=args)
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.set_default_timeout(3000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded')
    page.wait_for_timeout(700)
    assert page.locator('.arcanaSignature').count()==1, 'Footer must appear exactly once'
    footer=page.locator('.arcanaSignature').inner_text()
    assert 'Made by Zane' in footer and 'PDX & OVK' in footer, footer
    assert page.get_by_text('ArcanaWiki',exact=True).count()>0, 'ArcanaWiki navigation missing'
    page.screenshot(path=str(OUT/'home_mobile.png'),full_page=True)
    page.get_by_text('ArcanaWiki',exact=True).first.dispatch_event('click')
    page.wait_for_timeout(250)
    assert 'wiki' in page.url or page.locator('body').inner_text().find('ARCANAWIKI')>=0, 'Wiki did not open'
    page.locator('[data-route="wiki/library"]').first.dispatch_event('click')
    page.wait_for_timeout(250)
    rail=page.locator('.wikiCategoryScroll')
    assert rail.count()==1, 'Category carousel missing'
    tabs=rail.locator('a')
    assert tabs.count()>=12, f'Category list unexpectedly short: {tabs.count()}'
    all_names=tabs.all_inner_texts()
    for required in ('Materials','Monsters','Biomes','Class Skills','Pet Companions'):
        assert required in all_names, f'Missing category {required}'
    rail.evaluate('(e)=>e.scrollLeft=120')
    before=rail.evaluate('(e)=>e.scrollLeft')
    tabs.get_by_text('Materials',exact=True).dispatch_event('click')
    page.wait_for_timeout(200)
    assert page.locator('.wikiCategoryScroll .active').inner_text()=='Materials'
    after=page.locator('.wikiCategoryScroll').evaluate('(e)=>e.scrollLeft')
    assert after>0, f'Category rail unexpectedly reset from {before} to {after}'
    page.screenshot(path=str(OUT/'wiki_mobile.png'),full_page=True)
    assert errors==[], 'JavaScript exceptions: '+repr(errors)
    print(json.dumps({'status':'PASS','modules_loaded':len(IMPORTS),'footer':'PASS','category_count':len(all_names),'scroll_before':before,'scroll_after':after,'uncaught_js_errors':len(errors),'live_api_artwork_tested':False},indent=2))
    browser.close()
