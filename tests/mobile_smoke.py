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
# Render every stylesheet linked by the real entry point so QA follows the app's
# current modular design layers automatically.
for href in re.findall(r'<link rel="stylesheet" href="([^"]+)"', HTML):
    css_name=urlparse(href).path.lstrip('/')
    css=(ROOT/css_name).read_text()
    pattern='<link rel="stylesheet" href="'+re.escape(href)+'">'
    HTML,count=re.subn(pattern,lambda _: '<style>'+css+'</style>',HTML)
    assert count==1, 'Stylesheet should appear exactly once: '+href
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
 if(path.includes('/api/guild-hub/')) return new Response(JSON.stringify({guild:__MOCK_GUILD__}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guild-hub')) return new Response(JSON.stringify({guilds:[__MOCK_GUILD__]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guilds')) return new Response(JSON.stringify({guilds:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/lfg/public')) return new Response(JSON.stringify({listings:[],plans:[],issues:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/official-art/manifest.json')) return new Response(JSON.stringify(__MOCK_ART__),{status:200,headers:{'content-type':'application/json'}});
 return new Response('Unavailable in isolated QA',{status:404});
};
</script><script type="module">import '@arcana/app.js';</script></body>''')
MOCK_GUILD={'id':'11111111-1111-4111-8111-111111111111','name':'QA Test Guild','tag':'TEST','bio':'Mobile Guild Hub QA','status':'approved','tagStyle':{'color':'#D2B2FF','finish':'glow'},'recruitmentOpen':True,'memberCount':2,'members':[{'id':'22222222-2222-4222-8222-222222222222','name':'Sample Guild Leader','role':'owner','joinedAt':'2026-10-18T00:00:00Z'}],'posts':[],'amMember':False,'canManage':False,'myApplication':None}
HTML=HTML.replace('__MOCK_ENTRIES__',json.dumps(MOCK_ENTRIES)).replace('__MOCK_ART__',json.dumps(MOCK_ART)).replace('__MOCK_GUILD__',json.dumps(MOCK_GUILD))

args=['--no-sandbox','--disable-dev-shm-usage']
executable=shutil.which('chromium') or shutil.which('google-chrome') or None
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True, executable_path=executable, args=args)
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.set_default_timeout(3000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    # Browser localStorage is prohibited on about:blank in current Chromium.
    # Keep the mock page isolated but give it a real HTTP origin.
    qa_origin='http://127.0.0.1:17653/__arcana_qa_blank__'
    page.route(qa_origin,lambda route:route.fulfill(status=200,body='<!doctype html><html><body></body></html>',content_type='text/html'))
    # The real-page theme miniature navigates a same-origin iframe. Serve this identical
    # compiled offline Arcana entrypoint there rather than letting Chromium hit an empty port.
    frame_requests=[]
    def serve_mini_frame(route):
        frame_requests.append(route.request.url)
        route.fulfill(status=200,body=HTML,content_type='text/html')
    page.route(re.compile(r'^http://127\.0\.0\.1:17653/\?arcanaMiniPreview=1'),serve_mini_frame)
    page.goto(qa_origin,wait_until='domcontentloaded')
    page.set_content(HTML,wait_until='domcontentloaded')
    try:
        page.wait_for_selector('.atlasHero',timeout=15000)
    except Exception:
        print('EARLY ARCANA ERRORS:',repr(errors))
        print('EARLY BODY:',page.locator('body').inner_text()[:2000])
        raise
    assert page.locator('#arcanaDock button').count()==5, 'All five navigation tabs must exist'
    assert page.locator('#generalChatBtn').is_visible(), 'General chat launcher missing'
    page.evaluate("location.hash='#/settings'")
    page.wait_for_selector('.arcanaSignature',timeout=8000)
    assert errors==[], 'App failed to initialize: '+repr(errors)
    assert page.locator('.skipMain').count()==1, 'Accessible skip navigation missing'
    # The loading screen deliberately shields all controls until fully removed.
    page.wait_for_selector('#arcanaBoot',state='detached',timeout=15000)
    assert not page.locator('#app').get_attribute('inert'), 'Homepage must unlock after splash exits'
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
    # Current Atlas Home: six destinations, a Build Studio feature, Journal, and connected links.
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.atlasHero',timeout=8000)
    assert page.locator('#arcanaDock button').count()==5
    assert page.locator('#arcanaDock [data-dock="home"]').get_attribute('aria-current')=='page'
    assert 'Community' in page.locator('#arcanaDock').inner_text()
    assert 'Directory' in page.locator('#arcanaDock').inner_text()
    assert 'Profile' not in page.locator('#arcanaDock').inner_text()
    assert 'Options' not in page.locator('#arcanaDock').inner_text()
    assert page.locator('.atlasHeroGo[data-route="labs/build"]').count()==1
    assert page.locator('.atlasTile').count()==6, 'All six primary Home destinations must render'
    assert page.locator('.atlasJournal').count()==1
    assert page.locator('.atlasJournalStory').count()==1
    assert page.locator('.atlasJournalMore .atlasJournalExtra').count()==1
    assert page.locator('.atlasFeatureLink').count()==2, 'Featured guide and Community links must render'
    assert page.locator('.atlasConvergenceFeature').count()==1, 'Convergence guide must be featured on Home'
    assert page.locator('[data-journal-latest]').get_attribute('href')=='/#/journal/article?slug=idlearc-1-3-7-the-timing-couldnt-be-better'
    assert 'IdleArc 1.3.7' in page.locator('[data-journal-latest]').inner_text()
    assert page.locator('.atlasTile[data-route="calculators/pathfinder"]').count()==1
    assert page.locator('.atlasTile[data-action="homemenu"][data-arg="tools"]').count()==1
    assert page.locator('.atlasTile[data-route="community"]').count()==1
    page.screenshot(path=str(OUT/'journal_home_mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Homepage overflows mobile viewport'

    # Community is a proper gateway to public editorial content while preserving builds.
    page.locator('#arcanaDock [data-dock="community"]').click()
    page.wait_for_selector('.communityPage',timeout=8000)
    assert page.locator('.communityPathways a[href="/journal"]').count()==1
    assert page.locator('.communityPathway').count()==4
    assert page.locator('.communityPathways [data-route="wiki/guides"]').count()==1
    assert 'Player builds' in page.locator('.communityPage').inner_text()
    assert page.locator('#arcanaDock [data-dock="community"]').get_attribute('aria-current')=='page'
    page.screenshot(path=str(OUT/'journal_community_mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Community overflows mobile viewport'

    # Directory must go to the actual A-Z directory, not open old Options sheet.
    page.locator('#arcanaDock [data-dock="directory"]').click()
    page.wait_for_selector('.launchAlphabet',timeout=8000)
    assert page.locator('.launchAlphabet').get_by_text('Arcana Journal').count()>=1
    assert page.locator('#arcanaDock [data-dock="directory"]').get_attribute('aria-current')=='page'

    page.evaluate("location.hash='#/guilds'")
    page.wait_for_selector('.guildHubTile',timeout=8000)
    assert '2–4 letter' in page.locator('.guildHubTagIntro').inner_text()
    assert page.locator('.guildHubTile svg.arcanaGuildCrest').count()==0, 'Retired guild crest is still visible'
    assert page.locator('.guildHubTile .arcanaGuildTag.isOfficial').count()==1
    page.locator('.guildHubTile [data-route="guilds/view"]').click()
    page.wait_for_selector('.guildHubCover',timeout=8000)
    assert 'QA Test Guild' in page.locator('.guildHubCover').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Guild page overflows mobile viewport'
    page.locator('.guildHubBack').click()
    page.wait_for_selector('.guildHubTile',timeout=8000)
    # The retired designer route must not expose any crest UI.
    page.evaluate("location.hash='#/guilds/crest'")
    page.wait_for_selector('.guildHubTagIntro',timeout=8000)
    assert page.locator('.crestStudio, .arcanaGuildCrest, [data-crest-workshop]').count()==0
    assert page.locator('[data-route="guilds/crest"]').count()==0
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Guild directory overflows mobile viewport'
    page.screenshot(path=str(OUT/'guild-tags-only-mobile.png'),full_page=True)
    # Real desktop viewport: all primary destinations use the wider grid without overflow.
    page.set_viewport_size({'width':1440,'height':900})
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.atlasHome .atlasHero',timeout=15000)
    assert page.locator('.atlasHome .atlasFeatureLink').count()==2, 'Desktop Home guide/community links missing'
    assert page.locator('#content.homeFullscreen').evaluate('e=>e.getBoundingClientRect().width')>=900, 'Desktop content too narrow'
    columns=page.locator('.atlasTileGrid').evaluate('e=>getComputedStyle(e).gridTemplateColumns.split(" ").length')
    assert columns==3, 'Desktop Home should present destinations in three columns'
    assert page.locator('.atlasTileCopy strong').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')>=18, 'Desktop destination labels are too small'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Desktop homepage horizontal overflow'
    page.screenshot(path=str(OUT/'desktop-home-full.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})



    page.locator('#arcanaDock [data-dock="search"]').click()
    page.wait_for_selector('#globalSearch',timeout=8000)
    assert page.locator('#globalSearch').evaluate('e=>document.activeElement===e'), 'Search must open ready to type'
    assert page.locator('.arcanaSearchDiscoverGrid').count()==0, 'Search should not contain the retired explorer menu'
    page.locator('#globalSearch').fill('Pathfinder')
    assert page.locator('.arcanaSearchDiscover').count()==0, 'Featured suggestions must disappear when typing'
    assert page.locator('#searchResults').count()==1
    page.locator('#globalSearch').fill('')
    assert page.locator('.arcanaSearchHint').count()==1, 'Clearing search should restore the search hint'
    page.locator('#layer [data-close]').first.click()

    # The Home hero CTA is already asserted to target labs/build above. Exercise
    # the destination directly here so a synthetic mobile tap cannot flake the smoke.
    page.evaluate("location.hash='#/labs/build'")
    try:
        page.wait_for_selector('.studioPage .studioProfileGroup',timeout=8000)
    except Exception:
        print('BUILD STUDIO ROUTE DEBUG:', page.evaluate("({hash:location.hash, route:document.querySelector('#content')?.innerText?.slice(0,1400), dock:document.querySelector('#arcanaDock')?.innerText})"))
        print('BUILD STUDIO PAGE ERRORS:', repr(errors))
        print('BUILD STUDIO MARKUP:', page.locator('#content').inner_html()[:1600])
        raise
    assert page.locator('#arcanaDock button').count()==5, 'Navigation disappeared in Build Studio'
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
    page.wait_for_selector('.studioPage .studioProfileGroup')
    assert page.locator('.studioContextName').input_value()=='My Build'
    assert '0 / 11 equipped' in page.locator('.studioEquipmentHeading').inner_text(), 'New user must start with empty build, not invented demo gear'
    assert page.locator('[data-action="sharebuild"]').count()==1, 'Guest build sharing is not available'
    assert page.locator('.loadoutSlot').count()==11, 'Only the eleven verified game equipment slots must be shown'
    assert page.locator('.loadoutSlot .arcanaSilhouette').count()==11, 'Equipment art must use understated silhouettes'
    assert page.locator('.studioContextAvatar .arcanaSilhouette').count()==1, 'Class identity emblem should be visible'
    assert page.locator('.studioProfileGroup').bounding_box()['y']<page.locator('.studioPrimaryEquipment').bounding_box()['y'], 'Equipment should follow the compact profile'
    assert page.locator('.pageHead').count()==0, 'Build Studio must not show the old giant page heading'
    assert page.locator('.launchReturnHome').count()==0, 'Build Studio must not duplicate home navigation'

    page.evaluate("location.hash='#/settings'")
    page.wait_for_selector('.arcanaSettings',timeout=8000)
    assert page.locator('[data-app-pref="reduceMotion"]').count()==1
    assert page.locator('.slateAccentChoice').count()==0
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Settings overflows mobile viewport'
    # Preview-only, browser-local art sandbox: verify the current Theme Studio v2.
    page.evaluate("location.hash='#/theme-playground'")
    page.wait_for_selector('.themePlayground',timeout=8000)
    expected_presets=page.evaluate("async()=> (await import('@arcana/studio-v2-presets.js')).STUDIO_V2_PRESET_IDS.length")
    expected_art=page.evaluate("async()=> (await import('@arcana/visual-art.js')).VISUAL_ART.length")
    assert page.locator('.studioV2PresetGrid .studioV2Preset').count()==expected_presets
    assert page.locator('.studioV2ArtworkSection .visionArtChoice').count()==expected_art
    assert page.locator('.visionArtThumb[data-preview-pattern]').count()==expected_art, 'Theme artwork previews are missing'
    assert page.locator('.themeStudioPreview [data-mini-live-frame]').count()==1, 'Current Arcana preview iframe missing'
    if page.locator('[data-mini-toggle]').get_attribute('aria-expanded')=='false':
        page.locator('[data-mini-toggle]').click()
    live=page.frame_locator('[data-mini-live-frame]')
    live.locator('#content.homeFullscreen .atlasHero').wait_for(timeout=12000)
    assert live.locator('body').count()==1, 'Theme preview failed to load the current Arcana page'
    page.screenshot(path=str(OUT/'current-arcana-live-mini.png'),full_page=True)
    # Applying a curated look must update its selected state and stay browser-local.
    target=page.locator('.studioV2Preset[aria-pressed="false"]').first
    target_id=target.get_attribute('data-arg')
    target.click()
    page.wait_for_function("id => Array.from(document.querySelectorAll('.studioV2Preset')).some(el => el.dataset.arg === id && el.getAttribute('aria-pressed') === 'true')",arg=target_id)
    assert page.locator('.studioV2Preset[aria-pressed="true"]').count()==1
    assert page.locator('[data-theme-save]').count()==12
    strength=page.locator('.studioV2 [data-design-field="artStrength"]')
    strength.evaluate("el=>{el.value='77';el.dispatchEvent(new Event('input',{bubbles:true}))}")
    assert page.evaluate("JSON.parse(localStorage.getItem('arcana-admin-design-preview-v1')).artStrength")==77
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Theme Studio overflows mobile viewport'
    # Theme preview must stay alongside the editor while scrolling on desktop.
    page.set_viewport_size({'width':1360,'height':860})
    page.evaluate('window.scrollTo(0,520)')
    page.wait_for_timeout(200)
    top_a=page.locator('.themeStudioPreview').evaluate('e=>e.getBoundingClientRect().top')
    page.evaluate('window.scrollTo(0,1050)')
    page.wait_for_timeout(200)
    top_b=page.locator('.themeStudioPreview').evaluate('e=>e.getBoundingClientRect().top')
    assert abs(top_a-top_b)<50, 'Desktop theme preview does not follow the editor scroll: '+repr((top_a,top_b))
    page.screenshot(path=str(OUT/'theme-desktop-sticky-preview.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate('window.scrollTo(0,0)')

    page.locator('[data-action="theme-try-on"]').click()
    page.wait_for_selector('.atlasHero',timeout=8000)
    assert page.locator('html').get_attribute('data-arcana-design-active')=='true', 'Try-on must apply the homepage theme'
    assert page.locator('html').get_attribute('data-arcana-admin-design')=='false', 'Try-on must not elevate admin privileges'
    assert page.evaluate("getComputedStyle(document.querySelector('#content.homeFullscreen')).backgroundImage.includes('gradient')"), 'Try-on must style the actual homepage'
    real=page.evaluate("""() => {const css=getComputedStyle(document.querySelector('#content.homeFullscreen'));return {repeat:css.backgroundRepeat,size:css.backgroundSize}}""")
    assert set(real['repeat'].split(', '))=={'no-repeat'} and set(real['size'].split(', '))=={'100% 100%'}, 'Real homepage still has a tiling seam: '+str(real)
    page.evaluate("location.hash='#/theme-playground'")
    page.wait_for_selector('.themePlayground',timeout=8000)
    page.locator('[data-action="theme-try-off"]').click()
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.atlasHero',timeout=8000)
    assert page.locator('html').get_attribute('data-arcana-design-active')!='true', 'Leaving Playground must disable local try-on'
    # Synthetic authenticated QA browser, NOT the owner's real session or credentials.
    # Header admin access must be based on server-returned roles; guest stays hidden.
    assert page.locator('#adminPortalBtn').is_hidden(), 'Guest should never see admin controls'
    admin_html=HTML.replace("if(path.includes('/api/wiki/import-access'))",
        "if(path.includes('/api/account/me')) return new Response(JSON.stringify({user:{id:'qa-admin',displayName:'Arcana QA Admin',roles:[{id:'admin'}]},enabled:true}),{status:200,headers:{'content-type':'application/json'}}); if(path.includes('/api/wiki/import-access'))")
    admin_page=browser.new_page(viewport={'width':390,'height':844})
    admin_page.route(qa_origin,lambda route:route.fulfill(status=200,body=admin_html,content_type='text/html'))
    admin_page.goto(qa_origin,wait_until='domcontentloaded')
    admin_page.locator('#adminPortalBtn').wait_for(state='visible',timeout=12000)
    admin_page.wait_for_selector('#arcanaBoot',state='detached',timeout=15000)
    admin_page.locator('#adminPortalBtn').evaluate('el=>el.click()')
    admin_page.wait_for_selector('.adminConsole',timeout=10000)
    assert 'Admin Control Center' in admin_page.locator('.adminConsole h1').inner_text()
    admin_page.close()
    assert errors==[], 'Browser errors: '+repr(errors)
    print('PASS: current Atlas Home, Journal, Community, Directory, Featured, Build Studio, settings, responsive checks and themes.')
    browser.close()

