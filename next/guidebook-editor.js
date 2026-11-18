// Guidebook editor: write and update pages inside the site.
// Editors save drafts or send them for review; publishers publish, hide and restore versions.
import { esc } from './core.js';
import { CHAPTERS, GUIDEBOOK_VERSION } from './guidebook-content.js';
import { guidebookPages, loadGuidebook, chapterOf } from './guidebook.js';
import { hbText } from './handbook.js';

const E = { state: 'idle', revision: 0, entries: [], canPublish: false, isOwner: false, contributors: [], contributorMatches: [], contributorQuery: '', edit: null, preview: false, busy: false, msg: '', toast: '', confirm: '', remoteDirty: false, localSaved: false, editVersion: 0 };
let rerender = () => {}, tt, autosaveTimer, contributorSearchTimer;
const toast = m => { E.toast = m; clearTimeout(tt); tt = setTimeout(() => { E.toast = ''; rerender(); }, 2600); rerender(); };
const TOOLS = [['studio', 'Build Studio'], ['pathfinder', 'Pathfinder'], ['mlxp', 'ML XP'], ['pets', 'Pet calculators'], ['guildtree', 'Guild tree'], ['builds', 'Builds'], ['lfg', 'Looking for group'], ['retaliation','Retaliation planner']];
const TRUST = [['estimated', 'Working draft', 'Under editorial review'], ['verified', 'Reviewed', 'Checked and approved'], ['config', 'Referenced mechanics', 'Linked to a dated game config'], ['legacy', 'Earlier season', 'Older advice']];
const slug = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function api(method, body) {
  const r = await fetch('/api/admin/guidebook', { method, credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
export function loadEditorData(force) {
  if (!force && E.state !== 'idle') return;
  E.state = 'loading';
  api('GET').then(j => { E.revision = j.revision; E.entries = j.entries; E.canPublish = j.canPublish; E.isOwner=!!j.isOwner; E.contributors=Array.isArray(j.contributors)?j.contributors:[]; E.state = 'ready'; }).catch(e => { E.state = e.status === 403 || e.status === 401 ? 'denied' : 'error'; }).finally(rerender);
}
const entry = id => E.entries.find(x => x.id === id);

function openEditor(id, chapter) {
  const en = id ? entry(id) : null, base = en ? (en.draft || en.published) : null;
  E.edit = base ? { ...base, isNew: false, fromDraft: !!en.draft } : { id: '', chapter: chapter || 'transition', title: '', answer: '', body: '', trust: 'estimated', version: GUIDEBOOK_VERSION, author: 'Zane', status:'review', order: 100, isNew: true };
  E.edit._recoveryKey=E.edit.isNew?`new:${chapter||'transition'}`:id;
  const saved=recover(E.edit._recoveryKey);
  if(saved&&Date.now()-saved.at<30*24*60*60*1000){E.edit={...E.edit,...saved.page,isNew:!!E.edit.isNew};E.localSaved=true;E.remoteDirty=true;}
  E.preview = false; E.msg = '';
}
const recoveryKey=id=>'arcana-guidebook-edit:'+id;
function recover(id){try{return JSON.parse(localStorage.getItem(recoveryKey(id))||'null');}catch{return null;}}
function keepLocal(){
 if(!E.edit)return;
 const id=E.edit._recoveryKey|| (E.edit.isNew?`new:${E.edit.chapter||'transition'}`:E.edit.id);
 try{localStorage.setItem(recoveryKey(id),JSON.stringify({at:Date.now(),page:E.edit}));E.localSaved=true;}catch{E.localSaved=false;}
}
function clearLocal(id){try{localStorage.removeItem(recoveryKey(id));}catch{}}

// ---------- views ----------
export function guidebookEditorView(id, isNew) {
  loadEditorData();
  if (E.state === 'denied') return '<div class="nx-empty"><strong>Editors only</strong><p>Sign into Arcana Test with a Handbook Editor or Game Developer account to edit.</p></div>';
  if (E.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load the Guidebook editor</strong><button class="nx-btn" data-ge="reload">Try again</button></div>';
  if (E.state !== 'ready') return '<div class="nx-loading">Loading the editor…</div>';
  const key = (isNew ? 'new:' : '') + id;
  if (!E.edit || E.edit._key !== key) { openEditor(isNew ? null : id, isNew ? id : null); E.edit._key = key; }
  const e = E.edit, en = isNew ? null : entry(id);
  const field = (k, label, ph, max, area) => '<label class="nx-field">' + label + (area ? '<textarea rows="' + area + '" maxlength="' + max + '" data-ge-f="' + k + '" placeholder="' + esc(ph) + '">' + esc(e[k] || '') + '</textarea>' : '<input maxlength="' + max + '" data-ge-f="' + k + '" value="' + esc(e[k] || '') + '" placeholder="' + esc(ph) + '">') + '</label>';
  const tool = (act, label, title) => '<button type="button" data-ge="ins" data-v="' + act + '" title="' + esc(title) + '">' + label + '</button>';
  const status = en?.draft ? (en.review ? 'Waiting for review' : 'Draft saved') + (en.draftBy ? ' by ' + esc(en.draftBy) : '') : en?.hidden ? 'Hidden from readers' : en ? 'Published' : 'New page';
  return '<a class="nx-back" href="' + (isNew ? '#/guidebook/chapter/' + esc(id) : '#/guidebook/' + esc(id)) + '">‹ ' + (isNew ? 'Chapter' : 'Back to page') + '</a>' +
    '<header class="dz-head"><span><span class="nx-kicker">GUIDEBOOK EDITOR</span><h1>' + (isNew ? 'New page' : esc(e.title || 'Edit page')) + '</h1></span><span class="dz-status' + (en?.draft ? ' dz-draft' : '') + '">' + status + '</span></header>' +
    '<div class="nx-seg" role="tablist"><button role="tab" aria-selected="' + !E.preview + '" data-ge="mode" data-v="write">Write</button><button role="tab" aria-selected="' + E.preview + '" data-ge="mode" data-v="preview">Preview</button></div>' +
    (E.preview ? '<article class="hb-page he-preview"><header class="hb-head"><span class="nx-kicker">' + esc((chapterOf(e.chapter)?.title || '').toUpperCase()) + '</span><h1>' + esc(e.title) + '</h1></header><p class="hb-answer">' + esc(e.answer) + '</p>' + hbText(e.body) + '</article>' :
    '<section class="nx-tool he-form">' +
      '<div class="he-structure"><label class="nx-field">Chapter<select data-ge-f="chapter">' + CHAPTERS.map(c => '<option value="' + c.id + '"' + (c.id === e.chapter ? ' selected' : '') + '>' + c.n + ' · ' + esc(c.title) + '</option>').join('') + '</select></label>' +
      '<label class="nx-field">Position in chapter<input type="number" inputmode="numeric" min="0" max="999" data-ge-f="order" value="' + Number(e.order||0) + '"><small>Lower numbers appear first.</small></label></div>' +
      field('title', 'Title', 'For example: Pity', 80) +
      (isNew ? field('id', 'Page address', 'made from the title', 60) : '') +
      field('answer', 'One-line answer <small>shown first, in bold</small>', 'Answer the reader’s question in one sentence.', 400, 2) +
      '<div class="he-toolbar" role="toolbar" aria-label="Insert">' + tool('h2', 'Heading', 'Section heading') + tool('h3','Subheading','Subheading') + tool('bold', '<b>B</b>', 'Bold') + tool('list', '• List', 'Bullet list') + tool('steps', '1. Steps', 'Numbered steps') + tool('note','Note','Highlighted note') + tool('table', 'Table', 'Small table') + '</div>' +
      '<div class="he-linkers"><label class="nx-field">Link a topic <small>select words in the text first</small><select data-ge="topic"><option value="">Choose a page…</option>' +
        CHAPTERS.map(c => '<optgroup label="' + esc(c.title) + '"><option value="chapter:' + c.id + '">Chapter: ' + esc(c.title) + '</option>' + E.entries.map(x=>x.draft||x.published).filter(p => p?.chapter === c.id && p.id !== e.id).map(p => '<option value="' + p.id + '">' + esc(p.title) + '</option>').join('') + '</optgroup>').join('') + '</select></label>' +
        '<label class="nx-field">Add a tool button<select data-ge="tool"><option value="">Choose a tool…</option>' + TOOLS.map(([k, l]) => '<option value="' + k + '">' + l + '</option>').join('') + '</select></label></div>' +
      field('body', 'Page', 'Write in short paragraphs. Blank line between paragraphs.', 30000, 16) +
      '<details class="nx-help"><summary>How to format</summary><p><b>## Heading</b> starts a section. <b>- item</b> makes a list, <b>1. step</b> numbered steps. <b>**words**</b> is bold. Tables: <b>| A | B |</b> rows, with <b>| --- | --- |</b> under the first. Link Handbook topics with <b>[[topic-id|words]]</b>; use the menu above for links within the Guidebook.</p></details>' +
      '<details class="nx-help he-related"><summary>Related reading <small>Choose up to five pages</small></summary><div class="he-related-list">' + E.entries.map(x=>x.draft||x.published).filter(p=>p&&p.id!==e.id).map(p=>'<label><input type="checkbox" data-ge-related="'+esc(p.id)+'"'+((e.related||[]).includes(p.id)?' checked':'')+'><span>'+esc(p.title)+'</span></label>').join('') + '</div></details>' +
      '<div class="he-meta"><label class="nx-field">Trust<select data-ge-f="trust">' + TRUST.map(([k, l, d]) => '<option value="' + k + '"' + (k === e.trust ? ' selected' : '') + '>' + l + ' · ' + d + '</option>').join('') + '</select></label>' +
      '<label class="nx-field">Editorial status<select data-ge-f="status">' + [['review','Working draft'],['awaiting','Contributor pending'],['planned','Planned'],['ready','Ready for test readers']].map(([k,l])=>'<option value="'+k+'"'+(k===e.status?' selected':'')+'>'+l+'</option>').join('') + '</select><small>Only explicit Publish makes a page visible to readers.</small></label>' +
      field('author', 'Author / contributor', 'Zane or contributor name', 100) + field('version', 'Season covered', GUIDEBOOK_VERSION, 40) + '</div></section>') +
    (E.msg ? '<p class="st-err" role="alert">' + esc(E.msg) + '</p>' : '') +
    '<p class="he-autosave" role="status">' + (E.localSaved ? 'Private recovery copy saved on this device.' : E.remoteDirty ? 'Changes are on this device until you save the draft.' : 'Draft is saved on Arcana Test.') + '</p>' +
    '<div class="dz-bar he-bar">' +
      (E.canPublish ? '<button class="nx-btn" data-ge="save" data-v="draft"' + (E.busy ? ' disabled' : '') + '>Save draft</button><button class="nx-btn nx-btn-primary" data-ge="save" data-v="publish"' + (E.busy ? ' disabled' : '') + '>' + (E.confirm === 'publish' ? 'Tap to publish' : 'Publish') + '</button>'
        : '<button class="nx-btn" data-ge="save" data-v="draft"' + (E.busy ? ' disabled' : '') + '>Save draft</button><button class="nx-btn nx-btn-primary" data-ge="save" data-v="review"' + (E.busy ? ' disabled' : '') + '>Send for review</button>') +
      (en?.draft ? '<button class="nx-btn" data-ge="discard">' + (E.confirm === 'discard' ? 'Tap to discard' : 'Discard draft') + '</button>' : '') + '</div>' +
    (en && E.canPublish ? '<section><h2 class="nx-label">Page</h2><div class="nx-list">' +
      '<button class="nx-row" data-ge="vis"><span class="nx-row-text"><strong>' + (en.hidden ? 'Show to readers' : 'Hide from readers') + '</strong><small>' + (en.hidden ? 'Readers can’t see this page right now.' : 'Keeps the page and its history; readers won’t see it.') + '</small></span></button>' +
      (en.history.length ? '<details class="nx-help"><summary>Earlier versions (' + en.history.length + ')</summary>' + en.history.map(h => '<div class="he-hist"><span>' + esc(new Date(h.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })) + ' · ' + esc(h.by || '') + '</span><button class="nx-btn" data-ge="restore" data-i="' + h.i + '">' + (E.confirm === 'restore' + h.i ? 'Tap to restore' : 'Restore') + '</button></div>').join('') + '</details>' : '') +
      '</div></section>' : '') +
    (E.toast ? '<div class="st-toast" role="status">' + esc(E.toast) + '</div>' : '');
}

// Admin › Guidebook: what's waiting, drafts, and a way to start a page.
export function adminGuidebookTab() {
  loadEditorData();
  if (E.state !== 'ready') return E.state === 'denied' ? '<div class="nx-empty"><strong>No Guidebook access</strong></div>' : '<div class="nx-loading">Loading…</div>';
  const waiting = E.entries.filter(x => x.review), drafts = E.entries.filter(x => x.draft && !x.review), hidden = E.entries.filter(x => x.hidden);
  const row = (x, sub) => '<a class="nx-row" href="#/guidebook/edit/' + esc(x.id) + '"><span class="nx-row-text"><strong>' + esc((x.draft || x.published).title) + '</strong><small>' + esc(sub) + '</small></span><span class="nx-row-end">›</span></a>';
  const contributorPanel=E.isOwner?'<section class="playbook-contributor-panel"><div class="nx-head"><h2 class="nx-label">Playbook contributors</h2><small>Only you can manage this list.</small></div><p class="nx-fine">Search registered Arcana users. Set a public credit name when their profile name is missing or not the name they want credited.</p><label class="nx-field">Find a user<input type="search" autocomplete="off" data-gc-search value="'+esc(E.contributorQuery)+'" placeholder="Type at least two characters"></label><div class="nx-list">'+E.contributorMatches.map(m=>'<div class="nx-row"><span class="nx-row-text"><strong>'+esc(m.displayName)+'</strong></span><button class="nx-btn" type="button" data-gc="add" data-id="'+esc(m.id)+'"'+(E.contributors.some(c=>c.userId===m.id)?' disabled':'')+'>Add</button></div>').join('')+'</div>'+(E.contributors.length?'<div class="nx-list">'+E.contributors.map(c=>'<div class="playbook-credit-row"><label class="nx-field">Public credit name<input maxlength="80" data-gc-name="'+esc(c.userId)+'" value="'+esc(c.creditName||'')+'" placeholder="'+esc(c.displayName||'Arcana player')+'"></label><button class="nx-btn" type="button" data-gc="remove" data-id="'+esc(c.userId)+'">Remove</button></div>').join('')+'</div>':'<p class="nx-fine">No contributors selected yet.</p>')+'<button class="nx-btn nx-btn-primary" type="button" data-gc="save"'+(E.busy?' disabled':'')+'>Save contributor list</button></section>':'';
  return '<header class="hb-head"><span class="nx-kicker">PRIVATE EDITOR WORKSPACE</span><h1>Guidebook manager</h1><p>Drafts stay visible to editors. Publishing to Test is a separate, deliberate action.</p><a class="nx-btn" href="/api/admin/guidebook/export">Download a Guidebook backup</a></header>'+
    contributorPanel+
    '<section><h2 class="nx-label">Waiting for review · ' + waiting.length + '</h2>' + (waiting.length ? '<div class="nx-list">' + waiting.map(x => row(x, 'From ' + (x.draftBy || 'an editor'))).join('') + '</div>' : '<p class="nx-fine">Nothing waiting.</p>') + '</section>' +
    '<section><h2 class="nx-label">Drafts · ' + drafts.length + '</h2>' + (drafts.length ? '<div class="nx-list">' + drafts.map(x => row(x, 'Saved by ' + (x.draftBy || 'an editor'))).join('') + '</div>' : '<p class="nx-fine">No drafts.</p>') + '</section>' +
    CHAPTERS.map(c=>{const rows=E.entries.filter(x=>(x.draft||x.published)?.chapter===c.id).sort((a,b)=>((a.draft||a.published).order||0)-((b.draft||b.published).order||0));return '<section><div class="nx-head"><h2 class="nx-label">'+c.n+' · '+esc(c.title)+'</h2><a class="nx-btn" href="#/guidebook/new/'+esc(c.id)+'">+ Add page</a></div>'+(rows.length?'<div class="nx-list">'+rows.map(x=>row(x,'Position '+((x.draft||x.published).order??0)+' · '+(x.draft?'Draft':x.published?.status==='ready'?'Ready on Test':'Needs review'))).join('')+'</div>':'<p class="nx-fine">No pages yet.</p>')+'</section>';}).join('')+
    (hidden.length ? '<section><h2 class="nx-label">Hidden · ' + hidden.length + '</h2><div class="nx-list">' + hidden.map(x => row(x, 'Readers can’t see this')).join('') + '</div></section>' : '') +
    '<p class="nx-fine">'+E.entries.filter(x => x.published && !x.hidden && x.published.status==='ready').length+' pages explicitly published to Test. Change a page’s chapter and position in its editor.</p>';
}

// Insert formatting at the cursor (or around the selected words).
function insert(kind, value) {
  const ta = document.querySelector('[data-ge-f=body]'); if (!ta) return;
  const a = ta.selectionStart, b = ta.selectionEnd, sel = ta.value.slice(a, b), before = ta.value.slice(0, a), after = ta.value.slice(b);
  const block = t => (before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '') + t + '\n\n';
  const out = { h2: block('## ' + (sel || 'Heading')), bold: '**' + (sel || 'bold words') + '**', list: block((sel || 'First point\nSecond point').split('\n').map(l => '- ' + l).join('\n')),
    steps: block((sel || 'First step\nSecond step').split('\n').map((l, i) => (i + 1) + '. ' + l).join('\n')), table: block('| Column | Column |\n| --- | --- |\n| Value | Value |'), h3: block('### ' + (sel || 'Subheading')), note: block('> ' + (sel || 'Practical note')),
    topic: '[' + (sel || (value.startsWith('chapter:') ? chapterOf(value.slice(8))?.title : guidebookPages().find(p => p.id === value)?.title) || value) + '](#/guidebook/' + (value.startsWith('chapter:') ? 'chapter/' + value.slice(8) : value) + ')', tool: '[[tool:' + value + '|' + (sel || TOOLS.find(t => t[0] === value)?.[1] || value) + ']]' }[kind];
  ta.value = before + out + after; E.edit.body = ta.value; ta.focus(); const pos = (before + out).length; ta.setSelectionRange(pos, pos);
}

async function save(action) {
  const e = E.edit, page = { ...e, id: e.isNew ? (e.id || slug(e.title)) : e.id, order:Number(e.order||0) };
  delete page.isNew; delete page.fromDraft; delete page._key; delete page._recoveryKey;
  E.busy = true; E.msg = ''; rerender();
  try {
    const j = await api('PUT', { expectedRevision: E.revision, action, page });
    E.revision = j.revision; clearLocal(e._recoveryKey||page.id); E.remoteDirty=false; E.localSaved=false; E.edit = null; E.state = 'idle'; loadEditorData(true); loadGuidebook(true);
    toast(action === 'publish' ? 'Published on Arcana Test.' : action === 'review' ? 'Sent for review.' : 'Draft saved. Only editors see it.');
    if (e.isNew) location.hash = action === 'publish' ? '#/guidebook/' + page.id : '#/guidebook/edit/' + page.id;
  } catch (err) { E.msg = err.message; } finally { E.busy = false; rerender(); }
}
async function autosave(){
 const e=E.edit;if(!e||E.busy)return;
 E.msg='';
 const id=e.isNew?(e.id||slug(e.title)):e.id;
 if(!id||e.title.trim().length<2||e.answer.trim().length<10){E.localSaved=true;return;}
 const sentVersion=E.editVersion,recoveryId=e._recoveryKey||id,page={...e,id,order:Number(e.order||0)};delete page.isNew;delete page.fromDraft;delete page._key;delete page._recoveryKey;
 E.busy=true;const label=document.querySelector('.he-autosave');if(label)label.textContent='Saving draft to Arcana Test…';
 try{
  const j=await api('PUT',{expectedRevision:E.revision,action:'draft',page});E.revision=j.revision;
  const wasNew=e.isNew;e.id=id;e.isNew=false;e._recoveryKey=id;
  if(wasNew)location.hash='#/guidebook/edit/'+id;
  if(sentVersion===E.editVersion){clearLocal(recoveryId);E.remoteDirty=false;E.localSaved=false;if(label)label.textContent='Draft autosaved to Arcana Test.';}
  else{clearLocal(recoveryId);E.remoteDirty=true;keepLocal();clearTimeout(autosaveTimer);autosaveTimer=setTimeout(autosave,250);}
  const existing=E.entries.find(x=>x.id===id);
  if(existing){existing.draft=page;existing.review=false;existing.draftBy='You';}
  else E.entries.push({id,published:null,draft:page,review:false,hidden:false,draftBy:'You',history:[]});
 }catch(err){E.remoteDirty=true;E.msg=err.status===409?'Another editor changed the Guidebook. Your device copy is safe; reload before saving.':err.message;keepLocal();if(label)label.textContent='Online save failed. A private copy is saved on this device.';}
 finally{E.busy=false;if(E.msg)rerender();}
}
async function act(action, extra = {}) {
  E.busy = true; rerender();
  try { const j = await api('PUT', { expectedRevision: E.revision, action, id: E.edit?.id, ...extra }); E.revision = j.revision; E.edit = null; E.state = 'idle'; loadEditorData(true); loadGuidebook(true); toast({ discard: 'Draft discarded.', hide: 'Hidden from readers.', unhide: 'Visible to readers.', restore: 'Restored and published.' }[action]); }
  catch (err) { toast(err.message); } finally { E.busy = false; rerender(); }
}

export function initGuidebookEditor(render) {
  rerender = render;
  let lastHash=location.hash,skipHashConfirm=false;
  document.addEventListener('input', e => {
    const k = e.target.dataset?.geF; if (!k || !E.edit) return;
    E.edit[k] = e.target.value;
    E.editVersion++;
    if (k === 'title' && E.edit.isNew && !E.edit.idTouched) { E.edit.id = slug(e.target.value); const f = document.querySelector('[data-ge-f=id]'); if (f) f.value = E.edit.id; }
    if (k === 'id') E.edit.idTouched = true;
    E.remoteDirty=true;clearTimeout(autosaveTimer);keepLocal();
    const label=document.querySelector('.he-autosave');if(label)label.textContent='Changes saved in a private recovery copy. Saving draft…';
    autosaveTimer=setTimeout(autosave,1300);
  });
  document.addEventListener('input',e=>{
    if(e.target.matches('[data-gc-search]')){
      E.contributorQuery=e.target.value;clearTimeout(contributorSearchTimer);
      const query=E.contributorQuery.trim();
      if(query.length<2){E.contributorMatches=[];rerender();return;}
      contributorSearchTimer=setTimeout(async()=>{
        try{const r=await fetch('/api/admin/guidebook/contributors?q='+encodeURIComponent(query),{credentials:'same-origin',cache:'no-store'}),j=await r.json();if(r.ok){E.contributorMatches=j.matches||[];rerender();}}
        catch{E.contributorMatches=[];rerender();}
      },280);
    }
    if(e.target.matches('[data-gc-name]')){
      const userId=e.target.dataset.gcName,c=E.contributors.find(x=>x.userId===userId);if(c)c.creditName=e.target.value;
    }
  });
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-gc]');if(!b||b.disabled)return;
    const action=b.dataset.gc;
    if(action==='add'){
      const m=E.contributorMatches.find(x=>x.id===b.dataset.id);if(m&&!E.contributors.some(c=>c.userId===m.id))E.contributors.push({userId:m.id,displayName:m.displayName,creditName:''});rerender();return;
    }
    if(action==='remove'){E.contributors=E.contributors.filter(c=>c.userId!==b.dataset.id);rerender();return;}
    if(action==='save'){
      E.busy=true;rerender();
      try{const j=await api('PUT',{expectedRevision:E.revision,action:'contributors',contributors:E.contributors.map(({userId,creditName})=>({userId,creditName}))});E.revision=j.revision;E.contributors=j.contributors||[];E.contributorMatches=[];E.contributorQuery='';E.state='idle';toast('Contributor credits saved.');loadEditorData(true);loadGuidebook(true);}
      catch(err){toast(err.message);}
      finally{E.busy=false;rerender();}
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset?.geF) { E.edit[t.dataset.geF] = t.dataset.geF==='order'?Number(t.value):t.value; }
    if(t.dataset?.geRelated){const refs=new Set(E.edit.related||[]);t.checked?refs.add(t.dataset.geRelated):refs.delete(t.dataset.geRelated);E.edit.related=[...refs].slice(0,5);}
    if(t.dataset?.geF||t.dataset?.geRelated){E.editVersion++;E.remoteDirty=true;clearTimeout(autosaveTimer);keepLocal();autosaveTimer=setTimeout(autosave,700);}
    if (t.dataset?.ge === 'topic' && t.value) { insert('topic', t.value); t.value = ''; }
    if (t.dataset?.ge === 'tool' && t.value) { insert('tool', t.value); t.value = ''; }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ge]'); if (!b || b.disabled || b.tagName === 'SELECT') return;
    const a = b.dataset.ge;
    if (a !== 'save' && a !== 'discard' && a !== 'restore') E.confirm = '';
    if (a === 'reload') { E.state = 'idle'; return render(); }
    if (a === 'mode') { E.preview = b.dataset.v === 'preview'; return render(); }
    if (a === 'ins') return insert(b.dataset.v);
    if (a === 'save') {
      if (b.dataset.v === 'publish' && E.confirm !== 'publish') { E.confirm = 'publish'; return render(); }
      E.confirm = ''; return save(b.dataset.v);
    }
    if (a === 'discard') { if (E.confirm !== 'discard') { E.confirm = 'discard'; return render(); } E.confirm = ''; return act('discard'); }
    if (a === 'vis') return act(entry(E.edit.id)?.hidden ? 'unhide' : 'hide');
    if (a === 'restore') { if (E.confirm !== 'restore' + b.dataset.i) { E.confirm = 'restore' + b.dataset.i; return render(); } E.confirm = ''; return act('restore', { index: Number(b.dataset.i) }); }
  });
  document.addEventListener('click',e=>{
   const link=e.target.closest('a[href^="#"]');if(!link||!E.edit||!E.remoteDirty)return;
   if(!confirm('Your latest changes are still syncing. A private recovery copy is saved on this device. Leave this editor?'))e.preventDefault();else skipHashConfirm=true;
  },true);
  window.addEventListener('hashchange',()=>{
   const next=location.hash;
   if(skipHashConfirm){skipHashConfirm=false;lastHash=next;return;}
   if(E.edit&&E.remoteDirty&&!confirm('Your latest changes are still syncing. A private recovery copy is saved on this device. Leave this editor?')){
    history.replaceState(null,'',location.pathname+location.search+lastHash);rerender();return;
   }
   lastHash=next;
  });
  window.addEventListener('beforeunload',e=>{if(E.edit&&E.remoteDirty){e.preventDefault();e.returnValue='';}});
}
