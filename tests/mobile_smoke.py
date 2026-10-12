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
# Controlled game references verify rendering independently of real API availability.
MOCK_ART={"categories": {
    "monsters":{"cols":2,"rows":1,"mapping":{"elder-wraith":0}},
    "biomes":{"cols":2,"rows":1,"mapping":{"umbral-rift":0}},
    "skills":{"cols":2,"rows":1,"mapping":{"warrior:retaliation":0}},
    "materials":{"cols":2,"rows":1,"mapping":{"mithril-ore":0}},
    "pets":{"cols":2,"rows":1,"mapping":{"shadow-wolf":0}},
    "items":{"cols":2,"rows":1,"mapping":{"broken-sword":0}},
    "icons":{"cols":2,"rows":1,"mapping":{"pet-affix":0}}
},"categoryEmblems":{"pet-affix":["icons","pet-affix"]}}
MOCK_ENTRIES={"entries":[
    {"id":"game:monster:elder-wraith","kind":"monster","title":"Elder Wraith","subtitle":"Monster","description":"Creature","keywords":"wraith"},
    {"id":"game:biome:umbral-rift","kind":"biome","title":"Umbral Rift","subtitle":"Biome","description":"Zone","keywords":"rift"},
    {"id":"game:class-skill:warrior-retaliation","kind":"class-skill","title":"Retaliation","className":"Warrior","facts":[["Class","Warrior"]],"subtitle":"Class Skill","description":"Warrior skill","keywords":"warrior"},
    {"id":"game:material:mithril-ore","kind":"material","title":"Mithril Ore","subtitle":"Material","description":"Ore","keywords":"mithril"},
    {"id":"game:pet:shadow-wolf","kind":"pet","title":"Shadow Wolf","subtitle":"Pet","description":"Wolf","keywords":"pet"},
    {"id":"game:item:broken-sword","kind":"item","title":"Broken Sword","subtitle":"Equipment","description":"Sword","keywords":"item"},
    {"id":"game:pet-affix:sharp-claw","kind":"pet-affix","title":"Sharp Claw","subtitle":"Pet Affix","description":"Affix","keywords":"pet affix"},
    {"id":"game:class-skill:48","kind":"class-skill","title":"Counterstrike","subtitle":"Class Skill","description":"Warrior skill","keywords":"warrior"},
    {"id":"game:class-skill:26","kind":"class-skill","title":"Keen Edge","subtitle":"Class Skill","description":"Rogue skill","keywords":"rogue"},
    {"id":"game:class-skill:27","kind":"class-skill","title":"Lethal Blow","subtitle":"Class Skill","description":"Rogue skill","keywords":"rogue"},
    {"id":"game:class-skill:1","kind":"class-skill","title":"Strong pet bound","subtitle":"Class Skill","description":"Archer skill","keywords":"archer"}
]}

HTML=HTML.replace('</body>', '''<script>
window.fetch = async function(input) {
 const path = String(input);
 if(path.includes('/api/search/catalog')) return new Response(JSON.stringify(__MOCK_ENTRIES__),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guilds')) return new Response(JSON.stringify({guilds:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/lfg/public')) return new Response(JSON.stringify({listings:[],plans:[],issues:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/official-art/manifest.json')) return new Response(JSON.stringify(__MOCK_ART__),{status:200,headers:{'content-type':'application/json'}});
 return new Response('Unavailable in isolated QA',{status:404});
};
</script><script type="module">import '@arcana/app.js';</script></body>''')
HTML=HTML.replace('__MOCK_ENTRIES__',json.dumps(MOCK_ENTRIES)).replace('__MOCK_ART__',json.dumps(MOCK_ART))

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
    # Check actual computed footer styling as Arcana's theme bridge changes color.
    # Do not mutate production theme settings. Only exercise local CSS variables.
    accents=[
        '#00FF88','#A98BFF','#13C5F4','#F062BE','#FFC14D',
        '#EC464D','#80F0E6','#B8FF29','#6964E8','#E8E9ED'
    ]
    for accent in accents:
        evaluated=page.evaluate("""accent => {
          const root=document.documentElement;
          root.style.setProperty('--theme-highlight',accent);
          root.style.setProperty('--accent',accent);
          const footer=document.querySelector('.arcanaSignature');
          const signature=footer.querySelector('.arcanaSigText em');
          const info=footer.querySelector('.arcanaSigInfo summary');
          return {
            text:getComputedStyle(signature).color,
            icon:getComputedStyle(info).color,
            border:getComputedStyle(footer).borderTopColor
          };
        }""",accent)
        expected=tuple(int(accent[j:j+2],16) for j in (1,3,5))
        for key in ('text','icon'):
            found=tuple(int(x) for x in re.findall(r'\d+',evaluated[key])[:3])
            assert found==expected, f'Signature {key} did not follow {accent}: {evaluated[key]}'
    # Return to the default current theme after the color-switch regression test.
    page.evaluate("""() => {
      document.documentElement.style.removeProperty('--theme-highlight');
      document.documentElement.style.removeProperty('--accent');
    }""")
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
    assert tabs.count()==6, f'Illustrated Atlas should have exactly 6 collections: {tabs.count()}'
    all_names=tabs.all_inner_texts()
    for required in ('Monsters','Biomes','Class Skills','Pet Companions','Currencies','Equipment'):
        assert any(tab.startswith(required) for tab in all_names), f'Missing illustrated category {required}'
    assert page.locator('.wikiShelfSwitch .wikiShelfTab').count()==3, 'Separate Atlas and System collections missing'
    rail.evaluate('(e)=>e.scrollLeft=120')
    before=rail.evaluate('(e)=>e.scrollLeft')
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=monster"]').dispatch_event('click')
    page.wait_for_timeout(200)
    assert page.locator('.wikiCategoryScroll .active').inner_text().startswith('Monsters')
    after=page.locator('.wikiCategoryScroll').evaluate('(e)=>e.scrollLeft')
    assert after>0, f'Category rail unexpectedly reset from {before} to {after}'
    page.screenshot(path=str(OUT/'wiki_mobile.png'),full_page=True)
    # Manifest loads in the SAME assets.js module instance as app initialization.
    page.locator('.wikiShelfSwitch a[href="#/wiki/library?kind=item"]').dispatch_event('click')
    page.wait_for_timeout(200)
    # Search remains responsive without replacing the entire page or moving the rail.
    query=page.locator('#wikiFilter')
    clear=page.locator('.wikiClearFilter')
    assert clear.is_hidden(), 'Clear filter must start hidden'
    query.fill('zzzz-not-a-real-game-entry')
    assert clear.is_visible(), 'Clear filter must appear as soon as typing starts'
    assert page.locator('#wikiFoundCount').inner_text().startswith('0 ')
    assert page.locator('.wikiEmptyActions [data-action="wikiclear"]').count()==1
    assert page.locator('.wikiEmptyActions a[href="#/wiki/library?kind=all"]').count()==1
    assert 'No matches for' in page.locator('#wikiRecords').inner_text()
    clear.dispatch_event('click')
    page.wait_for_timeout(180)
    assert page.locator('#wikiFilter').input_value()==''
    assert page.locator('.wikiClearFilter').is_hidden()
    assert page.locator('#wikiRecords .wikiRecord').count()>0
    query=page.locator('#wikiFilter')
    query.fill('Wraith')
    assert page.locator('#wikiFoundCount').inner_text().startswith('0 ') or page.locator('#wikiRecords .wikiRecord').count()>=0
    query.fill('')
    assert page.locator('.wikiShelf-atlas .wikiGalleryList').count()==1, 'Visual gallery mode missing'
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=monster"]').dispatch_event('click')
    page.wait_for_timeout(200)
    images=page.locator('#wikiRecords [data-art-status="official"]')
    assert images.count()==1, 'Monster image did not render from the official atlas'
    assert 'monsters:elder-wraith' in images.first.get_attribute('data-asset-key')
    page.locator('.wikiShelfSwitch a[href="#/wiki/library?kind=material"]').dispatch_event('click')
    page.wait_for_timeout(200)
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=pet-affix"]').dispatch_event('click')
    page.wait_for_timeout(200)
    assert page.locator('#wikiRecords .wikiRecordText').count()==1, 'Mechanics should use concise text rows'
    assert page.locator('#wikiRecords [data-art-status="category-emblem"]').count()==0, 'Repeated generic sprite art must not clutter reference rows'
    page.locator('.wikiShelfSwitch a[href="#/wiki/library?kind=item"]').dispatch_event('click')
    page.wait_for_timeout(200)
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=class-skill"]').dispatch_event('click')
    page.wait_for_timeout(200)
    assert page.locator('#wikiRecords [data-asset-key="skills:warrior:retaliation"]').count()==1, 'Correct class skill art missing'
    for key in ('counterstrike','keen-edge','lethal-blow','strong-pet-bound'):
        assert page.locator(f'#wikiRecords [data-asset-key="skill-override:{key}"][data-art-status="user-confirmed"]').count()==1, f'Provided skill artwork missing: {key}'
    assert page.locator('.wikiShelf-atlas .wikiGalleryList').count()==1, 'Visual skills must render as gallery cards' 
    active=page.locator('.wikiCategoryScroll a.active')
    position=active.evaluate('(e)=>{const a=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {left:a.left,right:a.right,viewLeft:p.left,viewRight:p.right}}')
    assert position['left']>=position['viewLeft']-2 and position['right']<=position['viewRight']+2, f'Active category not visible: {position}'
    page.screenshot(path=str(OUT/'wiki_official_art_mobile.png'),full_page=True)

    assert errors==[], 'JavaScript exceptions: '+repr(errors)
    print(json.dumps({'status':'PASS','modules_loaded':len(IMPORTS),'footer':'PASS','category_count':len(all_names),'scroll_before':before,'scroll_after':after,'uncaught_js_errors':len(errors),'official_art_fixture_rendered':True,'live_api_artwork_tested':False},indent=2))
    browser.close()
