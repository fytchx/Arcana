import test from 'node:test';
import assert from 'node:assert/strict';
import {convertFandomPages,importLinkMarkup,imageKey,suggestedImageMatch} from '../src/fandom-import.js';
import {normalizeWikiDraft,validateWikiDraft,publicWikiArticle} from '../src/wiki-studio-model.js';
import {wikiArticleView} from '../src/wiki-views.js';
const base='https://idlearc.fandom.com/wiki/Main_Page';
const page=(title,text,namespace=0)=>({title,text,namespace,redirect:false,revisionAt:'2026-10-11T12:00:00Z',
 contributors:['ExampleEditor'],siteName:'IdleArc Wiki',baseUrl:base});
const pages=[
 page('Pet Compound',[
 'This is the compound system reference, with a practical explanation of how to set up four pets and compare their effectiveness.',
 '','== Understanding the system ==',
 'Seasonal compound levels can affect the equipped pet team. [[Class Skill Guide|See class synergy]] to plan your character.',
 '','[[File:Pet Compound Screen.png|thumb|An equipped pet]]',
 '{| class="wikitable"','! Rarity !! Compound','|-','| Normal || 10','|-','| Rare || 20','|}'
 ].join('\n')),
 page('Class Skill Guide',[
 '{{Infobox Class','| Role = Combat','| Focus = Survival','}}',
 'This is a practical guide for different classes, their tier choices, and playing strategies for new players.',
 '','== Example ==','See [[Pet Compound]] and [[Not Exported]] for background. [[Category:Classes]]'
 ].join('\n')),
 page('Talk:Private page','Not an article',1),
 {...page('Redirect Page','#REDIRECT [[Class Skill Guide]]'),redirect:true}
];
test('Migration creates private drafts, handles namespaces, duplicates, infoboxes, tables, links and artwork',()=>{
 const {drafts,total,skipped}=convertFandomPages(pages,{existingIds:['pet-compound']});
 assert.equal(total,4);assert.equal(skipped,2);assert.equal(drafts.length,2);
 const pet=drafts[0],guide=drafts[1];
 assert.equal(pet.draft.id,'imported-pet-compound');
 assert.equal(guide.draft.id,'class-skill-guide');
 assert.equal(pet.draft.sections.find(s=>s.table.length).table[1][0],'Normal');
 assert.deepEqual(guide.draft.sections[0].table[1],['Role','Combat']);
 assert.deepEqual(pet.draft.relatedArticles,['class-skill-guide']);
 assert.deepEqual(guide.draft.relatedArticles,['imported-pet-compound']);
 assert.ok(pet.draft.sections.find(s=>s.imageRef==='Pet Compound Screen.png'));
 assert.equal(pet.draft.importSource.sourceUrl,'https://idlearc.fandom.com/wiki/Pet_Compound');
 assert.equal(pet.draft.importSource.contributors[0],'ExampleEditor');
 assert.ok(guide.unresolvedLinks.includes('Not Exported'));
 assert.equal(pet.draft.images.length,0);
 assert.equal(validateWikiDraft(pet.draft).valid,false,'Missing illustration must block publishing');
 const fixed=normalizeWikiDraft({...pet.draft,sections:pet.draft.sections.map(s=>({...s,imageRef:''})),images:[]});
 assert.ok(fixed.sections.some(s=>s.table.length>=3),'Structured table survives Studio normalization');
 assert.equal(validateWikiDraft(fixed).valid,true);
 const publicPage=publicWikiArticle(fixed);
 assert.equal(publicPage.attribution.sourceTitle,'Pet Compound');
 assert.equal(publicPage.sections.find(s=>s.table.length).table[1][0],'Normal');
 const html=wikiArticleView(publicPage);
 assert.match(html,/wikiImportedInlineLink/);
 assert.match(html,/class-skill-guide/);
 assert.match(html,/Originally published at/);
 assert.match(html,/ExampleEditor/);
 assert.doesNotMatch(html,/Season 2 reference/);
});
test('Review notes stay private and imported inline links are escaped',()=>{
 const {drafts}=convertFandomPages([page('Attack Guide','This detailed example describes a way to approach the game, with enough words to qualify as a complete introductory section. <script>alert(1)</script>\n\n[[Missing target]]')]);
 assert.ok(drafts[0].draft.importSource.unresolvedLinks.includes('Missing target'));
 const html=importLinkMarkup('Safe [[arcana:pet-compound|<img src=x onerror=alert(1)>]] and <script>',text=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
 assert.doesNotMatch(html,/<img|<script>/);
 assert.match(html,/href="#\/wiki\/article\?id=pet-compound"/);
 assert.equal(imageKey('File:Pet_Compound_Screen.PNG'),imageKey('pet compound screen.webp'));
 assert.equal(suggestedImageMatch('Pet_Compound_Screen.png',[{name:'pet compound screen.webp'}]).length,1);
});
