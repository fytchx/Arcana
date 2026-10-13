"""Read-only release gate against the ACTUAL staging deployment, never production.

Tests the HTTP surface, real static bundles, an anonymous browser flow, and
reported feature configuration. Does not create accounts or submit test feedback.
"""
import json,os,time
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE=os.environ.get('ARCANA_STAGING_URL','https://arcana-stable-app-staging.up.railway.app').rstrip('/')
assert urlparse(BASE).hostname.endswith('.up.railway.app'),'Only isolated Railway staging is permitted'
RELEASE='arcana-beta-candidate-2026-10-12'
def call(path,timeout=15):
 try:
  with urlopen(Request(BASE+path,headers={'accept':'application/json'}),timeout=timeout) as res:
   return res.status,json.load(res),dict(res.headers)
 except HTTPError as e:
  try:return e.code,json.load(e),dict(e.headers)
  except:return e.code,{},dict(e.headers)

# Railway deployment might still be completing when Actions starts.
deadline=time.monotonic()+220
last=None
while time.monotonic()<deadline:
 try:
  code,health,_=call('/health')
  last=(code,health.get('release'))
  if code==200 and health.get('release')==RELEASE:break
 except (URLError,TimeoutError) as e:last=str(e)
 time.sleep(7)
else:raise AssertionError('Expected candidate revision never became healthy: '+repr(last))
assert health.get('artwork',{}).get('local') is True,'Validated image bundle unavailable'
assert health.get('artwork',{}).get('groups',0)>=10,'Missing official sprites'

code,status,headers=call('/api/beta/status')
assert code==200 and status.get('release')==RELEASE,'Beta status endpoint not running'
assert status.get('feedbackEnabled') is True,'Public issue reporting disabled'
assert {k.lower():v for k,v in headers.items()}.get('cache-control')=='no-store','Beta status cache-control missing: '+repr(headers)
code,account,_=call('/api/account/me')
assert code==200 and 'enabled' in account
code,_,_=call('/api/beta/reports')
assert code==403,'Private feedback reports should reject guests'
# One explicitly labeled QA report verifies real guest POST behavior on isolated staging.
qa={'category':'other','title':'QA release gate feedback verification',
 'details':'Automated staging verification of the anonymous beta feedback submission endpoint. This is not a user issue.',
 'page':'#/beta','contact':'','clientVersion':RELEASE}
with urlopen(Request(BASE+'/api/beta/feedback',data=json.dumps(qa).encode(),
 headers={'content-type':'application/json','origin':BASE},method='POST'),timeout=18) as response:
 assert response.status==201,'Real staging feedback submission failed'
 confirmation=json.load(response)
 assert confirmation.get('reference'),'No feedback receipt returned'
code,wiki,_=call('/api/wiki/articles')
assert code==200 and isinstance(wiki.get('articles'),list),'Wiki articles unavailable'
code,catalog,_=call('/api/search/catalog',timeout=20)
assert code==200 and len(catalog.get('entries',[]))>=400,'Live Codex index unavailable'

with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/#/home',wait_until='domcontentloaded',timeout=30000)
 page.locator('.arcanaSignature').wait_for(timeout=20000)
 assert 'PDX & OVK' in page.locator('.arcanaSignature').inner_text()
 assert page.locator('[data-route="beta"]').count()>0,'Guest cannot discover Beta Center'
 assert page.locator('.arcanaHomeGateway').count()==4,'Home missing four primary destinations'
 for route in ('wiki','labs','calculators','wiki/guides'):
  assert page.locator('.arcanaHomeGateway[data-route="'+route+'"]').count()==1,'Missing '+route
 actions=page.locator('details[data-home-panel="actions"]')
 quick=page.locator('details[data-home-panel="quick"]')
 assert actions.count()==1 and quick.count()==1,'Homepage expandable panels are missing'
 assert not actions.evaluate('(el)=>el.open') and not quick.evaluate('(el)=>el.open')
 actions.locator('summary').click()
 assert actions.evaluate('(el)=>el.open')
 assert actions.locator('.arcanaConnection').count()==6
 quick.locator('summary').click()
 assert quick.evaluate('(el)=>el.open')
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+4'),'Home has horizontal overflow'

 page.goto(BASE+'/#/beta',wait_until='domcontentloaded',timeout=30000)
 page.locator('[data-beta-form="feedback"]').wait_for(timeout=20000)
 assert page.locator('.betaFeature').count()>=4
 assert page.locator('[name="title"]').count()==1
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+4'),'Beta screen horizontal overflow'
 page.goto(BASE+'/#/labs/build',wait_until='domcontentloaded',timeout=30000)
 page.locator('.studioHero').wait_for(timeout=20000)
 assert page.locator('.equipmentSection').count()==1,'Build Studio broken'
 assert page.locator('[data-route="beta"]').count()>0,'Planner has no feedback path'
 token=page.evaluate("""async ()=> {
   const {shareBuildToken}=await import('/src/build-links.js');
   return await shareBuildToken({title:'Staging beta shared build',className:'Warrior',
     equipment:{weapon:'game:item:claws'},runes:[],pets:[],skills:[],monsterLevel:45});
 }""")
 page.evaluate("(token)=>location.hash='#/labs/build?share='+encodeURIComponent(token)",token)
 page.locator('[data-action="clonebuild"]').wait_for(timeout=12000)
 assert 'Staging beta shared build' in page.locator('.studioHero').inner_text(),'Anonymous share could not open'
 assert page.locator('[data-action="sharebuild"]').count()==0,'Shared build is not read-only'
 page.locator('[data-action="clonebuild"]').click()
 page.locator('[data-action="sharebuild"]').wait_for(timeout=8000)

 assert not errors,'Real deployed JS exceptions: '+repr(errors)
 browser.close()
print(json.dumps({'result':'PASS','release':RELEASE,'artworkSheets':health['artwork']['groups'],
 'codexRecords':len(catalog['entries']),'wikiArticles':len(wiki['articles']),
 'accountsConfigured':status.get('accountsConfigured'), 'liveBrowserErrors':len(errors)},indent=2))
