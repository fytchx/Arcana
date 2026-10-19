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
for css_name in ('styles.css','wiki-studio.css','community.css','guild-hub.css','guild-crest-workshop.css','beta.css','launch-navigation.css','pathfinder-timeline.css','quick-tools.css','arcana-contour.css','theme-studio-finishes.css','signature-themes.css','theme-seamless.css','psychedelic-themes.css','home-three.css','traffic.css','admin.css','journal-widgets.css'):
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
 if(path.includes('/api/guild-hub/')) return new Response(JSON.stringify({guild:__MOCK_GUILD__}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guild-hub')) return new Response(JSON.stringify({guilds:[__MOCK_GUILD__]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/guilds')) return new Response(JSON.stringify({guilds:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/api/lfg/public')) return new Response(JSON.stringify({listings:[],plans:[],issues:[]}),{status:200,headers:{'content-type':'application/json'}});
 if(path.includes('/official-art/manifest.json')) return new Response(JSON.stringify(__MOCK_ART__),{status:200,headers:{'content-type':'application/json'}});
 return new Response('Unavailable in isolated QA',{status:404});
};
</script><script type="module">import '@arcana/app.js';</script></body>''')
MOCK_GUILD={'id':'11111111-1111-4111-8111-111111111111','name':'QA Test Guild','tag':'TEST','bio':'Mobile Guild Hub QA','status':'approved','crest':{'center':0,'secondary':1,'outline':0,'border':0,'colors':['#CCCCCC','#999999','#444444','#EEEEEE']},'tagStyle':{'color':'#D2B2FF','finish':'glow'},'recruitmentOpen':True,'memberCount':2,'members':[{'id':'22222222-2222-4222-8222-222222222222','name':'Sample Guild Leader','role':'owner','joinedAt':'2026-10-18T00:00:00Z'}],'posts':[],'amMember':False,'canManage':False,'myApplication':None,'iconDataUrl':''}
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
    page.route(re.compile(r'^http://127\\.0\\.0\\.1:17653/\\?arcanaMiniPreview=1'),lambda route:route.fulfill(status=200,body=HTML,content_type='text/html'))
    page.goto(qa_origin,wait_until='domcontentloaded')
    page.set_content(HTML,wait_until='domcontentloaded')
    try:
        page.wait_for_selector('.launchHero',timeout=15000)
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
    # The real October 17 release ships three main cards, not the legacy six-card menu.
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.launchHero',timeout=8000)
    assert page.locator('#arcanaDock button').count()==5
    assert page.locator('#arcanaDock [data-dock="home"]').get_attribute('aria-current')=='page'
    assert page.locator('#arcanaDock [data-dock="community"]').count()==1
    assert page.locator('#arcanaDock [data-dock="directory"]').count()==1
    assert 'Community' in page.locator('#arcanaDock').inner_text()
    assert 'Directory' in page.locator('#arcanaDock').inner_text()
    assert 'Profile' not in page.locator('#arcanaDock').inner_text()
    assert 'Options' not in page.locator('#arcanaDock').inner_text()
    assert page.locator('.launchQuickCard').count()==3
    assert page.locator('.launchHeroCTA[data-route="labs/build"]').count()==1
    assert page.locator('.journalHomeTeaser').count()==1
    assert page.locator('.homeSpotlights > section').count()==2
    hero_heights=page.locator('.homeSpotlights > section').evaluate_all('(els)=>els.map(e=>e.getBoundingClientRect().height)')
    assert abs(hero_heights[0]-hero_heights[1])<28, 'Studio and Journal must be comparably prominent'
    assert page.locator('[data-journal-latest]').get_attribute('href')=='/journal/idlearc-1-3-7-the-timing-couldnt-be-better'
    assert page.locator('[data-journal-latest]').get_attribute('href').startswith('/journal/')
    assert 'IdleArc 1.3.7' in page.locator('[data-journal-latest]').inner_text()
    assert page.locator('.launchQuickCard[data-arg="pathfinder"]').count()==1
    assert page.locator('.launchQuickCard[data-arg="tools"]').count()==1
    assert page.locator('.launchQuickCard[data-arg="builds"]').count()==1
    page.screenshot(path=str(OUT/'journal_home_mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Homepage overflows mobile viewport'

    # Community is a proper gateway to public editorial content while preserving builds.
    page.locator('#arcanaDock [data-dock="community"]').click()
    page.wait_for_selector('.communityPage',timeout=8000)
    assert page.locator('.communityJournalGateway a[href="/journal"]').count()==1
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
    assert page.locator('.guildHubTile svg.arcanaGuildCrest').count()==1, 'Official guild crest missing from directory'
    assert page.locator('.guildHubTile .arcanaGuildTag.isOfficial').count()==1
    page.locator('.guildHubTile [data-route="guilds/view"]').click()
    page.wait_for_selector('.guildHubCover',timeout=8000)
    assert 'QA Test Guild' in page.locator('.guildHubCover').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Guild page overflows mobile viewport'
    page.locator('.guildHubBack').click()
    page.wait_for_selector('.guildHubTile',timeout=8000)
    page.evaluate("location.hash='#/guilds/crest'")
    page.wait_for_selector('.crestStudio',timeout=8000)
    assert page.locator('[data-crest-choose="center"]').count()==25, 'Crest Studio main-shape library missing'
    assert page.locator('[data-crest-choose="secondary"]').count()==25, 'Accent-shape library missing'
    assert page.locator('[data-crest-choose="outline"]').count()==10, 'Outline library missing'
    assert page.locator('[data-crest-choose="border"]').count()==10, 'Border library missing'
    page.locator('[data-crest-choose="center"][data-value="8"]').click()
    assert page.locator('[data-crest-choose="center"][data-value="8"]').get_attribute('aria-pressed')=='true'
    page.locator('[data-crest-palette="2"]').click()
    assert page.locator('[data-crest-preview] svg').count()>=1
    page.screenshot(path=str(OUT/'guild-crest-studio-mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Crest Designer overflows mobile viewport'

    page.locator('#arcanaDock [data-dock="featured"]').click()
    page.wait_for_selector('.arcanaFeaturedPage',timeout=8000)
    assert 'Arcana Journal' in page.locator('.arcanaFeaturedPage').inner_text()

    page.locator('#arcanaDock [data-dock="home"]').click()
    page.locator('.launchHeroCTA').click()
    page.wait_for_selector('.studioProfile',timeout=8000)
    assert page.locator('#arcanaDock button').count()==5, 'Navigation disappeared in Build Studio'

    page.evaluate("location.hash='#/settings'")
    page.wait_for_selector('.arcanaSettings',timeout=8000)
    assert page.locator('[data-app-pref="reduceMotion"]').count()==1
    assert page.locator('.slateAccentChoice').count()==0
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Settings overflows mobile viewport'
    # Preview-only, browser-local art sandbox: no authenticated write path is used.
    page.evaluate("location.hash='#/theme-playground'")
    page.wait_for_selector('.themePlayground',timeout=8000)
    assert page.locator('.designPresetSignature').count()==24
    assert page.locator('.designPsychedelicGrid .designPresetSignature').count()==4
    live=page.frame_locator('[data-mini-live-frame]')
    try:
        live.locator('#content.homeFullscreen .launchHero').wait_for(timeout=12000)
    except Exception:
        print('LIVE FRAME DEBUG',page.locator('[data-mini-live-frame]').evaluate("""el=>({url:el.src,docURL:el.contentDocument?.URL,body:el.contentDocument?.body?.innerText?.slice(0,1400),ready:el.contentDocument?.readyState,content:el.contentDocument?.querySelector('#content')?.innerHTML?.slice(0,900)})"""))
        print('LIVE FRAME PAGE ERRORS',repr(errors))
        raise
    assert live.locator('body').count()==1, 'Theme preview failed to load the real current Arcana page'
    page.screenshot(path=str(OUT/'current-arcana-live-mini.png'),full_page=True)
    assert page.locator('.designClassicCollection .designPreset').count()==18
    assert page.locator('[data-theme-save]').count()==12
    page.locator('.designPresetSignature[data-arg="astral"]').click()
    assert page.locator('html').get_attribute('data-arcana-design-pattern')=='astral-sovereign'
    assert page.evaluate("getComputedStyle(document.querySelector('.designPresetArt')).backgroundImage.includes('gradient')")
    assert page.locator('[data-mini-canvas]').get_attribute('data-mini-pattern')=='astral-sovereign'
    page.locator('[data-design-field="aura"]').evaluate("el=>{el.value='77';el.dispatchEvent(new Event('input',{bubbles:true}))}")
    assert page.evaluate("JSON.parse(localStorage.getItem('arcana-admin-design-preview-v1')).aura")==77
    page.locator('[data-action="random-signature"]').click()
    assert page.locator('html').get_attribute('data-arcana-design-pattern')!='astral-sovereign'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'), 'Signature Playground overflows mobile viewport'
    # Actual Chromium paint-layer checks: no square tile boundaries on any material family.
    for texture in ('astral-sovereign','abyssal-bloom','moire','grid','fog','contours'):
        page.locator('[data-theme-pattern="'+texture+'"]').evaluate('el=>el.click()')
        page.wait_for_timeout(70)
        fields=page.evaluate("""() => {
            const card=document.querySelector('.miniCanvas .miniHome .miniHero');
            const style=getComputedStyle(card,'::before');
            const thumb=document.querySelector('.themePatternThumb[data-preview-pattern="'+document.documentElement.dataset.arcanaDesignPattern+'"]');
            const thumbStyle=thumb?getComputedStyle(thumb):null;
            return {pattern:document.querySelector('[data-mini-canvas]').dataset.miniPattern,
                repeat:style.backgroundRepeat,size:style.backgroundSize,image:style.backgroundImage,
                mask:style.maskImage,thumbRepeat:thumbStyle?.backgroundRepeat,thumbSize:thumbStyle?.backgroundSize};
        }""")
        assert fields['pattern']==texture, 'Mini preview out of sync: '+str(fields)
        assert 'gradient' in fields['image'], 'Missing texture image: '+texture
        assert set(fields['repeat'].split(', '))=={'no-repeat'}, 'Texture tiles on '+texture+': '+str(fields)
        assert set(fields['size'].split(', '))=={'100% 100%'}, 'Texture cuts off on '+texture+': '+str(fields)
        assert set(fields['thumbRepeat'].split(', '))=={'no-repeat'}, 'Finish thumbnail tiles on '+texture
        assert set(fields['thumbSize'].split(', '))=={'100% 100%'}, 'Finish thumb cutoff on '+texture
        if texture in ('astral-sovereign','moire','contours'):
            page.screenshot(path=str(OUT/('seamfree-'+texture+'.png')),full_page=True)
    # Restore the Signature look for a full-site test.
    page.locator('[data-theme-pattern="astral-sovereign"]').evaluate('el=>el.click()')
    page.screenshot(path=str(OUT/'signature-playground-mobile.png'),full_page=True)
    page.locator('[data-action="theme-try-on"]').click()
    page.wait_for_selector('.launchHero',timeout=8000)
    assert page.locator('html').get_attribute('data-arcana-design-active')=='true', 'Try-on must apply the homepage theme'
    assert page.locator('html').get_attribute('data-arcana-admin-design')=='false', 'Try-on must not elevate admin privileges'
    assert page.evaluate("getComputedStyle(document.querySelector('.launchHero'),'::after').backgroundImage.includes('gradient')"), 'Try-on must style the actual homepage'
    real=page.evaluate("""() => {const css=getComputedStyle(document.querySelector('.launchHero'),'::after');return {repeat:css.backgroundRepeat,size:css.backgroundSize}}""")
    assert set(real['repeat'].split(', '))=={'no-repeat'} and set(real['size'].split(', '))=={'100% 100%'}, 'Real homepage still has a tiling seam: '+str(real)
    page.evaluate("location.hash='#/theme-playground'")
    page.wait_for_selector('.themePlayground',timeout=8000)
    page.locator('[data-action="theme-try-off"]').click()
    page.evaluate("location.hash='#/home'")
    page.wait_for_selector('.launchHero',timeout=8000)
    assert page.locator('html').get_attribute('data-arcana-design-active')!='true', 'Leaving Playground must disable local try-on'
    assert errors==[], 'Browser errors: '+repr(errors)
    print('PASS: latest three-card home, Journal spotlight, Community, Directory, Featured, Build Studio, settings, responsive checks and all themes.')
    browser.close()

