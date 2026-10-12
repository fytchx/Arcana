import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveOfficialSprite,resolveOfficialEmblem,hasCodexOfficialArt,codexOfficialArt} from '../src/assets.js';
const sample={
 skills:{cols:3,rows:2,mapping:{'warrior:retaliation':0,'rogue:retaliation':1,'mage:frost-barrier':2}},
 monsters:{cols:2,rows:2,mapping:{'elder-wraith':0,'rift-guardian':1}},
 biomes:{cols:2,rows:1,mapping:{'umbral-rift':0}},
 materials:{cols:2,rows:1,mapping:{'mithril-ore':0}},
 equipment:{cols:2,rows:1,mapping:{'broken-sword':0}},
 items:{cols:2,rows:1,mapping:{'broken-sword':0}},
 pets:{cols:2,rows:1,mapping:{'shadow-wolf':0}},
 icons:{cols:2,rows:1,mapping:{'currency':1}}
};
test('direct source chooses exact official artwork for monsters, biomes, pets and materials',()=>{
 for(const [kind,title,category] of [['monster','Elder Wraith','monsters'],['biome','Umbral Rift','biomes'],['material','Mithril Ore','materials'],['pet','Shadow Wolf','pets']]){
  const image=resolveOfficialSprite({gameKind:kind,title},sample);
  assert.equal(image?.category,category,`${kind}: ${title}`);
 }
});
test('class skill mapping uses correct class and rejects ambiguous classless skills',()=>{
 assert.equal(resolveOfficialSprite({gameKind:'class-skill',title:'Retaliation',className:'Warrior'},sample)?.index,0);
 assert.equal(resolveOfficialSprite({gameKind:'class-skill',title:'Retaliation',facts:[['Class','Rogue']]},sample)?.index,1);
 assert.equal(resolveOfficialSprite({gameKind:'class-skill',title:'Retaliation'},sample),null);
});
test('item mappings do not guess between unrelated atlas keys',()=>{
 assert.equal(resolveOfficialSprite({gameKind:'item',title:'Broken Sword'},sample)?.category,'items');
 assert.equal(resolveOfficialSprite({gameKind:'item',title:'Unverified Sword'},sample),null);
});
test('source-provided category emblems are explicitly marked, never mistaken for exact art',()=>{
 const emblem=resolveOfficialEmblem({gameKind:'pet-affix',title:'Unknown Affix'}, {categories:sample,categoryEmblems:{'pet-affix':['icons','currency']}});
 assert.equal(emblem?.isCategoryEmblem,true);
 assert.equal(resolveOfficialEmblem({gameKind:'pet-affix'}, {categories:sample,categoryEmblems:{'pet-affix':['icons','does-not-exist']}}),null);
});
test('reject invalid mapping indexes rather than generating broken background positions',()=>{
 const groups={monsters:{cols:2,rows:1,mapping:{ghost:12}}};
 assert.equal(resolveOfficialSprite({gameKind:'monster',title:'Ghost'},groups),null);
});
test('Codex references direct official-art images, while Labs retain legacy sprite logic',()=>{
 assert.match(codexOfficialArt({gameKind:'monster',title:'Missing Monster'}),/data-art-status="unmatched"/);
 assert.equal(hasCodexOfficialArt({gameKind:'pet-affix'}),false);
});

test('possessive item names use a labeled alias, never confuse numbered variants',()=>{
 const groups={equipment:{cols:2,rows:2,mapping:{'warrior-belt':0,'warrior-belt-2':1}}};
 const result=resolveOfficialSprite({gameKind:'item',title:"Warrior's Belt"},groups);
 assert.equal(result?.key,'warrior-belt');
 assert.equal(result?.matchType,'name-alias');
});
test('first-pet variant is intentionally representative, while unrelated names stay unmatched',()=>{
 const groups={pets:{cols:2,rows:1,mapping:{'bober-1':0}}};
 const a=resolveOfficialSprite({gameKind:'pet',title:'Bober'},groups);
 assert.equal(a?.matchType,'representative-pet');
 assert.equal(resolveOfficialSprite({gameKind:'pet',title:'Octopusia'},groups),null);
});
test('verified plural currency alias maps Rubies to ruby, not Gold to an invented coin',()=>{
 const groups={currency:{cols:2,rows:1,mapping:{ruby:0,coin:1}}};
 assert.equal(resolveOfficialSprite({gameKind:'currency',title:'Rubies'},groups)?.key,'ruby');
 assert.equal(resolveOfficialSprite({gameKind:'currency',title:'Gold'},groups),null);
});
