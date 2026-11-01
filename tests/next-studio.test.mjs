import test from 'node:test';
import assert from 'node:assert/strict';
import D from '../next/studio-data.js';
import {
  emptyBuild, classBudget, passBudget, classProblem, changeSkill, classData, passProblem, tapNode, tierLocked,
  fits, runeWords, shapeById, compound, affixCost, equip, setClass, twoHanded, itemsFor, slotDef, affixesFor,
  parts, encodeShare, decodeShare, restoreDraft, PART_IDS
} from '../next/studio-core.js';

const warrior = classData(D, 1);
const skillsOf = br => warrior.br[br].s;

test('studio: point budgets match the game (1 passive per level, class every 3 levels to 300, cap 100)', () => {
  assert.equal(passBudget(300), 300);
  assert.equal(classBudget(1), 1);
  assert.equal(classBudget(3), 1);
  assert.equal(classBudget(4), 2);
  assert.equal(classBudget(300), 100);
  assert.equal(classBudget(1000), 100);
  assert.equal(classBudget(0), 0);
});

test('studio: class skills enforce tier unlocks, prerequisites and the budget', () => {
  const tier2 = skillsOf(0).find(s => s.unl === 5);
  const tier1 = skillsOf(0).filter(s => s.unl === 0);
  assert.ok(tier2 && tier1.length);
  // A tier-2 skill can't be taken with nothing spent in its branch.
  assert.match(changeSkill(D, 1, {}, tier2, 1, 300).error, /needs 5 points/);
  // Spend 5 in tier 1, then it opens (unless it has its own prerequisite).
  let a = {};
  for (const s of tier1) while ((a[s.id] || 0) < s.max && Object.values(a).reduce((x, y) => x + y, 0) < 5) a = changeSkill(D, 1, a, s, 1, 300).alloc;
  const r = changeSkill(D, 1, a, tier2, 1, 300);
  if (tier2.pre.length) assert.match(r.error, /prerequisite/); else assert.ok(r.alloc, r.error);
  // At level 1 only one class point exists.
  const one = changeSkill(D, 1, {}, tier1[0], 1, 1).alloc;
  assert.match(changeSkill(D, 1, one, tier1[1] || tier1[0], 1, 1).error || '', /Not enough class points|max rank/);
  // Refunding a skill that holds up a higher tier is blocked.
  if (r.alloc) assert.ok(changeSkill(D, 1, r.alloc, tier1.find(s => r.alloc[s.id]), -1, 300).error);
  assert.equal(classProblem(D, 1, {}, 300), null);
});

test('studio: passives enforce row order, tier unlocks at 20, and one milestone per tier', () => {
  assert.match(tapNode(D, {}, 1, 0, false, 300).error, /Row 2 needs a point in Row 1/);
  let a = tapNode(D, {}, 0, 0, false, 300).alloc;
  assert.equal(a['0:0'], 1);
  assert.ok(tierLocked(D, a, 1));
  const t1 = D.tiers[1][0];
  assert.match(tapNode(D, a, t1, 0, false, 300).error, /needs 20 points/);
  // Refund works and never goes below zero.
  assert.deepEqual(tapNode(D, a, 0, 0, true, 300).alloc, {});
  assert.equal(tapNode(D, {}, 0, 0, true, 300).error, '');
  // Milestone rows allow one pick.
  const ms = D.rows.findIndex((row, r) => row[0] && row[1].length > 1 && r < D.tiers[0][1] + 1);
  if (ms >= 0) {
    const fake = {}; for (let r = 0; r < ms; r++) fake[r + ':0'] = 1;
    fake[ms + ':0'] = 1;
    assert.match(tapNode(D, fake, ms, 1, false, 300).error, /one milestone/);
  }
  // Out of points at level 1.
  assert.match(tapNode(D, a, 0, 1, false, 1).error || tapNode(D, a, 0, 0, false, 1).error, /No passive points|maxed/);
  assert.equal(passProblem(D, { '999:0': 1 }, 300), 'Unknown passive node.');
});

test('studio: runes must fit the 6x7 grid and only touching runes form words', () => {
  const small = shapeById(D, 'small');
  assert.ok(fits(D, [], 0, 0, small));
  assert.ok(!fits(D, [], 6, 0, small));
  assert.ok(!fits(D, [{ id: 1, x: 0, y: 0, t: 'fury', shape: 'small' }], 0, 0, small));
  const w = D.words[0];
  const touching = w.t.map((t, i) => ({ id: i + 1, x: i, y: 0, t, shape: 'small' }));
  assert.deepEqual(runeWords(D, touching).formed.map(f => f.n), [w.n]);
  const apart = w.t.map((t, i) => ({ id: i + 1, x: (i % 2) * 2, y: Math.floor(i / 2) * 2, t, shape: 'small' }));
  assert.ok(!runeWords(D, apart).formed.some(f => f.n === w.n));
});

test('studio: pet calculators match the config math', () => {
  // Legendary Attack Damage: base 12, x1.2 per level for the first 10 levels (rounded up each step).
  let v = 12; for (let i = 1; i <= 10; i++) v = Math.ceil(v * 1.2);
  assert.equal(compound(D, 'legendary', 'attack_damage', 10).v, v);
  assert.equal(compound(D, 'legendary', 'attack_damage', 0).v, 12);
  assert.equal(compound(D, 'uncommon', 'all_skills', 5), null);
  // Affix level cost: ceil(n / 20) per level, All Class Skills 1000 per level.
  assert.equal(affixCost(D, 'item_quantity', 1, 3), 2);
  assert.equal(affixCost(D, 'item_quantity', 20, 21), 2);
  assert.equal(affixCost(D, 'all_skills', 1, 2), 1000);
});

test('studio: gear stays loose but sane (class weapons, two-handers, affix pools)', () => {
  const main = slotDef(D, 'main');
  assert.ok(itemsFor(D, main, 1).every(i => !i.cls.length || i.cls.includes(1)));
  const gs = D.items.find(i => i.h2 && i.cls.includes(1));
  let b = equip(D, { ...emptyBuild(), gear: { off: { item: 12 } } }, 'main', gs.id);
  assert.ok(twoHanded(D, b));
  assert.equal(b.gear.off, undefined);
  b = setClass(D, b, 3);
  assert.equal(b.gear.main, undefined);
  const ward = D.items.find(i => i.name === 'Wardplate');
  assert.ok(affixesFor(D, ward).some(a => a.name === 'of the Bulwark'));
  assert.ok(!affixesFor(D, ward).some(a => a.name === 'Blazing'));
});

test('studio: share links carry only chosen parts and survive tampering', () => {
  let b = emptyBuild();
  b = equip(D, b, 'chest', D.items.find(i => i.name === 'Wardplate').id);
  b.gear.chest.aw = 7; b.pets = ['retaliation', null, null, null]; b.stance = 'bulwark';
  b.notes = { gear: 'Chest first', 'gear:chest': 'Biggest Defense slot', stance: 'Turns off dodge' };
  const code = encodeShare(b, ['gear', 'stance'], { title: 'Retaliation Warrior', by: 'Zane' });
  const back = decodeShare(D, code);
  assert.deepEqual(back.include, ['gear', 'stance']);
  assert.equal(back.build.gear.chest.aw, 7);
  assert.deepEqual(back.build.pets, [null, null, null, null]);
  assert.equal(back.build.stance, 'bulwark');
  assert.equal(back.build.notes['gear:chest'], 'Biggest Defense slot');
  assert.equal(back.title, 'Retaliation Warrior');
  // Garbage and hostile input never throw and never produce invalid values.
  assert.equal(decodeShare(D, 'not base64 at all!!'), null);
  const evil = btoa(JSON.stringify({ v: 1, c: 99, l: 1e9, i: ['gear', 'x'], g: { chest: { item: 1 }, tal1: { item: 1 }, head: { item: 3, aw: 999, aff: [1, 1, 2, 3, 4, 5, 6], gems: ['garnet', 'nope'] } }, ca: { 7: 99 }, n: { '<img>': 'x', gear: 5 } })).replace(/=+$/, '');
  const e = decodeShare(D, evil);
  assert.equal(e.build.cls, 1);
  assert.equal(e.build.level, 1000);
  assert.deepEqual(e.include, ['gear']);
  assert.equal(e.build.gear.chest, undefined); // Broken Sword is not a chest
  assert.equal(e.build.gear.head.aw, 30);
  assert.ok(e.build.gear.head.aff.length <= 5);
  assert.deepEqual(Object.keys(e.build.notes), []);
  assert.deepEqual(e.build.ca, { 1: { 7: 5 } }); // rank 99 clamps to the skill's max
});

test('studio: drafts restore safely and keep every class tree', () => {
  assert.deepEqual(restoreDraft(D, null), emptyBuild());
  assert.deepEqual(restoreDraft(D, { runes: 'oops', gear: [], pets: 7 }).runes, []);
  const s = skillsOf(0).find(x => x.unl === 0 && !x.pre.length);
  const mage = classData(D, 3).br[0].s.find(x => x.unl === 0 && !x.pre.length);
  const r = restoreDraft(D, { ...emptyBuild(), ca: { 1: { [s.id]: 1 }, 3: { [mage.id]: 1 } } });
  assert.equal(r.ca[1][s.id], 1);
  assert.equal(r.ca[3][mage.id], 1);
  assert.equal(parts(D, r).find(p => p.id === 'class').n, 1);
  assert.deepEqual(PART_IDS, ['gear', 'pets', 'runes', 'class', 'passive', 'stance']);
});
