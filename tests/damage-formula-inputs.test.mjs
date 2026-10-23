import test from 'node:test';
import assert from 'node:assert/strict';
import {splitFormulaInput,joinFormulaInput,formulaInputHint,averageChange} from '../src/damage-formula-inputs.js';
import {fieldNumber,calculateFormula} from '../src/damage-formula.js';

test('phone-friendly magnitude picker and lowercase shorthand produce the same defense',()=>{
 assert.equal(joinFormulaInput('100','M','flat'),'100M');
 assert.equal(fieldNumber(joinFormulaInput('100','M','flat'),'flat'),100000000);
 assert.equal(fieldNumber('100m','flat'),100000000);
 assert.equal(formulaInputHint('100M','flat'),'= 100,000,000');
 assert.deepEqual(splitFormulaInput('87.99m','flat'),{amount:'87.99',unit:'M'});
 assert.equal(joinFormulaInput('87.99m','M','flat'),'87.99m');
 assert.equal(joinFormulaInput('','M','flat'),'');
});
test('saved, imported and pasted values round trip without precision loss or double units',()=>{
 for(const [kind,raw] of [['flat','87.99M'],['flat','0'],['flat','1,234.56'],['percent','+474.7'],['percent','1.48K%'],['percent','x15.84'],['percent','x1.43B'],['factor','0.60'],['percentOf','70']]){
  const split=splitFormulaInput(raw,kind),joined=joinFormulaInput(split.amount,split.unit,kind);
  assert.equal(fieldNumber(joined,kind),fieldNumber(raw,kind),raw);
 }
 assert.equal(joinFormulaInput('100m','M','flat'),'100m');
 assert.equal(joinFormulaInput('x15.84','%','percent'),'x15.84');
 assert.equal(formulaInputHint('x15.84','percent'),'×15.84 multiplier');
 assert.equal(formulaInputHint('1.48K%','percent'),'×15.8 multiplier');
 assert.equal(formulaInputHint('wat','flat'),'Check this value');
});
test('magnitude selection never silently sanitizes malformed input',()=>{
 assert.ok(Number.isNaN(fieldNumber(joinFormulaInput('12oops','M','flat'),'flat')));
 assert.equal(joinFormulaInput('100%','M','flat'),'100%');
 assert.equal(joinFormulaInput('1','unexpected','flat'),'1');
 assert.deepEqual(splitFormulaInput('','flat'),{amount:'',unit:''});
});
test('saved baseline comparison uses matching mode average and handles zero or missing bases',()=>{
 const base=calculateFormula('attack',{'base.weaponMin':'10','base.weaponMax':'20'});
 const next=calculateFormula('attack',{'base.weaponMin':'10','base.weaponMax':'20','layers.runes':'100'});
 assert.equal(averageChange(base,next),100);assert.equal(averageChange(next,base),-50);
 assert.equal(averageChange({ready:true,average:0},next),null);
 assert.equal(averageChange(calculateFormula('pet'),next),null);
});
