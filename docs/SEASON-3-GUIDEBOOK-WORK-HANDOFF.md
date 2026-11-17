# Arcana Preview — Season 3 Guidebook Work Handoff
**Editorial document only; not a UI/content implementation. Updated 2026-11-17.**

The owner has approved a new reading order and a separation between the core Season 3 Guidebook and independently authored **Player Guides**. The current five-chapter Guidebook UI on this branch still uses the older layout; do **not** treat it as approved. This is a docs-only commit on the existing Test branch, which is auto-deployed to **Arcana-Test**; never merge/deploy Live based on this alone.

**Canonical source:** [IdleArc-Hub approved direction](https://github.com/fytchx/IdleArc-Hub/blob/main/arcana/season-guides/DIRECTION-2026-11-17.md)

**Hub full handoff:** [Work handoff](https://github.com/fytchx/IdleArc-Hub/blob/main/arcana/season-guides/WORK-HANDOFF-2026-11-17.md)

**Outstanding implementation audit:** [Remaining work](https://github.com/fytchx/IdleArc-Hub/blob/main/arcana/season-guides/REMAINING-WORK-AUDIT-2026-11-17.md)

## Compact required structure

1. Intro landing with what this is/how to navigate, followed by Season 3 “start here” CTA.
2. Season 2 ending → Season 3 starting, with transparent rules-may-change caveat.
3. Explicit boundary: player strategy here; factual mechanics in Handbook/Fandom.
4. Class/build selection and reasons, highlighting **AD Rogue**, linking to a separate combined AD guide.
5. Short items, pets, runes overview → links to detailed pages.
6. Progression: Monster Level vs Character XP; meaningful detours and biggest mistakes.
7. Deep **Pets → Runes → Gear** guidance.
8. **Separate, distinctly credited Player Guides**: one owner-written **AD Rogue/Mage/Warrior** guide, existing owner **Retaliation Warrior**, external author **Harmony Rogue**, plus separate **Archer** and **Druid** contributor guides (incoming; do not generate).
9. Conclusion.

Recurring strategy should be **contextual**: (a) prepare early, resist impulsive salvaging/reforging and protect potentially valuable RNG drops while choosing a flexible direction; (b) keep pushing Monster Level and spend/backtrack only when useful.

### Read before editing

1. Hub `START-HERE.md`, `context/PROJECT-STATE.md`, `CATALOG.md` and canonical direction.
2. This branch's `next/guidebook-content.js`, `next/guidebook.js`, `next/guidebook-editor.js`, `src/guidebook-server.mjs`, `next/guides-content.js` and relevant tests.
3. Original author materials: `IdleArc-Hub/arcana/season-guides/drafts/`, `GEAR-AUTHOR-NOTES-2026-11-16.md`, and `REVIEW-QUEUE.md`.
4. Handbook source and current Fandom exports, with exact links only when verified.

### Implementation guardrails

- Safe editor improvements first: draft access/privacy, autosave/recovery, manager/reordering/related links/bylines, complete mobile save/reload/publish-to-Test test, backup/restore. Seeded Guidebook drafts are currently visible to visitors of the public Test URL.
- Reorder and restructure only with preservation of source drafts; move the existing `rogue-explore` draft into *source material* for the combined AD Player Guide rather than discarding it.
- Protect original contributor attribution; the existing Retaliation guide remains separate under Player Guides.
- Review Season 3 mechanics with current sources and separate game facts vs estimates vs personal strategic observation.
- Preserve Railway Test/Live `/data`; do not merge PR #102, deploy Live, or publish Fandom without explicit owner approval.

## Full Work handoff (mirrored from private Hub)

# Work chat handoff — Season 3 Player Guidebook
**Date: 2026-11-17.** [Full owner-approved direction](DIRECTION-2026-11-17.md) and [remaining-work audit](REMAINING-WORK-AUDIT-2026-11-17.md).

## Immediate instruction
The owner is moving this project to a ChatGPT **Work** chat. Read `START-HERE.md`, `context/PROJECT-STATE.md`, `CATALOG.md`, and the full approved direction before doing anything. Consult archived source docs and the Gear author notes. Work in **fytchx/Arcana** `preview/season-guidebook-2026-11-16` (draft PR #102). Its current UI still has the old five-chapter layout; **do not assume the owner's new structure is implemented**.

## Locked decisions
- First view: short Guidebook **overview + directions**, then prominent “If you're interested in learning how you can start Season 3 like a pro would, start here:” link.
- Reading order: Season 2 ends / Season 3 begins and change caveat → strategy vs verified Handbook/Fandom facts → class/build choice (highlight AD Rogue) → short gear/pets/runes introductions → ML vs Character XP, progression and biggest mistakes → full Pets, Runes, Gear guides → **separate Player Guides** → conclusion.
- Lead with two principles: **prepare/think ahead but let RNG shape the path**, protect potentially useful loot, resist impulse; and **never stop pushing ML without a worthwhile reason to detour or spend**. Do not repeat identical text in every chapter.
- **One Zane-authored AD guide for Rogue + Mage + Warrior**, listed under **Player Guides**, not an individual Guidebook Rogue page. Existing **Retaliation Warrior** also remains Player Guides. Different contributors write **Harmony Rogue, Archer and Druid** (not received); preserve bylines and never fabricate their guides.
- Guidebook is strategy; Handbook and Fandom are the confirmed mechanics/reference sources. Contextual Arcana tool links only where actually relevant. Keep the wording natural and concise.

## What to do next
1. Verify latest `Arcana` main and compare with preview branch before modifying anything. Preserve Railway Test and Live data. Test domain: https://arcana-preview-app-preview.up.railway.app/next#/guidebook .
2. Make **safe editing** work on phone: draft visibility (current seeded drafts are publicly readable on Test), autosave/recovery, page/chapter reorder, admin Guidebook manager, related links, author credits, backend history/backup, mobile save/reload test.
3. Rebuild the **preview** reader/navigation using the new sequence. Create short overview/CTA, correct seasons-first flow, and separate the existing player guides directory from main Guidebook chapters. Preserve old draft text. Use `arcana/season-guides/drafts/` as source.
4. Prepare combined AD Rogue/Mage/Warrior Player Guide from existing Rogue/AD notes, but do not invent missing gameplay advice or authors' text. Keep Retaliation separate and make Harmony Rogue, Archer, Druid placeholders only until contributor files arrive.
5. Make links to Handbook, Fandom and Arcana tools only after verifying real URLs/routes; audit duplicates and contradictions with the [review queue](REVIEW-QUEUE.md).
6. Show mobile preview to owner for direct editing and review. **No merge to live or Fandom publish** without explicit owner approval.

## Technical context / known gaps
- Preview PR #102 remains draft. Guidebook source: `next/guidebook-content.js`, `next/guidebook.js`, `next/guidebook-editor.js`, `src/guidebook-server.mjs`. Older content `rogue-explore` is still included in `next/guidebook-content.js` and should be carefully migrated, not deleted blindly.
- Existing `next/guides-content.js` contains the published Retaliation Warrior guide. Community guides are another distinct mechanism. Avoid accidentally overwriting or duplicating them.
- Latest test deployment previously passed checks; **user's actual session Admin state not observed**, even though preview-only verified-Google Admin configuration was deployed and automated tests passed. Do not store personal account email in this repo or docs.
- Source data: Oct 30 config `data/verified/config/game-config-2026-10-30-007.json` is a dated snapshot, not guaranteed current S3 fact.
- The prior audit found editor lacks autosave, explicit ordering/status/related controls, integration with admin manager, and a private-only read path for working drafts. Also test page save/reload/restore end-to-end.

