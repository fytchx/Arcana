// Read-only release verifier. This never reads or writes account data.
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export const RELEASE_ORIGINS=Object.freeze({
  production:'https://arcanacompanion.xyz',
  preview:'https://arcana-preview-app-preview.up.railway.app'
});

export async function verifyRelease({
  target,
  expectedSha,
  fetchFn=fetch,
  attempts=24,
  delayMs=15000,
  pause=ms=>new Promise(r=>setTimeout(r,ms)),
  log=message=>console.log(message)
}={}){
  if(!Object.hasOwn(RELEASE_ORIGINS,target))throw Error('Choose production or preview');
  if(!/^[a-f0-9]{40}$/i.test(expectedSha||''))throw Error('Expected commit must be a full 40-character Git SHA');
  const origin=RELEASE_ORIGINS[target];
  let lastError='';
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetchFn(origin+'/health',{cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Error('/health HTTP '+response.status);
      const health=await response.json();
      if(health.ok!==true)throw Error('Health reports app not ready');
      if(health.commit!==expectedSha){
        throw Error('Site serves '+(health.commit||'unknown commit')+' instead of '+expectedSha);
      }
      for(const path of ['/', '/assets/arcana-app-192.png','/api/wiki/articles']){
        const check=await fetchFn(origin+path,{cache:'no-store',signal:AbortSignal.timeout(10000)});
        if(!check.ok)throw Error(path+' HTTP '+check.status);
      }
      log('VERIFIED '+target+' commit '+expectedSha+' /health / assets / public Wiki');
      return {target,commit:expectedSha,origin,attempts:attempt};
    }catch(error){
      lastError=String(error?.message||error);
      log('Not live yet ('+attempt+'/'+attempts+'): '+lastError);
      if(attempt<attempts)await pause(delayMs);
    }
  }
  throw Error('Release NOT VERIFIED for '+target+': '+lastError);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  verifyRelease({
    target:process.env.ARCANA_RELEASE_TARGET,
    expectedSha:process.env.EXPECTED_SHA
  }).catch(error=>{console.error(error.message);process.exitCode=1;});
}
