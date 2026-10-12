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
 ('calculators/affixes','Pet Affix Cost'),
 ('labs/build','My Build Studio'),
 ('labs/runes','Rune Forge'),
 ('labs/pets','My Build Studio'),
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
    # Sourced equipment comparisons have real values, not placeholder claims.
    from urllib.parse import quote
    catalog=page.request.get(BASE+'/api/search/catalog',timeout=25000).json()['entries']
    item_ids={r.get('title'):r.get('id') for r in catalog if r.get('kind')=='item'}
    assert 'Rags' in item_ids and 'Wardplate' in item_ids and 'Claws' in item_ids
    def equip_link(left,right):
        return BASE+'/#/calculators/compare?left='+quote(item_ids[left],safe='')+'&right='+quote(item_ids[right],safe='')
    page.goto(equip_link('Rags','Wardplate'),wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function("""() => [...document.querySelectorAll('.verifiedStatCard strong')].some(e=>e.textContent==='Wardplate')""",timeout=15000)
    summary=page.locator('.verifiedComparePanel').inner_text()
    assert 'Rags' in summary and 'Wardplate' in summary and 'Defense' in summary, 'Verified comparison missing'
    assert 'Same primary stat' in summary, 'Identical stat types not comparable'
    assert '-11 minimum / -29 maximum' in summary, 'Base range delta incorrect'
    page.locator('[data-action="comparetier"][data-arg="3"]').dispatch_event('click')
    assert page.locator('.verifiedTierChip.active').inner_text().startswith('T3'), 'Tier selection reset'
    page.goto(equip_link('Claws','Wardplate'),wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function("""() => [...document.querySelectorAll('.verifiedStatCard strong')].some(e=>e.textContent==='Claws')""",timeout=15000)
    assert 'Different primary stats' in page.locator('.verifiedComparePanel').inner_text()
    page.goto(BASE+'/#/calculators/upgrade?item='+quote(item_ids['Claws'],safe=''),wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('.verifiedUpgradeReference .verifiedUpgradeRow',timeout=15000)
    assert page.locator('.verifiedUpgradeRow').count()==5
    assert '5,250,000 base gold' in page.locator('.verifiedUpgradeReference').inner_text()
    page.screenshot(path=str(out/'arcana-verified-equipment-mobile.png'),full_page=True)
    # Verify streamlined Compound→Drop Bonus math and targeted Pet Shard costs.
    page.goto(BASE+'/#/calculators/pet',wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('#petCompoundRarity',timeout=12000)
    assert page.locator('#petCompoundRarity option').count()==4
    assert page.locator('#petCompoundBonus').input_value()=='pet_damage'
    assert page.locator('.petMiniComparison').inner_text().count('101%')==1,"Legendary Pet Damage C10 should be 101%"
    page.locator('#petCompoundRarity').select_option('uncommon')
    page.wait_for_timeout(90)
    page.locator('#petCompoundBonus').select_option('dodge')
    page.locator('#petCompoundLevel').fill('10')
    page.locator('#petCompoundLevel').press('Tab')
    page.wait_for_timeout(100)
    assert '12%' in page.locator('.petMiniComparison').inner_text()
    page.reload(wait_until='domcontentloaded')
    assert page.locator('#petCompoundRarity').input_value()=='uncommon'
    assert page.locator('#petCompoundLevel').input_value()=='10'
    page.screenshot(path=str(out/'arcana-pet-compound-mobile.png'),full_page=True)
    page.goto(BASE+'/#/calculators/affixes',wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('#petAffixType',timeout=12000)
    assert page.locator('#petAffixType option').count()==9
    page.locator('#petAffixType').select_option('item_quantity')
    page.locator('#petAffixCurrent').fill('95')
    page.locator('#petAffixCurrent').press('Tab')
    page.locator('#petAffixTarget').fill('96')
    page.locator('#petAffixTarget').press('Tab')
    page.wait_for_timeout(100)
    assert '5 Pet Shards' in page.locator('.petMiniBig').inner_text(),"Lv95→96 costs five shards"
    page.locator('#petAffixType').select_option('all_skills')
    assert page.locator('#petAffixTarget').input_value()=='2'
    assert '1,000 Pet Shards' in page.locator('.petMiniBig').inner_text()
    page.locator('[data-action="petaffixstep"][data-arg="100"]').dispatch_event('click')
    assert page.locator('#petAffixTarget').input_value()=='2'
    page.locator('#petAffixType').select_option('extra_kill_chance')
    assert page.locator('#petAffixTarget').input_value()=='1'
    assert '0 Pet Shards' in page.locator('.petMiniBig').inner_text()
    page.locator('#petAffixType').select_option('gold_gain')
    page.locator('#petAffixTarget').fill('35')
    page.locator('#petAffixTarget').press('Tab')
    page.reload(wait_until='domcontentloaded')
    assert page.locator('#petAffixType').input_value()=='gold_gain'
    assert page.locator('#petAffixTarget').input_value()=='35'
    assert page.locator('.petMiniFoot').count()==1
    page.screenshot(path=str(out/'arcana-pet-affix-cost-mobile.png'),full_page=True)
    page.goto(BASE+'/#/labs/build',wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('[data-pet-bonus-target="0"]',timeout=15000)
    assert page.locator('[data-pet-bonus-target]').count()==4
    assert page.locator('[data-pet-name]').count()==0
    assert page.locator('[data-pet-equipped]').count()==0
    assert page.locator('[data-pet-drop]').count()==0
    page.locator('[data-pet-bonus-target="0"]').select_option('pet_damage')
    assert page.locator('[data-pet-bonus-target="0"]').input_value()=='pet_damage'
    assert int(page.locator('.petBuildHead small').inner_text().split('/')[0])>=1
    page.reload(wait_until='domcontentloaded')
    assert page.locator('[data-pet-bonus-target="0"]').input_value()=='pet_damage'
    page.screenshot(path=str(out/'arcana-pet-affix-planner-mobile.png'),full_page=True)
    page.screenshot(path=str(out/'arcana-tools-staging-mobile.png'),full_page=True)
    assert not errors, 'Uncaught JS exceptions '+repr(errors[:6])
    (out/'arcana-tools-audit.json').write_text(json.dumps({'status':'PASS','routes':screens,'uncaughtErrors':errors},indent=2)+'\n')
    print(json.dumps({'result':'PASS','routes':len(screens),'uncaughtErrors':len(errors),
                      'overflowRoutes':[r for r in screens if r['pageOverflowPx']>4]},indent=2))
    browser.close()
