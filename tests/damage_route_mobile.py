"""Dedicated Damage Calculator Android route smoke; offline mocked feeds.
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
IMPORTS={}
for module in sorted((ROOT/'src').glob('*.js')):
    source=module.read_text()
    source=re.sub(r"from\s*(['\"])\.\/([a-z0-9-]+\.js)(?:\?[^'\"]*)?\1",lambda m:"from "+m.group(1)+"@arcana/"+m.group(2)+m.group(1),source)
    IMPORTS[f'@arcana/{module.name}']='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
HTML=re.sub(r'<script[^>]+src="/src/app\.js[^>]*></script>', '',HTML)
# Offline browser must render EVERY stylesheet in the real entry point, not just
# styles.css. Missing launch CSS once passed QA while the entire home was unstyled.
for css_name in ('styles.css','wiki-studio.css','community.css','beta.css','launch-navigation.css','arcana-contour.css'):
    css=(ROOT/css_name).read_text()
    pattern=r'<link rel="stylesheet" href="/'+re.escape(css_name)+r'(?:\?[^"]*)?">'
    HTML,count=re.subn(pattern,lambda _: '<style>\n'+css+'\n</style>',HTML)
    assert count==1, 'Homepage missing required CSS reference '+css_name

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

# Long-list testing needs enough mock class skills to exercise pagination.
# Keep these clearly synthetic fixtures; they never enter game data or deployment.
MOCK_ENTRIES['entries'].extend(
    {'id':f'game:class-skill:qa-sample-{i:03}', 'kind':'class-skill',
     'title':f'Test Skill {i:03}', 'subtitle':'QA fixture', 'description':'QA only',
     'keywords':'test'}
    for i in range(75)
)

HTML=HTML.replace('</body>', '''<script>
window.fetch = async function(input) {
 const path = String(input);
 if(path.includes('/api/wiki/import-access')) return new Response(JSON.stringify({allowed:true}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/beta/status')) return new Response(JSON.stringify({release:'arcana-real-accounts-beta-2026-10-13',feedbackEnabled:true,accountsConfigured:false,wikiStorageConfigured:true}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/beta/feedback')) return new Response(JSON.stringify({ok:true,reference:'test1234'}),{status:201,headers:{'content-type':'application/json'}});
 if(path.includes('/api/search/catalog')) return new Response(JSON.stringify(__MOCK_ENTRIES__),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guilds')) return new Response(JSON.stringify({guilds:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/lfg/public')) return new Response(JSON.stringify({listings:[],plans:[],issues:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/official-art/manifest.json')) return new Response(JSON.stringify(__MOCK_ART__),{status:200,headers:{'content-type':'application/json'}});
 return new Response('Unavailable in isolated QA',{status:404});
};
</script><script type="module">import '@arcana/app.js';</script></body>''')
HTML=HTML.replace('__MOCK_ENTRIES__',json.dumps(MOCK_ENTRIES)).replace('__MOCK_ART__',json.dumps(MOCK_ART))


# This isolated feature check intentionally does not require unrelated legacy
# mobile suite assertions about settings, editor state, or equipment slot count.
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    # An intercepted HTTP origin permits localStorage unlike about:blank.
    page.route('http://arcana.test/**',lambda route: route.fulfill(
        status=200,content_type='text/html; charset=utf-8',body=HTML)
        if route.request.resource_type=='document' else
        route.fulfill(status=404,body='Offline QA fixture'))
    page.goto('http://arcana.test/',wait_until='domcontentloaded')
    page.wait_for_selector('.launchHero',timeout=15000)
    assert page.locator('#arcanaDock button').count()==5, 'Modern five-tab dock was replaced'
    assert page.locator('.launchQuickCard').count()==3, 'Modern three-card home was replaced'
    page.evaluate("location.hash='#/calculators/damage'")
    page.wait_for_selector('#arcanaDamageCalculator',timeout=15000)
    calc=page.locator('#arcanaDamageCalculator')
    assert calc.locator('[data-dc-tab]').count()==8, 'Real calculator does not have eight sections'
    assert calc.locator('[data-dc-tab="pet"]').is_visible(), 'Pet comparison is not available'
    assert calc.locator('[data-dc-tab="attributes"]').is_visible(), 'Linked stats are not available'
    assert calc.locator('[data-dc-tab="studio"]').is_visible(), 'Build Studio import is not available'
    assert calc.locator('[data-dc-tab="talismans"]').is_visible(), 'Talisman comparison is not available'
    assert calc.locator('[data-dc-example]').count()==0, 'Private screenshot presets leaked into public UI'
    assert not page.get_by_text('WORK IN PROGRESS',exact=True).count(), 'Old placeholder still displayed'
    calc.locator('[data-dc-tab="pet"]').click()
    assert calc.locator('#dcPetQuick').is_visible(), 'Pet panel cannot open'
    calc.locator('[data-dc-tab="attributes"]').click()
    assert calc.locator('#dcAttributeLab').is_visible(), 'Attributes panel cannot open'
    calc.locator('[data-dc-tab="studio"]').click()
    assert calc.locator('#dcStudioImport').is_visible(), 'Build Studio import panel cannot open'
    calc.locator('[data-dc-tab="talismans"]').click()
    assert calc.locator('#dcTalismanLab').is_visible(), 'Talisman panel cannot open'
    assert calc.locator('[data-dct-field="slug"]').count()==4, 'Talisman A/B expects two slots per side'
    calc.locator('[data-dct-field="slug"]').first.select_option('spirit')
    calc.locator('[data-dct-field="level"]').first.fill('9')
    calc.locator('[data-dct-field="level"]').first.press('Tab')
    assert '66' in calc.locator('#dcTalismanLab').inner_text(), 'Configured level 9 Spirit Pet Damage not displayed'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Horizontal overflow in calculator on mobile'
    page.screenshot(path=str(OUT/'damage-modern-route-mobile.png'),full_page=True)
    assert not errors, 'Unexpected JavaScript errors: '+repr(errors)
    print(json.dumps({'status':'PASS','home_cards':3,'dock_tabs':5,
                      'calculator_tabs':8,'uncaught_js_errors':len(errors)}))
    browser.close()
