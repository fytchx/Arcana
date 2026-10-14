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

args=['--no-sandbox','--disable-dev-shm-usage']
executable=shutil.which('chromium') or shutil.which('google-chrome') or None
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True, executable_path=executable, args=args)
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.set_default_timeout(3000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded')
    page.wait_for_selector('.launchHero',timeout=15000)
    assert page.locator('#arcanaDock button').count()==5, 'All five navigation tabs must exist'
    assert page.locator('#generalChatBtn').is_visible(), 'General chat launcher missing'
    page.evaluate("location.hash='#/settings'")
    page.wait_for_selector('.arcanaSignature',timeout=8000)
    assert errors==[], 'App failed to initialize: '+repr(errors)
    assert page.locator('.skipMain').count()==1, 'Accessible skip navigation missing'
    page.locator('.skipMain').dispatch_event('click')
    assert page.evaluate('document.activeElement.id')=='content', 'Skip navigation did not focus the main content'
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
    # Home has a stable five-tab dock, top-left chat and top-right search.
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.launchHero',timeout=8000)
    assert page.locator('#arcanaDock [data-dock="home"]').get_attribute('aria-current')=='page', 'Home tab not selected'
    assert page.locator('#generalChatBtn').is_visible(), 'General chat launcher missing'
    assert page.locator('#searchBtn').is_visible(), 'Search must live in the header'
    assert page.locator('#bottomNav').count()==0, 'Legacy bottom navigation must stay removed'
    assert page.locator('#arcanaDock button').count()==5, 'Persistent five-tab dock missing'
    assert page.locator('.launchHeroCTA[data-route="labs/build"]').count()==1, 'Build Studio is not featured'
    assert page.locator('.launchQuickCard').count()==6, 'Exactly six launch navigation cards are required'
    assert page.locator('.launchQuickCard .arcanaIcon').count()>=12, 'Themeable SVG icons missing from launch navigation'
    assert page.locator('.launchHeroArt .arcanaIcon').get_attribute('data-arcana-icon')=='feature-build-studio', 'Build Studio emblem must use Arcana Minimal'
    # The icon gallery is a real route and every registered asset is previewable.
    page.evaluate("location.hash='#/icons'")
    page.locator('.arcanaIconCatalogItem').first.wait_for(timeout=8000)
    assert page.locator('.arcanaIconCatalogItem').count()==144, 'Full icon library did not render'
    assert page.locator('.arcanaIconCatalogSection').count()==6, 'Icon categories missing'
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Icon gallery overflows mobile horizontally'
    page.evaluate("location.hash='#/settings'")
    page.locator('.arcanaSettings').wait_for(timeout=8000)
    assert page.locator('.arcanaSurfaceChoice').count()==5, 'Site surface options missing'
    assert page.locator('.arcanaIconColorChoice').count()==11, 'Independent icon colors missing'
    assert page.locator('.arcanaIconModeChoice').count()==4, 'Icon modes missing'
    assert page.locator('.slateAccentChoice').count()==10, 'Original accent colors missing'
    page.evaluate("location.hash='#/home'")
    page.locator('.launchQuickCard').first.wait_for(timeout=8000)

    assert page.locator('.launchBrandName').inner_text()=='ARCANA', 'Slate wordmark missing'
    assert page.locator('.launchHero').evaluate('(e)=>getComputedStyle(e).display')=='flex', 'Build Studio hero CSS missing'
    assert page.locator('.launchQuickGrid').evaluate('(e)=>getComputedStyle(e).display')=='grid', 'Homepage cards are not using responsive grid CSS'
    positions=page.locator('.launchQuickCard').evaluate_all('(els)=>els.slice(0,2).map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y}))')
    assert abs(positions[0]['y']-positions[1]['y'])<3 and positions[1]['x']>positions[0]['x']+75, 'Quick Access must be two cards side by side'
    assert page.locator('.launchHeroCTA').inner_text().find('Enter Build Studio')>=0, 'Hero does not have a special Build Studio call to action'
    assert page.locator('.launchHeroArcaneSeal').count()==1 and page.locator('.launchHeroCTASigil').count()==1, 'Arcane hero detailing missing'
    assert page.locator('.launchHeroCTA').evaluate("(e)=>getComputedStyle(e).gridTemplateColumns!='none'"), 'Mystical CTA CSS was not loaded'
    assert page.locator('.launchQuickGrid').evaluate("(e)=>getComputedStyle(e).gridTemplateColumns.split(' ').length==2"), 'Quick Access grid must have exactly two columns'
    assert page.locator('.launchQuickCard').evaluate_all("(els)=>els.every(e=>e.getBoundingClientRect().height>=80)"), 'Quick Access tap targets are too small'
    assert page.locator('.launchFeaturedGrid').evaluate("(e)=>getComputedStyle(e).gridTemplateColumns.split(' ').length==2"), 'Featured cards must be laid out two across'
    features=page.locator('.launchFeatureRow').evaluate_all("(els)=>els.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width}))")
    assert len(features)==3, 'All featured destinations must be preserved'
    assert abs(features[0]['y']-features[1]['y'])<3 and features[1]['x']>features[0]['x']+75, 'Featured first pair must be side by side'
    assert features[2]['y']>features[0]['y']+65 and features[2]['w']>features[0]['w']*1.8, 'Last featured card must span the entire row'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Two-column home has horizontal overflow'

    for menu_id in ('wiki','tools','guides','builds','codex','social'):
        assert page.locator('.launchQuickCard[data-arg="'+menu_id+'"]').count()==1, 'Missing home card '+menu_id
    page.locator('.launchQuickCard[data-arg="wiki"]').click()
    assert page.locator('#layer').is_visible(), 'Wiki overlay did not open'
    assert page.locator('#layer .launchNavRow').count()>=6, 'Wiki submenu is incomplete'
    page.locator('#layer .scrim').dispatch_event('click')
    assert page.locator('#layer').is_hidden(), 'Clicking outside did not close submenu'
    page.locator('.launchQuickCard[data-arg="tools"]').click()
    page.locator('#layer [data-route="labs/guild-tree"]').click()
    assert page.locator('.guildTreePlanner').count()==1, 'Guild planner menu link is broken'
    assert page.locator('.launchReturnHome [data-route="home"]').count()==1, 'Page has no direct Home return'
    page.locator('.launchReturnHome [data-route="home"]').click()
    page.locator('.launchSeeAll').click()
    assert page.locator('.launchAlphabetGroup').count()>0, 'A-Z directory did not open'
    page.locator('.launchReturnHome button').click()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Home has horizontal overflow'
    page.set_viewport_size({'width':320,'height':720})
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Homepage overflows a narrow Android screen'
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(OUT/'home_mobile.png'),full_page=True)
    page.locator('.launchQuickCard[data-arg="wiki"]').click()
    page.locator('#layer [data-route="wiki"]').click()
    assert page.locator('.wikiPortalShortcuts .arcanaConnection').count()==4, 'Wiki shortcuts are missing'
    assert page.locator('.launchReturnHome [data-route="home"]').count()==1, 'Wiki must return directly to Home'
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
    query.fill('Broken Sword')
    assert page.locator('#wikiFoundCount').inner_text().startswith('1 ')
    assert page.locator('#wikiRecords .wikiRecord').count()==1
    assert page.locator('#wikiShowing').inner_text()=='Showing 1 of 1'
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
    # Large skill lists expand in place rather than replacing the page and jumping to the top.
    page.locator('#wikiFilter').fill('')
    page.locator('.wikiCategoryScroll a[href="#/wiki/library?kind=class-skill"]').dispatch_event('click')
    page.wait_for_timeout(180)
    assert page.locator('#wikiRecords .wikiRecord').count()==36
    page.evaluate("window.scrollTo({top:520,behavior:'instant'})")
    before_more=page.evaluate("window.scrollY")
    page.locator('#wikiMore [data-action="wikimore"]').dispatch_event('click')
    page.wait_for_timeout(80)
    assert page.locator('#wikiRecords .wikiRecord').count()>36
    assert page.evaluate("window.scrollY")>=before_more-8, "Show more unexpectedly reset scroll"
    # Opening a reference and using the in-page Back button restores the previous reading spot.
    page.evaluate("window.scrollTo({top:610,behavior:'instant'})")
    read_top=page.evaluate("window.scrollY")
    page.locator('#wikiRecords .wikiRecord').nth(40).dispatch_event('click')
    page.wait_for_timeout(120)
    assert page.locator('.wikiReferencePage').count()==1
    assert page.locator('.wikiShareBtn[data-action="wikirefshare"]').count()==1, 'Codex reference is missing its share action'
    page.locator('.wikiReferencePage .wikiBack').dispatch_event('click')
    page.wait_for_timeout(170)
    assert page.locator('.wikiCategoryScroll a.active').inner_text().startswith('Class Skills')
    assert page.locator('#wikiRecords .wikiRecord').count()>36
    assert abs(page.evaluate("window.scrollY")-read_top)<=24, "Returning from Codex reference did not restore scroll"
    page.screenshot(path=str(OUT/'wiki_official_art_mobile.png'),full_page=True)

    # Pet tools are now two simple calculators plus four bonus choices inside Build Studio.
    page.evaluate("location.hash='#/calculators/pet'")
    page.wait_for_timeout(220)
    assert page.locator('#petCompoundRarity').count()==1
    assert '101%' in page.locator('.petMiniComparison').inner_text(), 'Pet Damage C10 should be 101%'
    page.locator('#petCompoundRarity').select_option('uncommon')
    page.locator('#petCompoundBonus').select_option('dodge')
    page.locator('#petCompoundLevel').fill('10')
    page.locator('#petCompoundLevel').press('Tab')
    page.wait_for_timeout(90)
    assert '12%' in page.locator('.petMiniComparison').inner_text(), 'Uncommon Dodge C10 should be 12%'
    page.evaluate("location.hash='#/calculators/affixes'")
    page.wait_for_timeout(200)
    assert page.locator('#petAffixType option').count()==9
    page.locator('#petAffixType').select_option('all_skills')
    assert page.locator('#petAffixTarget').input_value()=='2'
    assert '1,000' in page.locator('.petMiniBig').inner_text()
    page.evaluate("location.hash='#/labs/build'")
    page.wait_for_timeout(230)
    assert page.locator('[data-pet-bonus-target]').count()==4
    assert page.locator('[data-pet-name]').count()==0
    assert page.locator('.labsTabs [data-route="labs/pets"]').count()==0
    page.locator('[data-pet-bonus-target="0"]').select_option('pet_damage')
    assert page.locator('[data-pet-bonus-target="0"]').input_value()=='pet_damage'
    assert int(page.locator('.petBuildHead small').inner_text().split('/')[0])>=1
    page.screenshot(path=str(OUT/'pets_simplified_mobile.png'),full_page=True)

    # Editorial cross-links should open their tools and preserve the site theme.
    page.evaluate("location.hash='#/wiki/article?id=pet-compound'")
    page.wait_for_timeout(180)
    assert page.locator('.wikiConnections .wikiConnectionRow').count()>=1, 'Related Wiki guides missing'
    assert page.locator('.wikiSectionActions .arcanaConnection').count()>=2, 'Inline article links missing'
    assert page.locator('.wikiConnections [data-route="calculators/affixes"]').count()==1, 'Article does not link Pet Affix Cost'
    page.locator('.wikiConnections [data-route="calculators/affixes"]').dispatch_event('click')
    page.wait_for_timeout(180)
    assert page.locator('#petAffixType').count()==1, 'Related Pet Affix link is broken'
    assert page.locator('.arcanaNext').count()==1, 'Calculator follow-up links missing'
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Connected tool has horizontal overflow'
    page.screenshot(path=str(OUT/'connected_wiki_mobile.png'),full_page=True)

    # New guide pages expose exact content routes and focusable in-article navigation.
    page.evaluate("location.hash='#/wiki/guides'")
    page.wait_for_timeout(180)
    assert page.locator('.wikiGuideGroup').count()>=5, 'Guides are not grouped by topic'
    assert page.locator('[data-route="wiki/article"][data-params="id=forge"]').count()>=1, 'Forge guide missing'
    page.evaluate("location.hash='#/wiki/article?id=guild-planning'")
    page.wait_for_timeout(180)
    assert page.locator('.wikiShareBtn[data-action="wikishare"]').count()==1, 'Wiki guide is missing its share action'
    toc=page.locator('.wikiArticleToc')
    assert toc.count()==1 and toc.locator('button').count()==4, 'Guide contents navigation unavailable'
    page.locator('[data-action="wikisection"][data-arg="rank-unlocks"]').dispatch_event('click')
    page.wait_for_timeout(180)
    assert page.locator('#section-rank-unlocks h2').count()==1, 'Guide section jump did not resolve'
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Wiki article has horizontal overflow'
    page.screenshot(path=str(OUT/'wiki_guides_connected_mobile.png'),full_page=True)

    # Actual user-entered measurements drive the farming calculator. No assumed HP or XP.
    page.evaluate("location.hash='#/calculators/ml-farm'")
    page.wait_for_timeout(180)
    assert page.locator('.farmCompare').count()==1, 'ML farming comparator failed to open'
    assert page.locator('.farmWinner').count()==0, 'ML comparator should not invent a winner'
    page.locator('[data-farm-time="0"]').fill('0.7')
    page.locator('[data-farm-time="0"]').press('Tab')
    page.wait_for_timeout(130)
    page.locator('[data-farm-time="1"]').fill('1.1')
    page.locator('[data-farm-time="1"]').press('Tab')
    page.wait_for_timeout(160)
    assert page.locator('.farmWinner').count()==1, 'ML calculator did not evaluate measured times'
    assert 'Weakest monster' in page.locator('.farmWinner').inner_text(), 'ML comparison chose wrong result'
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'ML calculator has horizontal overflow'
    page.screenshot(path=str(OUT/'ml_farm_mobile.png'),full_page=True)

    page.evaluate("location.hash='#/recent'")
    page.wait_for_timeout(160)
    assert page.locator('.arcanaResume [data-route="calculators/ml-farm"]').count()==1, 'Recent Activity failed to resume saved farm times'
    page.locator('.arcanaResume [data-route="calculators/ml-farm"]').dispatch_event('click')
    page.wait_for_timeout(160)
    assert page.locator('[data-farm-time="0"]').input_value()=='0.7', 'Saved ML timing was lost'
    page.locator('[data-farm-mode][value="earlier"]').check()
    page.wait_for_timeout(140)
    assert page.locator('.farmRow small').first.inner_text()=='Normal XP', 'Earlier biome XP factor was not applied'
    page.locator('[data-action="farmreset"]').dispatch_event('click')
    page.wait_for_timeout(130)
    assert page.locator('.farmWinner').count()==0, 'Clearing farm timings did not reset the result'

    # Guild comparison: save a baseline, allocate one point, inspect the delta.
    page.evaluate("location.hash='#/labs/guild-tree'")
    page.wait_for_timeout(180)
    page.locator('.guildTreeTabs [data-arg="comparison"]').dispatch_event('click')
    page.wait_for_timeout(100)
    assert page.locator('[data-action="guildbaseline"]').count()==1, 'Guild comparison capture missing'
    page.locator('[data-action="guildbaseline"]').dispatch_event('click')
    page.wait_for_timeout(130)
    assert page.locator('.guildCompareTable').count()==3, 'Guild comparison baseline did not render'
    page.locator('.guildTreeTabs [data-arg="vanguard"]').dispatch_event('click')
    page.wait_for_timeout(100)
    page.locator('.guildTreeActions [data-action="guildpointadd"]').first.dispatch_event('click')
    page.wait_for_timeout(140)
    page.locator('.guildTreeTabs [data-arg="comparison"]').dispatch_event('click')
    page.wait_for_timeout(140)
    assert page.locator('.guildCompareRow strong.up').count()>=1, 'Guild comparison did not detect the changed bonus'
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Guild comparison causes page overflow'
    page.screenshot(path=str(OUT/'guild_comparison_mobile.png'),full_page=True)

    # Import Manager is an owner-only, browser-local XML conversion workflow.
    page.evaluate("location.hash='#/wiki/studio'")
    page.wait_for_timeout(300)
    assert page.locator('[data-ws-action="import-manager"]').count()==1, 'Fandom Import Manager shortcut missing'
    page.locator('[data-ws-action="import-manager"]').dispatch_event('click')
    page.wait_for_timeout(150)
    assert page.locator('#fandomXmlInput').count()==1, 'XML upload control did not open'
    sample_xml=('<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/">'
      '<siteinfo><sitename>IdleArc Wiki</sitename><base>https://idlearc.fandom.com/wiki/IdleArc_Wiki</base></siteinfo>'
      '<page><title>Test Pet Guide</title><ns>0</ns><revision><timestamp>2026-10-01T00:00:00Z</timestamp>'
      '<text>Every player can use this guide to plan the right combination of pets and bonuses.\n\n'
      '== How it works ==\nThis is a test of the imported guide data and the source attribution link.\n'
      '[[File:Pet Screenshot.png|thumb]]</text></revision></page></mediawiki>')
    page.locator('#fandomXmlInput').set_input_files({'name':'test-export.xml','mimeType':'text/xml','buffer':sample_xml.encode()})
    page.wait_for_timeout(250)
    assert page.locator('.fandomImportRow').count()==1, 'XML did not convert into a review row'
    assert 'Test Pet Guide' in page.locator('.fandomImportRow').inner_text()
    assert 'image reference' in page.locator('.fandomImportRow').inner_text().lower()
    assert page.locator('[data-fandom-action="save"]').count()==1, 'Private-draft save control missing'
    page.screenshot(path=str(OUT/'fandom_import_mobile.png'),full_page=True)
    # The beta must have an actual feedback form and account-free entry.
    page.evaluate("location.hash='#/beta'")
    page.wait_for_selector('[data-beta-form="feedback"]',timeout=10000)
    assert page.locator('.betaFeature').count()>=4, 'Beta availability information missing'
    assert 'not enabled' in page.locator('.betaCapabilities').inner_text(), 'Unconfigured account sign-in must not appear operational'
    page.locator('[name="title"]').fill('Codex issue on Android')
    page.locator('[name="details"]').fill('Changing categories moves the scroll unexpectedly; expected the selected category to stay visible.')
    page.locator('[data-beta-form="feedback"] button[type="submit"]').click()
    page.wait_for_timeout(350)
    assert 'Feedback received.' in page.locator('.betaCenter').inner_text(), 'Beta submission did not confirm: '+repr(page.locator('.betaCenter').inner_text()[-900:])+' JS errors '+repr(errors)
    assert page.locator('[data-beta-form="feedback"]').count()==1
    page.evaluate("location.hash='#/labs/build'")
    page.wait_for_selector('.studioProfile')
    assert page.locator('.studioTitleInput').input_value()=='My Build'
    assert '0 / 13 equipped' in page.locator('.studioEquipmentHeading').inner_text(), 'New user must start with empty build, not invented demo gear'
    assert page.locator('[data-action="sharebuild"]').count()==1, 'Guest build sharing is not available'
    assert page.locator('.loadoutSlot').count()==13, 'All verified equipment slots must remain available'
    assert page.locator('.loadoutSlot .arcanaSilhouette').count()==13, 'Equipment art must use understated silhouettes'
    assert page.locator('.studioProfileVisual .arcanaSilhouette').count()==1, 'Class identity emblem should be visible'
    assert page.locator('.studioProfile').bounding_box()['y']<page.locator('.studioPrimaryEquipment').bounding_box()['y'], 'Equipment should follow the compact profile'
    assert page.locator('.pageHead').count()==0, 'Build Studio must not show the old giant page heading'
    assert page.locator('.launchReturnHome').count()==0, 'Build Studio must not duplicate home navigation'

    token=page.evaluate("""async () => {
      const {shareBuildToken}=await import('@arcana/build-links.js');
      return await shareBuildToken({title:'Shared beta Warrior',className:'Warrior',
        equipment:{weapon:'game:item:claws',head:null},runes:[],pets:[],skills:[],monsterLevel:100});
    }""")
    assert len(token)<7500
    page.evaluate("(token) => {location.hash='#/labs/build?share='+encodeURIComponent(token)}",token)
    page.locator('[data-action="clonebuild"]').wait_for(timeout=7000)
    assert 'Shared beta Warrior' in page.locator('.studioProfile h1').inner_text(), 'Read-only shared build failed'
    assert page.locator('[data-action="sharebuild"]').count()==0, 'Shared build should be read-only'
    page.locator('[data-action="clonebuild"]').dispatch_event('click')
    page.wait_for_timeout(200)
    assert page.locator('[data-action="sharebuild"]').count()==1, 'Cloned build is not editable'
    assert page.locator('[data-build-field="title"]').count()==1, 'Build name editor missing'
    page.locator('[data-build-field="title"]').fill('My actual beta build')
    page.locator('[data-build-field="className"]').select_option('Druid')
    assert page.locator('.studioTitleInput').input_value()=='My actual beta build'
    assert page.locator('.studioClassControl select').input_value()=='Druid'
    assert page.locator('.studioProfileVisual .arcanaSilhouette').get_attribute('data-kind')=='druid', 'Class icon must update with the selected class'
    # This offline file:// fixture cannot access localStorage, so test the upload
    # controls here and exercise actual image persistence in the HTTPS live smoke.
    assert page.locator('#studioPortraitUpload').count()==1, 'Upload input missing'
    assert page.locator('[data-action="chooseportrait"]').count()==1, 'Change-picture action missing'
    page.screenshot(path=str(OUT/'build_studio_compact_mobile.png'),full_page=True)

    page.evaluate("location.hash='#/home'")
    page.wait_for_timeout(120)
    page.evaluate("location.hash='#/labs/build'")
    page.wait_for_timeout(120)
    assert page.locator('[data-build-field="title"]').input_value()=='My actual beta build', 'Build title changes did not persist'
    assert page.locator('[data-build-field="className"]').input_value()=='Druid', 'Build class changes did not persist'


    # Authenticated UI fixture: verify account pages render genuine member features.
    page.evaluate("""() => {
      const previous=window.fetch;
      const member={id:'11111111-1111-4111-8111-111111111111',displayName:'Arcana Beta Player',
        inGameName:'Hero',guild:'PDX',favoriteClass:'Druid',description:'Testing Arcana.',
        roles:[{id:'member',label:'Arcana Member'},{id:'beta-tester',label:'Founding Beta Tester'}],
        betaTesterSince:'2026-10-12T00:00:00Z',
        permissions:{createCommunity:true,publishWiki:false,hideContent:false,deleteContent:false,manageRoles:false}};
      window.fetch=async (url,opts={})=>{
        const path=String(url);
        const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
        if(path==='/api/account/me')return json({enabled:true,betaEnrollmentOpen:true,user:member});
        if(path==='/api/community/mine')return json({posts:[]});
        if(path==='/api/account/builds'&&opts.method==='POST')return json({build:{id:'22222222-2222-4222-8222-222222222222',title:'My actual beta build',className:'Druid',updatedAt:'2026-10-12T00:00:00Z'}},201);
        if(path==='/api/account/builds')return json({builds:[]});
        return previous(url,opts);
      };
    }""")
    page.evaluate("""async () => {
      const {refreshAccount}=await import('@arcana/community-ui.js');
      await refreshAccount();
      location.hash='#/account';
    }""")
    page.locator('.playerCard').wait_for(timeout=5000)
    assert 'Founding Beta Tester' in page.locator('.playerCard').inner_text(), 'Permanent beta badge not visible on profile'
    assert page.locator('.accountCloudBuilds').count()==1, 'Account-owned cloud build management missing'
    assert page.locator('#arcanaAvatarFile').count()==1, 'Custom player card picture not available'
    page.locator('[data-cloud-action="new"]').dispatch_event('click')
    page.wait_for_timeout(240)
    assert page.locator('.accountCloudRow').count()==1, 'Account build save did not render in profile'
    page.screenshot(path=str(OUT/'account_beta_member_mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'), 'Authenticated account screen horizontal overflow'

    assert errors==[], 'JavaScript exceptions: '+repr(errors)
    print(json.dumps({'status':'PASS','modules_loaded':len(IMPORTS),'footer':'PASS','category_count':len(all_names),'scroll_before':before,'scroll_after':after,'uncaught_js_errors':len(errors),'official_art_fixture_rendered':True,'live_api_artwork_tested':False},indent=2))
    browser.close()
