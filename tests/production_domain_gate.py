"""Read-only gate for the one canonical production Arcana website.
Checks DNS/TLS, current release, account login handshake, public routes and www redirect.
Never creates test accounts, wiki drafts, community posts or feedback.
"""
import json,time
from urllib.request import Request,build_opener,HTTPRedirectHandler
from urllib.error import HTTPError,URLError
from urllib.parse import urlparse,parse_qs

ROOT='https://arcanacompanion.xyz'
class NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
opener=build_opener(NoRedirect)
def request(url):
 try:response=opener.open(Request(url,headers={'accept':'application/json','user-agent':'Arcana-ReadOnly-Production-Release-Gate/1.0'}),timeout=20)
 except HTTPError as e:response=e
 with response:
  data=response.read(800000)
  try:out=json.loads(data)
  except:out={}
  return response.status,out,response.headers

last=''
for _ in range(30):
 try:
  status,health,_=request(ROOT+'/health')
  if status==200 and health.get('release')=='arcana-real-accounts-beta-2026-10-13':break
  last=str((status,health.get('release')))
 except (URLError,TimeoutError) as e:last=str(e)
 time.sleep(8)
else:raise AssertionError('Custom-domain health check unavailable or wrong release: '+last)
assert health.get('artwork',{}).get('local') is True
assert health['artwork']['groups']>=10
status,account,_=request(ROOT+'/api/account/me')
assert status==200 and account.get('enabled') is True and 'user' in account, 'Real account registration is not configured.'
assert account.get('betaEnrollmentOpen') is True,'Founding Beta Tester enrollment has unexpectedly closed.'
status,_,headers=request(ROOT+'/api/account/login')
assert status==303,('Discord OAuth handshake must redirect',status)
authorize=urlparse(headers.get('Location',''))
assert authorize.hostname=='discord.com' and authorize.scheme=='https'
qs=parse_qs(authorize.query)
assert qs.get('redirect_uri')==[ROOT+'/api/account/callback'],('OAuth redirect mismatch',qs.get('redirect_uri'))
assert qs.get('scope')==['identify'] and qs.get('state',[None])[0]
cookie=headers.get('Set-Cookie','')
assert '__Host-arcana-oauth=' in cookie and 'Secure' in cookie and 'HttpOnly' in cookie
status,_,headers=request('https://www.arcanacompanion.xyz/health')
assert status in (301,302,307,308) and headers.get('Location')==ROOT+'/health', 'www must redirect to the one canonical website'
for path in ['/api/wiki/articles','/api/community/posts','/api/beta/status','/privacy.html','/beta-rules.html','/official-art/manifest.json']:
 status,_,_=request(ROOT+path)
 assert status==200, 'Public production endpoint unavailable: '+path+' status '+str(status)
for path in ['/api/account/builds','/api/community/mine','/api/beta/reports']:
 status,_,_=request(ROOT+path)
 assert status in (401,403), 'Private endpoint did not enforce access: '+path
print(json.dumps({'result':'PASS','canonical':ROOT,'wwwRedirect':'PASS','discordLoginRedirect':'PASS',
 'accountRegistrationConfigured':True,'foundingEnrollment':True,'artworkSheets':health['artwork']['groups'],
 'publicRoutes':6,'privateRoutes':3,'note':'Real Discord consent/redirect registration still requires verification in the Discord Developer Portal.'},indent=2))
