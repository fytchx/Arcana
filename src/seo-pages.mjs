// Crawlable Arcana entry pages. Keep facts conservative and link into the real app.
export const SEO_ORIGIN='https://arcanacompanion.xyz';
const page=(slug,title,description,eyebrow,headline,intro,features,appRoute,cta,links)=>Object.freeze({
 path:'/'+slug,title,description,eyebrow,headline,intro,features,appRoute,cta,links
});
export const SEO_PAGES=Object.freeze([
 page('pathfinder','IdleArc Pathfinder | Upgrade Cost Calculator','Plan IdleArc equipment upgrades with Arcana Pathfinder. Compare upgrade ranges and estimate gold, monster materials and attempts.','UPGRADE PLANNING','Know what your next upgrade takes','Compare equipment upgrade stages, review the materials involved and plan how much farming you need before upgrading.',[
  ['Upgrade ranges','Choose a starting and target upgrade to inspect the costs between them.'],
  ['Material planning','Compare monster materials, other ingredients and gold in one place.'],
  ['Attempts and quantities','Explore how expected upgrade attempts affect your preparation.']
 ],'calculators/pathfinder','Open Pathfinder',['/tools','/wiki','/build-studio']),
 page('build-studio','IdleArc Build Studio | Character Build Planner','Explore IdleArc character builds in Arcana Build Studio. Plan equipment, skills, passives, pets and runes in a connected workspace.','CHARACTER PLANNING','A sandbox for your next build','Experiment with character choices and study how equipment, skills, pets, runes and passives fit together before making changes in game.',[
  ['Equipment and builds','Organize your character setup and explore equipment decisions.'],
  ['Skills and passives','Move between related character-planning tools.'],
  ['Connected research','Jump from the planner to community builds and Wiki references.']
 ],'labs/build','Open Build Studio',['/guides','/wiki','/tools']),
 page('tools','IdleArc Calculators & Tools | Arcana Companion','Explore free IdleArc calculators and tools in Arcana, including Pathfinder, pet planning, affix costs, Monster Level farming and guild skill planning.','TOOLS AND CALCULATORS','Make more informed decisions','Arcana brings upgrade, pet, farming and guild-planning tools together, with links to the relevant game references.',[
  ['Pathfinder','Estimate equipment upgrade materials and gold across upgrade stages.'],
  ['Pet planning','Explore pet-related calculations and affix upgrade costs.'],
  ['Farming and guild tools','Compare farming approaches and plan guild skill allocations.']
 ],'directory','Browse Arcana Tools',['/pathfinder','/wiki','/build-studio']),
 page('wiki','ArcanaWiki | IdleArc Items, Mechanics & Guides','Explore ArcanaWiki, the IdleArc game reference for equipment, monsters, materials, skills, pets, biomes and other mechanics.','GAME REFERENCE','Find the mechanics behind your build','Browse connected references for IdleArc items, monsters, materials, classes, equipment and game systems.',[
  ['Equipment and materials','Look up game records and relevant upgrade information.'],
  ['Classes and skills','Navigate class information and character mechanics.'],
  ['Connected tools','Continue from a reference into a calculator or build planner.']
 ],'wiki','Explore ArcanaWiki',['/guides','/pathfinder','/build-studio']),
 page('guides','IdleArc Guides & Community Builds | Arcana','Find IdleArc player guides and community builds on Arcana. Explore progression strategies and connect builds to planning tools and Wiki references.','PLAYER GUIDES','Learn from the community','Find player-written strategies and shared builds, then follow the relevant references and planning tools.',[
  ['Progression guides','Read approaches to leveling, gear, and character progression.'],
  ['Community builds','Explore setups published by other players.'],
  ['Build planning','Open Build Studio when you want to explore your own version.']
 ],'wiki/guides','Browse Player Guides',['/build-studio','/wiki','/community']),
 page('guilds','IdleArc Guild Hub & Recruitment | Arcana','Discover the IdleArc Guild Hub on Arcana. Find player guilds, view registered guild pages and explore recruitment and community activities.','GUILD HUB','Make your guild easier to find','Browse guild identities and recruitment in Arcana without turning your guild page into another chat app.',[
  ['Guild discovery','Browse guild pages and available recruitment information.'],
  ['Identity and tags','See how guilds represent themselves on Arcana.'],
  ['Community connections','Continue to players, builds, and group activities.']
 ],'guilds','Open Guild Hub',['/community','/guides','/tools']),
 page('community','IdleArc Player Community | Arcana','Browse the IdleArc player community on Arcana. Find public builds, player guides, profiles and guild connections.','THE COMMUNITY','Where players share what they learn','Explore player-contributed builds, guides and profiles, with direct paths into Arcana tools and game references.',[
  ['Player builds','See setups shared by other IdleArc players.'],
  ['Guides and feedback','Read community strategies and discover shared knowledge.'],
  ['Guild connections','Find guild identities and recruitment opportunities.']
 ],'community','Explore Community',['/guilds','/guides','/build-studio'])
]);
export const seoPageByPath=path=>SEO_PAGES.find(p=>p.path===path)||null;
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const ld=v=>JSON.stringify(v).replace(/</g,'\\u003c');
const labels=Object.fromEntries(SEO_PAGES.map(p=>[p.path,p.headline]));
export function renderSeoPage(p){
 if(!p||!SEO_PAGES.includes(p))return null;
 const url=SEO_ORIGIN+p.path,asset=SEO_ORIGIN+'/assets/arcana-logo.webp';
 const internal=SEO_PAGES.map(x=>'<a '+(x.path===p.path?'aria-current="page" ':'')+'href="'+x.path+'">'+esc(x.path==='/wiki'?'ArcanaWiki':x.path==='/build-studio'?'Build Studio':x.path.charAt(1).toUpperCase()+x.path.slice(2))+'</a>').join('');
 const related=p.links.map(path=>'<a href="'+esc(path)+'">'+esc(labels[path])+' <span aria-hidden="true">↗</span></a>').join('');
 const schema={'@context':'https://schema.org','@type':'WebPage',name:p.title,description:p.description,url,isPartOf:{'@type':'WebSite',name:'Arcana',url:SEO_ORIGIN+'/'}};
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0b0e18"><meta name="robots" content="index,follow"><title>'+esc(p.title)+'</title><meta name="description" content="'+esc(p.description)+'"><link rel="canonical" href="'+url+'"><link rel="icon" type="image/webp" href="/assets/arcana-logo.webp"><meta property="og:type" content="website"><meta property="og:site_name" content="Arcana"><meta property="og:title" content="'+esc(p.title)+'"><meta property="og:description" content="'+esc(p.description)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+asset+'"><meta name="twitter:card" content="summary"><script type="application/ld+json">'+ld(schema)+'</script>'+
 '<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 50% -24%,#40336765,transparent 58%),#0b0e18;color:#f3f1fa;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}a{color:inherit}a:focus-visible{outline:2px solid #73cfff;outline-offset:4px}header,main,footer{max-width:1080px;margin:auto;padding-inline:clamp(16px,4vw,34px)}header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:20px;border-bottom:1px solid #41405255}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-family:Georgia,serif;letter-spacing:.22em;font-weight:700}.brand img{width:38px;height:38px;object-fit:contain}nav{display:flex;gap:12px;flex-wrap:wrap;font-size:12px}nav a{color:#c8c1dd;text-decoration:none}nav a[aria-current],nav a:hover{color:#b9a4ff}main{padding-top:clamp(42px,7vw,88px);padding-bottom:65px}.eyebrow{font-size:11px;letter-spacing:.2em;font-weight:750;color:#a6caff}h1{max-width:760px;margin:14px 0 17px;font:700 clamp(33px,5.6vw,60px)/1.13 Georgia,serif;letter-spacing:-.035em}p{color:#c7c5d3}main>p{max-width:670px;font-size:clamp(15px,2.2vw,18px)}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 42px}.primary,.secondary{display:inline-flex;align-items:center;justify-content:center;min-height:47px;padding:11px 20px;border-radius:12px;text-decoration:none;font-weight:750;font-size:14px}.primary{background:#b9a4ff;color:#15101f}.secondary{border:1px solid #656184;color:#eae5ff}h2{font:600 24px Georgia,serif;margin:0 0 18px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{padding:22px;border:1px solid #49455e;border-radius:16px;background:#1b1b2a}.card h3{font-size:16px;margin:0 0 8px}.card p{font-size:13px;margin:0}.related{margin-top:40px}.related a{display:inline-flex;margin:0 8px 10px 0;padding:9px 13px;border:1px solid #454052;border-radius:10px;text-decoration:none;color:#d9d0f7;font-size:13px}footer{padding-block:24px 45px;border-top:1px solid #41405255;display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;font-size:12px;color:#a9a5bb}footer a{color:#b9a4ff}@media(max-width:720px){header{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}.card{padding:17px}nav{gap:9px 14px}}</style></head><body>'+
 '<header><a class="brand" href="/"><img src="/assets/arcana-logo.webp" alt="" width="38" height="38">ARCANA</a><nav aria-label="Explore Arcana">'+internal+'<a href="/journal">Journal</a></nav></header>'+
 '<main id="main"><span class="eyebrow">'+esc(p.eyebrow)+'</span><h1>'+esc(p.headline)+'</h1><p>'+esc(p.intro)+'</p><div class="actions"><a class="primary" href="/#/'+encodeURI(p.appRoute)+'">'+esc(p.cta)+' →</a><a class="secondary" href="/">Arcana Home</a></div>'+
 '<section aria-label="What you can do"><h2>What you can do</h2><div class="cards">'+p.features.map(([h,t])=>'<div class="card"><h3>'+esc(h)+'</h3><p>'+esc(t)+'</p></div>').join('')+'</div></section>'+
 '<section class="related" aria-label="Related Arcana pages"><h2>Continue exploring</h2>'+related+'</section></main>'+
 '<footer><span>Arcana is an independent, community-built companion for IdleArc, not an official game site.</span><a href="/journal">Read the Arcana Journal</a></footer></body></html>';
}
