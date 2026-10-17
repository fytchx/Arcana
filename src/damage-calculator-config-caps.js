/**
 * Config-backed skill-effect CAP evaluator for the Arcana Damage Calculator.
 * Reduced whitelist transcribed from IdleArc /config/game version
 * 2026-10-17-001 (complete JSON, 87 top-level keys).
 *
 * Caps apply to OUTPUTS, not to spendable ranks or all damage.
 * This module does not calculate runtime proc order, DPS, or uncapped skills.
 * The original full config and any private captures are not committed.
 */
export const CAP_CONFIG_VERSION = '2026-10-17-001';
export const SKILL_CLASS_NAMES = Object.freeze({1:'Warrior',2:'Archer',3:'Mage',4:'Rogue',5:'Druid'});

// [id, maximum allocated points, in-game name] for all five classes.
const CLASS_ROWS = {"1":[[7,5,"Culling strike"],[22,5,"Battle Recovery"],[23,5,"Executioner"],[46,10,"Iron Constitution"],[47,5,"Bloodthirst"],[48,5,"Counterstrike"],[8,10,"Mighty strikes"],[24,5,"Crushing Blows"],[25,5,"Overwhelm"],[49,5,"Battle Focus"],[50,5,"Titan's Grip"],[51,5,"Titanic Blow"],[9,10,"Berserk"],[26,5,"Keen Edge"],[27,5,"Lethal Blow"],[52,5,"Spoils of War"],[53,5,"Deflection"],[54,5,"Relentless Assault"]],"2":[[3,10,"Archery"],[10,5,"Precision"],[11,5,"Headshot"],[28,10,"Steady Aim"],[29,5,"Double Nock"],[30,5,"Perfect Shot"],[2,10,"Spike trap"],[12,5,"Venomous Trap"],[13,5,"Hunter's Mark"],[31,5,"Barbed Arrows"],[32,5,"Trap Mastery"],[33,5,"Hunter's Instinct"],[1,5,"Strong pet bound"],[14,5,"Beast Bond"],[15,5,"Pack Leader"],[34,5,"Egg Hunter"],[35,5,"Foraging Companion"],[36,5,"Alpha Strike"]],"3":[[4,10,"Magic blast"],[16,5,"Arcane Surge"],[17,5,"Spell Mastery"],[37,5,"Arcane Siphon"],[38,5,"Unstable Energy"],[39,5,"Arcane Cascade"],[5,10,"Fire infusion"],[18,5,"Burning Soul"],[19,5,"Inferno"],[40,5,"Combustion"],[41,5,"Melting Point"],[42,5,"Pyroclasm"],[6,10,"Wild magic"],[20,5,"Chaos Bolt"],[21,5,"Reality Warp"],[43,5,"Fortune's Favor"],[44,5,"Soul Harvest"],[45,5,"Chaos Incarnate"]],"4":[[55,5,"Precision Strikes"],[56,5,"Sharpened Blades"],[57,5,"First Strike"],[58,5,"Contract Killer"],[59,5,"Deadly Ambush"],[60,10,"Coup de Grace"],[61,5,"Swift Blades"],[62,5,"Umbral Blades"],[63,5,"Shadow Echo"],[64,5,"Phantom Strike"],[65,10,"Echo Mastery"],[66,10,"Umbral Cascade"],[67,5,"Scavenger"],[68,5,"Pickpocket"],[69,5,"Lucky Hands"],[70,5,"Treasure Hunter"],[71,5,"Black Market"],[72,5,"Master Thief"]],"5":[[73,10,"Gnaw"],[74,5,"Dam Builder"],[75,5,"Tail Slap"],[76,5,"Lodgekeeper"],[77,5,"Thick Pelt"],[78,5,"Timberfall"],[79,10,"Digger"],[80,5,"Keen Snout"],[81,5,"Hoard"],[82,5,"Earthbind"],[83,5,"Undermine"],[84,5,"Deep Roots"],[85,10,"Kinship"],[86,5,"Shared Instinct"],[87,5,"Feral Bond"],[88,5,"Twin Heart"],[89,5,"Wild Attunement"],[90,5,"One Soul"]]};
export const SKILL_CATALOG = Object.freeze(Object.fromEntries(
  Object.entries(CLASS_ROWS).flatMap(([classId,rows])=>
    rows.map(([id,maxAllocated,name])=>[id,Object.freeze({id,classId:Number(classId),maxAllocated,name})]))
));

// [key, output cap, base, gate skill id (or null), skill/rank contributions, display skill ids].
const CAP_ROWS = [["boss_damage_bonus",100,0,null,[[21,5],[25,5],[13,5],[58,5],[78,5]],[21,25,13,58,78]],["execute_threshold",35,0,null,[[7,1],[23,1],[60,1],[83,2]],[7,23,60,83]],["counterstrike_block_bonus",25,0,null,[[48,2]],[48]],["titanic_blow_chance",80,0,null,[[51,4]],[51]],["relentless_assault_chance",100,0,null,[[54,10]],[54]],["bloodthirst_extra_kill",10,0,null,[[47,1]],[47]],["deflection_block",25,0,null,[[53,2]],[53]],["deflection_retaliation",40,0,null,[[53,4]],[53]],["perfect_shot_chance",80,0,null,[[30,5]],[30]],["trap_damage",35,0,null,[[2,1.5],[32,1]],[2,32]],["hunters_instinct_chance",15,0,null,[[33,1]],[33]],["alpha_strike_chance",60,0,null,[[36,3],[75,3]],[36,75]],["magic_blast_chance",100,50,4,[[38,5]],[4,38]],["arcane_cascade_chance",100,0,null,[[39,8]],[39]],["pyroclasm_damage",100,0,null,[[42,5]],[42]],["shadow_echo_chance",100,0,63,[[63,5],[65,2]],[63,65]],["shadow_echo_damage",80,40,63,[[65,2]],[63,65]],["umbral_cascade_chance",75,0,null,[[66,4]],[66]],["lucky_hands_duplicate",15,0,null,[[69,2]],[69]],["lucky_tier",20,0,null,[[71,2]],[71]],["attack_pet_conversion",75,0,null,[[85,3],[87,4]],[85,87]],["wild_attunement_amp",25,0,null,[[89,3]],[89]],["pet_egg_drop",15,0,null,[[80,1],[34,1]],[80,34]],["deep_roots_pet_xp",15,0,null,[[84,1]],[84]]];
export const CONFIGURED_SKILL_CAPS = Object.freeze(CAP_ROWS.map(([key,cap,base,gateSkillId,contributions,displaySkillIds])=>
  Object.freeze({key,cap,base,gateSkillId,
    contributions:Object.freeze(contributions.map(([skillId,perRank])=>Object.freeze({skillId,perRank}))),
    displaySkillIds:Object.freeze(displaySkillIds)})));

const bounded=(value,max=100000)=>Number.isFinite(Number(value))?Math.min(max,Math.max(0,Number(value))):0;
export function classCapSkills(classId) {
  const id=Number(classId);
  const required=new Set();
  for(const cap of CONFIGURED_SKILL_CAPS){
    for(const skillId of cap.displaySkillIds)if(SKILL_CATALOG[skillId]?.classId===id)required.add(skillId);
    for(const {skillId} of cap.contributions)if(SKILL_CATALOG[skillId]?.classId===id)required.add(skillId);
    if(SKILL_CATALOG[cap.gateSkillId]?.classId===id)required.add(cap.gateSkillId);
  }
  return [...required].map(id=>SKILL_CATALOG[id]).sort((a,b)=>a.id-b.id);
}
export function evaluateConfiguredSkillCaps({classId,allClassSkills=0,skills={}}={}) {
  const cid=Number(classId);
  if(!SKILL_CLASS_NAMES[cid])throw new RangeError('A valid IdleArc class ID (1..5) is required');
  const acs=Math.floor(bounded(allClassSkills,10000));
  const skillState=(skillId)=>{
    const meta=SKILL_CATALOG[skillId];
    if(!meta || meta.classId!==cid)return null;
    const input=skills?.[skillId]||{};
    const allocated=Math.floor(Math.min(meta.maxAllocated,bounded(input.allocated)));
    // Unlock is a separate signal. If absent, invested points establish unlock.
    const unlocked=input.unlocked===undefined?allocated>0:input.unlocked===true;
    return {skillId,allocated,unlocked,effectiveRank:unlocked?allocated+acs:0};
  };
  return CONFIGURED_SKILL_CAPS.filter(cap=>cap.displaySkillIds.some(id=>SKILL_CATALOG[id]?.classId===cid))
    .map(cap=>{
      const gateActive=cap.gateSkillId===null||Boolean(skillState(cap.gateSkillId)?.unlocked);
      const contributions=cap.contributions.filter(c=>SKILL_CATALOG[c.skillId]?.classId===cid).map(c=>{
        const rank=skillState(c.skillId);
        return {...rank,perRank:c.perRank,raw:gateActive?rank.effectiveRank*c.perRank:0};
      });
      const raw=gateActive?cap.base+contributions.reduce((n,c)=>n+c.raw,0):0;
      const applied=Math.min(cap.cap,raw);
      return {key:cap.key,cap:cap.cap,base:gateActive?cap.base:0,raw,applied,
        capped:raw>=cap.cap,wasted:Math.max(0,raw-applied),headroom:Math.max(0,cap.cap-applied),
        gateSkillId:cap.gateSkillId,gateActive,contributions,
        classId:cid,version:CAP_CONFIG_VERSION,unit:'percent'};
    });
}
export function compareConfiguredSkillCaps(input={}) {
  const baseline=evaluateConfiguredSkillCaps(input);
  const after=evaluateConfiguredSkillCaps({...input,allClassSkills:bounded(input.allClassSkills,10000)+1});
  return baseline.map((row,i)=>({...row,afterOneACS:after[i].applied,gainOneACS:after[i].applied-row.applied}));
}
