"""Read-only cross-tool regression audit against isolated Arcana staging."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('ARCANA_STAGING_URL','https://arcana-stable-app-staging.up.railway.app').rstrip('/')
assert BASE.endswith('.up.railway.app'), 'Refusing to inspect production'
ROUTES=[
 ('calculators/upgrade','Upgrade Cost Calculator'),
 ('calculators/compare','Compare Items'),
 ('calculators/pet','Pet Compound Calculator'),
 ('calculators/affixes','Pet Affix Planner'),
 ('labs/build','My Build Studio'),
 ('labs/runes','Rune Forge'),
 ('labs/pets','Pet Loadout'),
 ('labs/skills','Class Skill Tree'),
 ('labs/passives','Passive Skill Tree'),
 ('lfg/raids','ArcanaLFG'),
]
out=Path('qa-output')
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.set_default_timeout(12000)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(BASE+'/',wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('#content')
    screens=[]
    for route,title in ROUTES:
        page.evaluate("(route)=>{location.hash='#/'+route}",route)
        page.wait_for_timeout(300)
        content=page.locator('#content').inner_text(timeout=10000)
        assert title in content,f'{route}: heading missing; content starts '+repr(content[:250])
        assert 'That destination is not available.' not in content,route+' landed at 404'
        assert len(content)>40,route+' rendered empty page'
        metrics=page.evaluate("""() => ({viewport:window.innerWidth,
          fullWidth:document.documentElement.scrollWidth,
          hasBottomNavigation:!!document.querySelector('#bottomNav .navItem'),
          hasHeader:!!document.querySelector('#brandHome')})""")
        assert metrics['hasBottomNavigation'] and metrics['hasHeader'], route+' lost app navigation'
        screens.append({'route':route,'label':title,'contentChars':len(content),
                        'pageOverflowPx':max(0,metrics['fullWidth']-metrics['viewport'])})
    page.screenshot(path=str(out/'arcana-tools-staging-mobile.png'),full_page=True)
    assert not errors, 'Uncaught JS exceptions '+repr(errors[:6])
    (out/'arcana-tools-audit.json').write_text(json.dumps({'status':'PASS','routes':screens,'uncaughtErrors':errors},indent=2)+'\n')
    print(json.dumps({'result':'PASS','routes':len(screens),'uncaughtErrors':len(errors),
                      'overflowRoutes':[r for r in screens if r['pageOverflowPx']>4]},indent=2))
    browser.close()
