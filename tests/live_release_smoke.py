"""Read-only public production smoke. Retries during the auto-deployment cutover."""
import json,time
from playwright.sync_api import sync_playwright

URL='https://arcanacompanion.xyz'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 ok=False;notes=[]
 for attempt in range(12):
  try:
   # Unique query forces a real network fetch on each retry. A same-URL
   # hash navigation returns None instead of an HTTP response in Chromium.
   response=page.goto(URL+'/?releaseProbe='+str(attempt)+'#/guilds',wait_until='domcontentloaded',timeout=20000)
   if not response or response.status!=200:raise AssertionError('HTTP '+str(response.status if response else None))
   page.locator('.guildHubTagIntro').wait_for(timeout=9000)
   assert page.locator('.crestStudio,.arcanaGuildCrest').count()==0,'Crest designer returned'
   assert page.locator('.guildHubPage').count()==1
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'),'Mobile overflow'
   result=page.evaluate("""async()=>{let api=await fetch('/api/guild-hub',{cache:'no-store'});let css=await fetch('/psychedelic-themes.css',{cache:'no-store'});let js=await fetch('/src/psychedelic-patterns.js',{cache:'no-store'});return {api:api.status,css:css.status,js:js.status,data:api.ok?await api.json():null}}""")
   assert result['api']==200 and isinstance(result['data'].get('guilds'),list),result
   assert result['css']==200 and result['js']==200,result
   page.goto(URL+'/#/home',wait_until='domcontentloaded',timeout=20000)
   page.locator('#content.homeFullscreen .launchHero').wait_for(timeout=9000)
   assert page.locator('[data-mini-live-frame],.arcanaDesignLab').count()==0,'Theme designer loaded for public visitor'
   page.goto(URL+'/#/calculators/pathfinder',wait_until='domcontentloaded',timeout=20000)
   assert page.locator('#content').count()==1
   page.goto(URL+'/#/wiki',wait_until='domcontentloaded',timeout=20000)
   assert page.locator('#content').count()==1
   ok=True
   print('PUBLIC PRODUCTION SMOKE PASSED',json.dumps({'attempt':attempt+1,'guildAPI':result['api'],'psyCSS':result['css'],'psyJS':result['js'],'guildCount':len(result['data']['guilds']),'home':'ok','pathfinder':'ok','wiki':'ok'}))
   break
  except Exception as ex:
   notes.append(str(ex)[:350]);print('Production cutover attempt',attempt+1,'not yet ready:',notes[-1])
   if attempt<11:time.sleep(10)
 browser.close()
 if not ok:raise RuntimeError('Public production smoke failed after retries: '+repr(notes[-4:]))
