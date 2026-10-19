"""Read-only public-visitor theme performance smoke on the isolated Arcana PREVIEW site.

Never writes published settings: applying each theme calls the in-browser
setPublishedDesign function only in a disposable incognito Chromium page.
Output is diagnostic; CI clocks are not treated as measurements on real phones.
"""
from playwright.sync_api import sync_playwright
import json,statistics,os
from pathlib import Path
URL='https://arcana-preview-app-preview.up.railway.app/#/home'
OUT=Path(__file__).resolve().parent.parent/'qa-output';OUT.mkdir(exist_ok=True)
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True,args=['--disable-dev-shm-usage','--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='domcontentloaded',timeout=55000)
 page.locator('#content.homeFullscreen .launchHero').wait_for(timeout=20000)
 assert page.locator('[data-mini-live-frame]').count()==0,'Visitors must never load the designer iframe'
 assert page.locator('.arcanaDesignLab').count()==0,'Visitors must never load the theme editor'
 results=page.evaluate("""async ()=>{
  const {setPublishedDesign,DEFAULT_DESIGN}=await import('/src/design-controls.js');
  const {PSYCHEDELIC_PRESETS}=await import('/src/psychedelic-presets.js');
  const {SIGNATURE_PRESETS}=await import('/src/signature-collection.js');
  const settle=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const before={jsHeap:performance.memory?.usedJSHeapSize??null,
   initialResourceCount:performance.getEntriesByType('resource').length,
   navigationDOMReady:performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd??null};
  let timings={},payloads={},paint={};
  const groups={plain:{...DEFAULT_DESIGN,pattern:'plain'},
   classic:{...DEFAULT_DESIGN,pattern:'satin'},
   signature:{...DEFAULT_DESIGN,...SIGNATURE_PRESETS.astral},
   groovemelt:{...DEFAULT_DESIGN,...PSYCHEDELIC_PRESETS.groovemelt},
   orbitjelly:{...DEFAULT_DESIGN,...PSYCHEDELIC_PRESETS.orbitjelly},
   doodlerift:{...DEFAULT_DESIGN,...PSYCHEDELIC_PRESETS.doodlerift},
   prismpuddle:{...DEFAULT_DESIGN,...PSYCHEDELIC_PRESETS.prismpuddle}};
  for(const [name,design] of Object.entries(groups)){
   const samples=[];
   for(let i=0;i<5;i++){const started=performance.now();setPublishedDesign(design);await settle();samples.push(performance.now()-started);}
   const texture=document.documentElement.style.getPropertyValue('--psychedelic-texture');
   payloads[name]=texture.length;
   const hero=getComputedStyle(document.querySelector('.launchHero'),'::after');
   paint[name]={image:hero.backgroundImage.slice(0,36),repeat:hero.backgroundRepeat,size:hero.backgroundSize};
   timings[name]=samples.sort((a,b)=>a-b);
  }
  return {before,timings,payloads,paint,
   after:{jsHeap:performance.memory?.usedJSHeapSize??null,resourceCount:performance.getEntriesByType('resource').length},
   iframeCount:document.querySelectorAll('iframe[data-mini-live-frame]').length,themeEditorCount:document.querySelectorAll('.arcanaDesignLab').length,
   pageHorizontalOverflow:document.documentElement.scrollWidth>innerWidth+3};
 }""")
 assert results['iframeCount']==0 and results['themeEditorCount']==0
 assert not results['pageHorizontalOverflow'],'Published theme causes horizontal overflow on phone'
 for mode in ('groovemelt','orbitjelly','doodlerift','prismpuddle'):
  assert 1000<results['payloads'][mode]<60000,f'Invalid SVG payload for {mode}: {results["payloads"][mode]}'
  assert 'data:image/svg+xml' in page.evaluate("""() => document.documentElement.style.getPropertyValue('--psychedelic-texture')""") or results['payloads'][mode]>1000
 for mode in ('plain','classic','signature'):
  assert results['payloads'][mode]==0,f'{mode} must not build a psychedelic SVG'
 assert not errors,'Public visitor page errors: '+repr(errors)
 (OUT/'public-theme-performance.json').write_text(json.dumps(results,indent=2))
 print('PUBLIC VISITOR THEME QA:',json.dumps({k:{'median_ms':round(statistics.median(v),2),'max_ms':round(max(v),2),'svg_chars':results['payloads'][k]} for k,v in results['timings'].items()},indent=2))
 print('Navigation DOM ready (ms)',results['before']['navigationDOMReady'])
 browser.close()
