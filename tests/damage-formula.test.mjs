import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNumber,fieldNumber,blankFormulaState,readFormulaState,saveFormulaState,calculateFormula,FORMULA_KEY,normalizeFormulaState} from '../src/damage-formula.js';
import {parseFormulaText} from '../src/damage-formula-import.js';
test('blank first use; independent modes survive reload and clearing',()=>{
 const data=new Map(),store={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const s=readFormulaState(store);assert.deepEqual(s,blankFormulaState());
 for(const mode of ['attack','retaliation','pet'])assert.equal(calculateFormula(mode).ready,false);
 s.values.attack={'base.weaponMin':'0','base.weaponMax':'0'};
 s.values.pet={'base.min':'10','base.max':'20'};s.mode='pet';assert.equal(saveFormulaState(s,store),true);
 assert.deepEqual(readFormulaState(store),s);
 s.values.pet={};saveFormulaState(s,store);assert.deepEqual(readFormulaState(store).values.pet,{});
 assert.deepEqual(readFormulaState(store).values.attack,s.values.attack);
 data.set(FORMULA_KEY,'invalid');assert.deepEqual(readFormulaState(store),blankFormulaState());
 assert.equal(saveFormulaState(s,{setItem(){throw Error('denied');}}),false);
 assert.deepEqual(normalizeFormulaState({mode:'bad',values:{attack:{x:'<script>'}}}),blankFormulaState());
});
test('number shorthand, exact factor entry, invalid values and no legacy caps',()=>{
 assert.equal(parseNumber(' 87.99 M '),87990000);assert.equal(parseNumber('1,234.5'),1234.5);
 assert.equal(parseNumber('4.6T'),4.6e12);assert.equal(fieldNumber('x15.84','percent'),1484);
 assert.equal(fieldNumber('×0.60','factor'),.6);assert.equal(fieldNumber('1.48K%','percent'),1480);
 assert.ok(Number.isNaN(parseNumber('Infinity')));assert.ok(Number.isNaN(parseNumber('12oops')));
 assert.equal(calculateFormula('attack',{'base.weaponMin':'1','base.weaponMax':'1','layers.runes':'1T'}).max,10000000001);
});
test('attack adds flats after additive stage and multiplies independent layers separately',()=>{
 const r=calculateFormula('attack',{'base.weaponMin':'10','base.weaponMax':'20','base.jewelryMin':'2','base.jewelryMax':'4','additive.class':'100','additive.strength':'50','flat.tree':'3','layers.runes':'100','layers.guild':'50'});
 assert.equal(r.ready,true);assert.equal(r.min,99);assert.equal(r.max,189);assert.equal(r.average,144);
 const zero=calculateFormula('attack',{'base.weaponMin':'0','base.weaponMax':'0'});assert.equal(zero.max,0);
 assert.equal(calculateFormula('attack',{'base.weaponMin':'1'}).ready,false);
 assert.equal(calculateFormula('attack',{'base.weaponMin':'2','base.weaponMax':'1'}).ready,false);
 assert.equal(calculateFormula('attack',{'base.weaponMin':'0','base.weaponMax':'0','flat.tree':'0x12'}).ready,false);
});
test('pet uses pre-bonus base plus level scaling plus flats, not already-final damage',()=>{
 const r=calculateFormula('pet',{'base.min':'10','base.max':'20','base.levelMin':'3','base.levelMax':'5','flat.runes':'7','layers.equipment':'100','layers.shards':'200'});
 assert.equal(r.min,120);assert.equal(r.max,192);assert.equal(r.layerFactor,6);
 assert.equal(calculateFormula('pet',{'layers.shards':'200'}).max,null);
 assert.equal(calculateFormula('pet',{'base.min':'1','base.max':'2','base.levelMin':'5'}).ready,false);
});
test('retaliation base pool has no +1 and blocked factor stays separate',()=>{
 const r=calculateFormula('retaliation',{'base.defense':'100','base.reflecting':'100','base.deflection':'40','base.bulwark':'10','base.ratio':'.6','layers.strength':'100','event.minimum':'70','event.stance':'x1.25','event.blocked':'1.75'});
 assert.equal(r.ready,true);assert.equal(r.max,225);assert.equal(r.min,157.5);assert.equal(r.average,191.25);
 assert.equal(r.blocked.max,393.75);
 assert.equal(calculateFormula('retaliation',{'base.defense':'100'}).ready,false);
});
test('screenshot formula is consistent with displayed retaliation range to tooltip precision',()=>{
 // Test-only fixture, never exported into the application or first-use state.
 const v={'base.defense':'87.99M','base.reflecting':'144.3','base.deflection':'40','base.bulwark':'15','base.ratio':'.60','layers.strength':'x15.84','layers.petStrength':'474.7','layers.pet':'524','layers.inscription':'120','layers.runes':'413.4','layers.guild':'77.8','layers.echo':'15','layers.sets':'40','layers.gems':'13.3','layers.time':'71','event.minimum':'70','event.stance':'1.25','event.blocked':'1.75'};
 const r=calculateFormula('retaliation',v);assert.equal(r.ready,true);
 assert.ok(Math.abs(r.average/3.98e12-1)<.01);assert.ok(Math.abs(r.min/3.28e12-1)<.01);
});
test('OCR maps stages, ignores totals, deduplicates overlap and requires conflict review',()=>{
 const pet=parseFormulaText('pet','Pet Damage Breakdown\nRunes +7.83K\nGuild Bonus +2.13K\nEquipment Affixes +5.39K% (x54.91)\nRunes +1.07K% (x11.68)\nEffective multiplier x1.43B');
 assert.deepEqual(pet.fields,[{id:'flat.runes',value:'+7.83K'},{id:'flat.guild',value:'+2.13K'},{id:'layers.equipment',value:'x54.91'},{id:'layers.runes',value:'x11.68'}]);
 const ret=parseFormulaText('retaliation','Retaliation Breakdown\nDefense 87.99M\nGlobal ratio ×0.60\nStrength +1.48K% (×15.84)\nStrength +1.48K% (×15.84)\nBlocked attacks ×1.75\nCombat Stance ×1.25\nStrength +1500%');
 assert.ok(ret.fields.some(f=>f.id==='base.defense'&&f.value==='87.99M'));
 assert.ok(ret.fields.some(f=>f.id==='layers.strength'&&f.value==='x15.84'));
 assert.deepEqual(ret.conflicts,['layers.strength']);
 assert.equal(parseFormulaText('attack','Pet Damage Breakdown').wrongMode,true);
});
test('OCR parses attack groups without faint headings',()=>{
 const r=parseFormulaText('attack','Attack Damage Breakdown\nWeapon 7.9K - 11.29K\nClass skills +225%\nStrength (from items) (2.37K) +1.78K%\nTalisman Inscription +16% (x1.16)\nSkill tree flat +1.63K');
 assert.ok(r.fields.some(f=>f.id==='base.weaponMin'&&f.value==='7.9K'));
 assert.ok(r.fields.some(f=>f.id==='additive.class'&&f.value==='+225'));
 assert.ok(r.fields.some(f=>f.id==='additive.strength'&&f.value==='+1.78K'));
 assert.ok(r.fields.some(f=>f.id==='flat.tree'&&f.value==='+1.63K'));
});
