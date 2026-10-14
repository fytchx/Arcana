"""Read-only live browser check of the standalone Arcana Preview domain."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

URL="https://arcana-preview-app-preview.up.railway.app/"
out=Path("qa-output")
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
    errors=[]
    broken=[]
    redirects=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("requestfailed",lambda r:broken.append((r.url,str(r.failure))))
    page.on("framenavigated",lambda f:redirects.append(f.url))
    try:
        response=page.goto(URL,wait_until="domcontentloaded",timeout=30000)
        print("Initial HTTP:",response.status if response else None)
        assert response and response.status==200,"Preview homepage returned HTTP "+str(response.status if response else "no response")
        page.locator(".launchQuickCard").first.wait_for(timeout=20000)
        page.wait_for_timeout(1000)
        result=page.evaluate("""() => ({
          url:location.href,title:document.title,
          css:getComputedStyle(document.querySelector('.launchQuickGrid')).display,
          hero:getComputedStyle(document.querySelector('.launchHero')).display,
          cards:document.querySelectorAll('.launchQuickCard').length,
          content:document.querySelector('#content')?.innerText.slice(0,500),
          bodyWidth:document.body.scrollWidth,viewport:innerWidth
        })""")
        print("Rendered:",json.dumps(result))
        assert result["cards"]==6,"Six navigation cards did not render"
        assert result["css"]=="grid","Live navigation stylesheet failed to apply"
        assert result["hero"]=="flex","Live hero stylesheet failed to apply"
        slate=page.locator(".launchQuickCard").evaluate_all("""els => {
            const a=els[0].getBoundingClientRect(),b=els[1].getBoundingClientRect();
            return {top:a.y,next:b.y,left:a.x,nextLeft:b.x,cardHeight:a.height,
                    heroHeight:document.querySelector('.launchHero').getBoundingClientRect().height};
        }""")
        print("Slate geometry:",json.dumps(slate))
        assert abs(slate["next"]-slate["top"])<3 and slate["nextLeft"]>slate["left"]+70,"Home cards must be two per row"
        assert 83<=slate["cardHeight"]<=145,"Mobile two-column cards must stay compact and tappable"
        assert 165<=slate["heroHeight"]<=255,"Mystical Build Studio feature should be prominent but not enormous"
        assert page.locator(".launchHeroCTA").inner_text().find("Enter Build Studio")>=0,"Mystical CTA missing"
        assert page.locator(".launchHeroArcaneSeal").count()==1,"Subtle geometric seal missing"
        assert page.locator(".launchHeroCTASigil").count()==1,"CTA needs a central glyph"
        geom=page.locator(".launchFeatureRow").evaluate_all("""els => els.map(el=>{
          const r=el.getBoundingClientRect();
          return {x:r.x,y:r.y,width:r.width,height:r.height}
        })""")
        assert len(geom)==3
        assert abs(geom[0]["y"]-geom[1]["y"])<3 and geom[1]["x"]>geom[0]["x"]+70,"Featured cards should be two-up"
        assert geom[2]["width"]>geom[0]["width"]*1.8 and geom[2]["y"]>geom[0]["y"]+60,"Third featured card should fill final row"
        print("Mystical homepage geometry:",json.dumps({"quick":slate,"featured":geom}),flush=True)
        assert page.locator('.launchQuickCard .refinedOfficialSprite').count()==6,"Six home sections must display real game motifs"
        assert page.locator('.launchHeroArt .refinedOfficialSprite').count()==1,"Build Studio hero lacks official game motif"
        assert page.locator('.launchQuickCard[data-arg="codex"] [data-refined-source="materials:prism-stone"]').count()==1,"Codex needs distinctive original-art token"
        source_check=page.evaluate("""async()=>Promise.all(['/official-art/equipment.webp','/official-art/skills.webp','/official-art/icons.webp','/official-art/materials.webp'].map(async p=>{const r=await fetch(p);return {url:p,status:r.status,type:r.headers.get('content-type')}}))""")
        assert all(row["status"]==200 and "webp" in row["type"] for row in source_check),"IdleArc sprites did not load on live preview"
        print("Official game artwork requests:",json.dumps(source_check),flush=True)

        page.locator("#accountBtn").click()
        page.locator('[data-route="settings"]').click()
        assert page.locator(".slateAccentChoice").count()==10,"Ten theme colors must be selectable"
        page.locator('[data-action="accent"][data-arg="cyan-blue"]').click()
        chosen=page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-highlight').trim()")
        assert chosen.lower()=="#13c5f4","Personal accent was not applied"
        page.reload(wait_until="domcontentloaded")
        page.locator(".slateAccentChoice").first.wait_for(timeout=20000)
        persisted=page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-highlight').trim()")
        assert persisted.lower()=="#13c5f4","Personal accent choice did not survive reload"
        print("Player accent persisted:",persisted)
        # Independent look and feel: site surface, site accent, and icon color.
        page.locator('[data-action="site-surface"][data-arg="midnight"]').click()
        page.locator('[data-action="accent"][data-arg="crimson-red"]').click()
        page.locator('[data-action="icon-color"][data-arg="cyan-blue"]').click()
        page.locator('[data-action="icon-mode"][data-arg="accent"]').click()
        colors=page.evaluate("""() => ({
          surface:getComputedStyle(document.documentElement).getPropertyValue('--theme-main').trim(),
          site:getComputedStyle(document.documentElement).getPropertyValue('--theme-highlight').trim(),
          glyph:getComputedStyle(document.documentElement).getPropertyValue('--arcana-icon-color').trim(),
          mode:document.documentElement.dataset.arcanaIconMode,
          glyphStyle:getComputedStyle(document.querySelector('.arcanaThemePreview .arcanaIcon')).color
        })""")
        print("Independent theme palette:",json.dumps(colors))
        assert colors["surface"].lower()=="#080e19"
        assert colors["site"].lower()=="#ec464d"
        assert colors["glyph"].lower()=="#13c5f4"
        assert colors["glyphStyle"]=="rgb(19, 197, 244)"
        assert colors["mode"]=="accent"
        brand_red=page.locator('#brandHome img').evaluate("(el)=>getComputedStyle(el).filter")
        footer_red=page.locator('.arcanaSigLogo').evaluate("(el)=>getComputedStyle(el).filter")
        assert 'hue-rotate' in brand_red and 'hue-rotate' in footer_red,"Brand artwork did not respond to site accent"
        print("Red Arcana logo:",brand_red)
        page.locator('[data-action="accent"][data-arg="white-silver"]').click()
        brand_silver=page.locator('#brandHome img').evaluate("(el)=>getComputedStyle(el).filter")
        assert brand_red!=brand_silver and 'grayscale(1)' in brand_silver,"Silver site accent must recolor Arcana logo"
        page.locator('[data-action="accent"][data-arg="crimson-red"]').click()

        page.reload(wait_until="domcontentloaded")
        page.locator('.arcanaThemePreview').wait_for(timeout=12000)
        after_refresh=page.evaluate("() => [getComputedStyle(document.documentElement).getPropertyValue('--theme-main').trim(),getComputedStyle(document.documentElement).getPropertyValue('--arcana-icon-color').trim(),document.documentElement.dataset.arcanaIconMode]")
        assert after_refresh==["#080E19","#13C5F4","accent"],"Icon and surface choices did not survive reload"
        page.goto(URL+"#/icons",wait_until="domcontentloaded",timeout=30000)
        page.locator('.arcanaIconCatalogItem').first.wait_for(timeout=16000)
        assert page.locator('.arcanaIconCatalogItem').count()==144,"Entire SVG gallery did not render"
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+3"),"Icon gallery overflows mobile"
        print("Icon library:",page.locator('.arcanaIconCatalogItem').count(),"SVG assets")
        page.goto(URL+"#/home",wait_until="domcontentloaded",timeout=30000)
        page.locator('.launchQuickCard').first.wait_for(timeout=16000)
        textured=page.evaluate("""() => {
          const hero=document.querySelector('.launchHero'),
                card=document.querySelector('.launchQuickCard'),
                feature=document.querySelector('.launchFeatureRow');
          return {
            main:getComputedStyle(document.querySelector('#content'),':before').backgroundImage,
            hero:getComputedStyle(hero,':after').backgroundImage,
            card:getComputedStyle(card,':after').backgroundImage,
            feature:getComputedStyle(feature,':after').backgroundImage,
            logo:getComputedStyle(document.querySelector('#brandHome img')).filter,
            bodyWidth:document.body.scrollWidth,
            viewport:innerWidth
          };
        }""")
        assert all('arcana-etched-grain.svg' in textured[key] for key in ['main','hero','card','feature']),"Homepage texture is not applied to each surface"
        assert 'hue-rotate' in textured['logo'],"Recolored Arcana logo did not persist onto homepage"
        assert textured['bodyWidth']<=textured['viewport']+3,"Texture caused horizontal scroll"
        page.screenshot(path=str(out/"arcana-home-etched-mobile.png"),full_page=True)
        assert page.locator('.launchHeroCTA').evaluate("(el) => getComputedStyle(el).display")=="grid","Flagship CTA must use its intentional grid layout"
        page.locator('.launchHeroCTA').click()
        page.locator('.studioPrimaryEquipment').wait_for(timeout=20000)
        assert page.locator('.studioPrimaryEquipment .loadoutSlot').count()==13,"Featured CTA must open the complete Build Studio"
        page.go_back(wait_until='domcontentloaded')
        page.locator('.launchQuickCard').first.wait_for(timeout=12000)
        print("Homepage texture and Arcana brand recoloring: OK")


        page.goto(URL+"#/labs/build",wait_until="domcontentloaded",timeout=30000)
        page.locator(".studioProfile").wait_for(timeout=16000)
        page.evaluate("window.scrollTo(0,0)")
        assert page.locator(".studioPrimaryEquipment .loadoutSlot").count()==13,"Live loadout lost gear slots"
        assert page.locator(".studioPrimaryEquipment .refinedOfficialSprite").count()==13,"Each equipment slot needs recognizable game art"
        assert page.locator(".studioProfileVisual .refinedOfficialSprite").count()==1,"Class profile must show an in-game skill motif"
        assert page.locator('.loadoutSlot[data-pos="top-center"] [data-refined-source="equipment:chainmail-helm"]').count()==1,"Empty head slot not based on actual helmet art"
        page.screenshot(path=str(out/"idlearc-refined-studio-mobile.png"),full_page=True)

        assert page.locator(".studioPrimaryEquipment .arcanaSilhouette").count()==13,"Live equipment silhouettes not applied"
        assert page.locator(".studioProfileVisual .arcanaSilhouette").count()==1,"Class profile emblem missing"
        assert page.locator(".pageHead").count()==0,"Old oversized heading still present"
        assert page.locator(".launchReturnHome").count()==0,"Duplicate home bar returned"
        profile=page.locator(".studioProfile").bounding_box()
        equipment=page.locator(".studioPrimaryEquipment").bounding_box()
        print("Live Studio geometry:",json.dumps({"profile":profile,"equipment":equipment}),flush=True)
        assert profile and equipment and equipment["y"]>=profile["y"]+profile["height"]-4,"Equipment must follow compact build profile"
        assert equipment["y"]<500,"Equipment is below the first mobile screen"
        print("Live Studio geometry:",json.dumps({"profile":profile,"equipment":equipment}))
        page.evaluate("""async () => {
          const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
          const ctx=canvas.getContext('2d');ctx.fillStyle='#9272da';ctx.fillRect(0,0,64,64);
          const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
          const dt=new DataTransfer();
          dt.items.add(new File([blob],'avatar.png',{type:'image/png'}));
          const field=document.getElementById('studioPortraitUpload');
          field.files=dt.files;field.dispatchEvent(new Event('change',{bubbles:true}));
        }""")
        page.locator('.studioPortraitImg').wait_for(timeout=9000)
        assert page.evaluate("localStorage.getItem('arcana-studio-portrait-local-v1')?.startsWith('data:image/')"),"Avatar not saved"
        page.reload(wait_until="domcontentloaded")
        page.locator('.studioPortraitImg').wait_for(timeout=15000)
        page.locator('[data-action="removeportrait"]').click()
        assert page.locator('.studioPortraitImg').count()==0,"Reset to class icon failed"
        print("Live avatar upload, persistence and removal: OK")



        assert result["url"].startswith(URL),"Preview unexpectedly redirects away"
        assert result["bodyWidth"]<=result["viewport"]+3,"Mobile horizontal overflow"
        assert not errors,"JavaScript page errors: "+repr(errors)
        required=[x for x in broken if x[0].startswith(URL)]
        optional=[x for x in broken if not x[0].startswith(URL)]
        print("Optional external requests:",json.dumps(optional))
        assert not required,"Failed Arcana Preview assets: "+repr(required)
    finally:
        print("Navigations:",json.dumps(redirects))
        print("Page errors:",json.dumps(errors))
        print("Request failures:",json.dumps(broken))
        page.screenshot(path=str(out/"preview-live-mobile.png"),full_page=True,timeout=15000)
        browser.close()
