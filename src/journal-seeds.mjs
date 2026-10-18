// Arcana Journal launch articles. Editorial opinions are not official IdleArc patch notes.
export const JOURNAL_SEEDS = Object.freeze([
  {
    slug:'class-balance-top-250-season-2',
    title:'Class Balance: The Top 250 Tells a Story',
    subtitle:'The leaderboard shows a clear imbalance in top-rank representation. That deserves a conversation bigger than one Warrior nerf.',
    category:'Meta & Balance',
    author:'Zane',
    publishedAt:'2026-10-18T13:30:00-07:00',
    updatedAt:'2026-10-18T13:30:00-07:00',
    published:true,
    featured:true,
    coverUrl:'',
    body:`The recent Warrior nerf might make sense in isolation. My issue isn't that a strong class was adjusted. It's that we're making targeted balance changes while the wider picture still looks completely lopsided.

I went through screenshots of the top 250 players on the IdleArc leaderboard and counted every class. The results tell a much bigger story than any single change.

## The top 250, counted

[[distribution]]

That's 104 Rogues in 250 leaderboard spots. Rogues alone account for **41.6%** of the entire sample. Mage and Archer combined account for **12.4%**, just 31 players. There are over three times as many Rogues as Mages and Archers combined.

These aren't numbers I pulled out of thin air. The snapshot covers ranks 1 through 250 from 22 screenshots captured October 18, 2026. Each unique rank was counted once using the class symbol next to the player.

## It gets worse near the top

In the top 100, **47 players are Rogues**. Meanwhile, only **six are Mages** and **three are Archers**. That's nine Mage and Archer players combined in the top 100.

Warriors account for 24 spots, Druids 20. Whatever people think about Warriors, the class closest to taking over the leaderboard is clearly Rogue.

For more context, here is how the classes appear in each 50-rank band.

[[rank-bands]]

## Why the Warrior nerf frustrates me

I'm not arguing that Warriors should be untouchable. If something is too strong, adjust it. The same goes for Druids. But balance doesn't exist in a vacuum.

When Rogues make up nearly half the top 100 and Mages and Archers are barely represented, it seems strange to focus on one class without addressing the rest of the ecosystem.

My position is pretty simple: **Warriors and Druids feel broadly competitive, Rogues appear too far ahead, and Mages and Archers need serious attention.** That's my reading of the current game, not a claim that leaderboard placement alone proves damage formulas or class strength.

I'd rather see a coherent balance pass that gives every class a reason to exist at the highest levels than another round of isolated nerfs.

## What this data proves, and what it doesn't

The leaderboard **does** tell us which classes hold the top 250 ranks in this snapshot. That's measurable. It also tells us how skewed representation is at the very top.

It **does not** tell us the total number of players using each class, class win rates, raw damage, skill level, account age, or why someone chose a class. Some classes might have more players overall. Top players might switch to whichever class is currently strongest. Both things could affect these results.

None of that makes the numbers meaningless. It just means they are evidence of **rank representation**, not a complete diagnosis of why the meta looks this way.

## What I'd like to see change

First, evaluate Rogue performance alongside the other four classes rather than treating one nerf as a solution to class balance. Second, give Mage and Archer players meaningful ways to compete instead of asking them to accept being afterthoughts. Third, judge changes in the context of the entire season, not just whichever build is drawing complaints this week.

I want every class to feel like a legitimate choice. A player who enjoys a Mage or Archer shouldn't feel like they're deliberately handicapping their progress before the game even starts.

This isn't about attacking the developers or players who picked Rogue. It's about taking balance seriously enough to look at the whole picture.

**If the goal is a healthy meta, the top 250 is a pretty loud warning sign.**

## Source and methodology

Snapshot: October 18, 2026. Source: 22 mobile leaderboard screenshots supplied for analysis. Ranks 1–250 were each represented once. Class was determined by the emblem in the right-hand column. The pinned player-profile row and positions beyond rank 250 were excluded. Percentages use 250 as their denominator, or 100 for the top-100 comparison.

A 20% share for each of the five classes is only an illustrative equal-split reference, not a claim that every class has an equal population.`
  },
  {
    slug:'building-the-arcana-damage-calculator',
    title:'Building a Proper Damage Calculator for Arcana',
    subtitle:'A connected character sandbox for testing builds before spending your resources.',
    category:'Development',
    author:'Zane',
    publishedAt:'2026-10-18T12:00:00-07:00',
    updatedAt:'2026-10-18T12:00:00-07:00',
    published:true,
    featured:false,
    coverUrl:'',
    body:`I've been working on something I've wanted Arcana to have for a long time: a proper damage calculator that connects directly to Build Studio.

The goal isn't another screen full of numbers. I want a **character sandbox** where you can enter as much or as little information as you have, change something, and understand what that change might do to your build.

## What I'm working toward

Gear, skills, pets, runes, talismans and the stats they affect should eventually work together in one place. Want to compare an equipment upgrade, test a different pet setup, or see how a skill investment changes your damage? That's the kind of experimentation this should support.

I also want the results to be readable. You shouldn't need a degree in spreadsheet archaeology just to answer whether a build change helps.

## Accuracy matters more than fake precision

Some game mechanics are documented, and others still need to be verified. Where a calculation is supported by reliable data, we'll show it. Where something is uncertain, Arcana needs to say so instead of inventing a number that looks convincing.

This is **actively in development**, not a promise that every class, pet interaction and damage formula is already solved. There isn't a release date I'm ready to announce yet.

The end goal is simple: **build something, change something, see the difference.** And connect those experiments to the builds and guides players already use on Arcana.

I'll share more as the calculator takes shape.`
  }
]);
