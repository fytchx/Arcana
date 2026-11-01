import test from 'node:test';
import assert from 'node:assert/strict';
import { guildLink } from '../next/guild-tree.js';
import { guildTreeFromLink, allocateGuildPoint, maxGuildPoints, freshGuildTree, guildBonusTotals, guildTreeSpent } from '../src/guild-tree-engine.js';

test('guild tree share link round-trips through the classic link reader', () => {
  let plan = { ...freshGuildTree(80), boost: 1 };
  for (const k of ['attack_damage', 'pet_damage', 'gold_gain', 'exp_gain', 'critical_strike_chance', 'dodge_chance']) plan = maxGuildPoints(plan, k).plan;
  plan = allocateGuildPoint(plan, 'defense_percent').plan;
  const url = guildLink(plan, 'https://arcanacompanion.xyz');
  assert.match(url, /^https:\/\/arcanacompanion\.xyz\/#\/tools\/guild-tree\?l=80&p=/);
  const back = guildTreeFromLink(new URLSearchParams(url.split('?')[1]));
  assert.equal(back.level, 80);
  assert.equal(back.events, plan.events);
  assert.deepEqual(guildBonusTotals(back), guildBonusTotals(plan));
  assert.equal(guildTreeSpent(back), 25);
});

test('boost is carried in the link only when on', () => {
  assert.ok(!guildLink({ level: 25, events: '', boost: 1 }).includes('b='));
  const boosted = guildLink({ level: 25, events: 'a', boost: 1.5 });
  const back = guildTreeFromLink(new URLSearchParams(boosted.split('?')[1]));
  assert.equal(back.events, 'a');
});
