/**
 * Retaliation tooltip-stage reconstruction, IdleArc v1.3.6 build 167,
 * 2026-10-17 screenshots #5 and #6 of user supplied character set.
 *
 * The independent BASE POOL is:
 * Defense × globalRatio × ((Reflecting+Deflection+Bulwark)/100).
 * This is NOT (1+basePoolBonuses/100), and is NOT a rescaling of attack.
 *
 * The screenshot's ordinary damage interval (70%–100% of max) includes
 * combat-stance ×1.25 and DOES NOT multiply by the block-only ×1.75.
 * Blocked attacks have their own conditional branch. Do not use this
 * screen alone to infer actual attack frequency, crits or real DPS.
 */
const clean=(v)=>Number.isFinite(Number(v))?Math.max(0,Math.min(Number(v),1e12)):0;
const add=(x)=>Object.values(x||{}).reduce((n,v)=>n+clean(v),0);
export function calculateRetaliation(input={}) {
  const required=['defense','globalRatio','baseBonuses','layers','combatStanceFactor','rollMinFactor'];
  // Distinguish an unknown defense ratio or roll envelope from zero.
  const ready=input.defense!==undefined && input.globalRatio!==undefined &&
    input.baseBonuses!==undefined && input.layers!==undefined &&
    input.combatStanceFactor!==undefined && input.rollMinFactor!==undefined;
  if(!ready)return {known:false,reason:'Requires defense, global ratio, base-pool sources, individual layers, stance and observed roll envelope',min:null,max:null};
  const defense=clean(input.defense);
  const globalRatio=clean(input.globalRatio);
  const basePoolPct=add(input.baseBonuses);
  const basePool=defense*globalRatio*(basePoolPct/100);
  const breakdown=Object.entries(input.layers).map(([name,pct])=>({name,pct:clean(pct),factor:1+clean(pct)/100}));
  const layeredFactor=breakdown.reduce((n,x)=>n*x.factor,1);
  const combatStanceFactor=clean(input.combatStanceFactor);
  const rollMinFactor=Math.min(1,clean(input.rollMinFactor));
  const max=basePool*layeredFactor*combatStanceFactor;
  const min=max*rollMinFactor;
  const conditionalBlockedFactor=input.blockedFactor===undefined?null:clean(input.blockedFactor);
  return {
    known:true,kind:'retaliation',defense,basePoolPct,basePool,layerBreakdown:breakdown,
    layeredFactor,combatStanceFactor,rollMinFactor,
    blockedFactor:conditionalBlockedFactor,
    min,max,displayMidpoint:(min+max)/2,
    // A blocked hit needs separate actual combat verification.
    blockedRange:conditionalBlockedFactor===null?null:
      {min:min*conditionalBlockedFactor,max:max*conditionalBlockedFactor},
    criticalAndDoubleHitsIncluded:false,
    appliedBlockFactorToBaseRange:false,
  };
}
