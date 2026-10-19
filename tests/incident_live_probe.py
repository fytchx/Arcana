"""Public-only incident probe. Uses a fresh browser profile, no auth or mutations."""
from playwright.sync_api import sync_playwright
import json,time,socket,urllib.request,ssl
for host in ['arcanacompanion.xyz','www.arcanacompanion.xyz','1mmrwn7h.up.railway.app','7xibzfdf.up.railway.app']:
 try:print('DNS',host,socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)[:2],flush=True)
 except Exception as e:print('DNS ERROR',host,str(e),flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for url in ['https://arcanacompanion.xyz/','https://www.arcanacompanion.xyz/']:
  page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  failures=[];errors=[];resps=[]
  page.on('requestfailed',lambda req:failures.append({'url':req.url[:150],'failure':req.failure}))
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:resps.append({'status':r.status,'url':r.url[:150]}) if r.status>=400 else None)
  start=time.monotonic()
  try:
   resp=page.goto(url,wait_until='domcontentloaded',timeout=26000)
   print('NAV',url,'HTTP',resp.status if resp else None,'final',page.url,'elapsed',round(time.monotonic()-start,2),flush=True)
   for wait in [1,3,7,10]:
    page.wait_for_timeout(1000 if wait==1 else (2000 if wait==3 else 4000 if wait==7 else 3000))
    state=page.evaluate("""() => ({
      ready:document.readyState,title:document.title,
      boot:!!document.querySelector('#arcanaBoot'),
      bootClass:document.querySelector('#arcanaBoot')?.className,
      app:!!document.querySelector('#app'),content:document.querySelector('#content')?.children.length||0,
      home:!!document.querySelector('#content.homeFullscreen'),
      contentText:(document.querySelector('#content')?.innerText||'').slice(0,90),
      warnings:document.querySelector('#arcanaStartupError')?.innerText?.slice(0,120)
    })""")
    print('STATE',url,wait,json.dumps(state),flush=True)
  except Exception as e:print('PAGE ERROR',url,str(e)[:1400],flush=True)
  print('FAILED REQUESTS',url,json.dumps(failures[-12:]),flush=True)
  print('BROWSER ERRORS',url,json.dumps(errors[-12:]),flush=True)
  print('HTTP ERRORS',url,json.dumps(resps[-12:]),flush=True)
  page.close()
 browser.close()
