"""Strict launch gate for REAL Discord account beta. Fails closed when OAuth isn't configured.
The script performs no sign-in and never reads secrets or touches member data.
"""
import os
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from urllib.parse import urlparse,parse_qs
import json

BASE=os.environ.get('ARCANA_STAGING_URL','https://arcana-stable-app-staging.up.railway.app').rstrip('/')
assert urlparse(BASE).hostname.endswith('.up.railway.app'), 'This gate must target isolated Railway staging.'
class NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
opener=build_opener(NoRedirect)
def request(path):
 try:
  response=opener.open(Request(BASE+path,headers={'accept':'application/json'}),timeout=18)
 except HTTPError as e:response=e
 with response:
  data=response.read()
  try:payload=json.loads(data)
  except:payload={}
  return response.status,payload,response.headers

for path in ('/privacy.html','/beta-rules.html'):
 code,_,_=request(path)
 assert code==200, path+' is unavailable'
code,account,_=request('/api/account/me')
assert code==200
assert account.get('enabled') is True, 'REAL DISCORD SIGNUP BLOCKED: configure OAuth client ID, secret and exact AUTH_BASE_URL on Railway staging.'
assert account.get('betaEnrollmentOpen') is True, 'Founding Beta Tester enrollment is not open.'
code,info,_=request('/api/beta/status')
assert code==200 and info.get('accountsConfigured') is True, 'Creator Discord ID or other required credentials not configured.'
assert info.get('betaEnrollmentOpen') is True, 'Founding cohort not activated.'
code,_,headers=request('/api/account/login')
assert code==303,'Discord authorize handshake failed'
url=headers.get('Location','')
parsed=urlparse(url)
assert parsed.scheme=='https' and parsed.hostname=='discord.com' and parsed.path=='/oauth2/authorize'
qs=parse_qs(parsed.query)
assert qs.get('scope')==['identify']
assert qs.get('redirect_uri')==[BASE+'/api/account/callback']
assert qs.get('state',[None])[0]
cookie=headers.get('Set-Cookie','')
assert '__Host-arcana-oauth=' in cookie and 'HttpOnly' in cookie and 'Secure' in cookie
for path in ('/api/account/builds','/api/community/mine','/api/beta/reports'):
 code,_,_=request(path)
 assert code in (401,403),path+' must be private'
print(json.dumps({'account_beta_gate':'CONFIGURATION PASS','discordOAuthRedirect':qs['redirect_uri'][0],
 'foundingCohortEnabled':True,'privacyPages':2,'privateRoutesChecked':3,
 'note':'Still requires physical Android sign-in and an offsite data backup.'},indent=2))
