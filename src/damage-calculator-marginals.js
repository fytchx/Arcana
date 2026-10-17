/**
 * Source-preserving marginal gains for the Arcana Damage Calculator.
 *
 * This ranks equal percentage-POINT changes to verified, already-entered
 * stages. It does NOT imply that a particular item/pet offers those rolls,
 * nor does it turn attribute percentages into raw attribute points.
 */
import {calculateAttack,calculatePet,relativeDifference} from './damage-calculator-engine.js';

const number=value=>value!==null && value!==undefined && value!=='' &&
  Number.isFinite(Number(value));
const clone=value=>JSON.parse(JSON.stringify(value));
const LABELS=Object.freeze({
  'attack.additive':'Attack additive % (shared)',
  'attack.layers':'Attack independent × layer',
  'pet.layers':'Pet independent × layer',
});
export function rankPercentagePointGains(build={},kind='pet',points=10){
  if(kind!=='pet' && kind!=='attack')throw new RangeError('Expected pet or attack');
  const increase=Number(points);
  if(!Number.isFinite(increase)||increase<=0||increase>1000)
    throw new RangeError('Percentage-point increase must be between 0 and 1000');
  const snapshot=build?.[kind]||{};
  const formula=kind==='pet'?calculatePet:calculateAttack;
  const base=formula(snapshot);
  // Pet multiplier needs at least one measured layer; attack needs a
  // measured weapon/jewelry base, or otherwise gains are imaginary.
  const stages=kind==='pet'?['layers']:['additive','layers'];
  const observed=stages.some(stage=>Object.values(snapshot?.[stage]||{}).some(number));
  if(!observed || (kind==='attack' && !base.known))
    return {kind,points:increase,known:false,rows:[],reason:'Enter an observed damage source first'};
  const metric=result=>kind==='pet'?result.layerFactor:(result.min+result.max)/2;
  const baseMetric=metric(base);
  if(baseMetric<=0)return {kind,points:increase,known:false,rows:[],reason:'Cannot compare against zero damage'};
  const rows=[];
  for(const stage of stages){
    for(const [source,value] of Object.entries(snapshot?.[stage]||{})){
      if(!number(value))continue;
      const next=clone(snapshot);
      next[stage][source]=Number(value)+increase;
      const metricAfter=metric(formula(next));
      const gain=relativeDifference(baseMetric,metricAfter);
      if(!gain)continue;
      rows.push({path:kind+'.'+stage+'.'+source,stage,source,
        displayStage:LABELS[kind+'.'+stage],original:Number(value),
        adjusted:Number(value)+increase,points:increase,
        before:baseMetric,after:metricAfter,percentGain:gain.percentChange,
        factorGain:gain.ratio});
    }
  }
  rows.sort((a,b)=>b.percentGain-a.percentGain||a.path.localeCompare(b.path));
  return {kind,points:increase,known:true,metric:kind==='pet'?'pet-multiplier':'average-displayed-attack',baseline:baseMetric,rows};
}
