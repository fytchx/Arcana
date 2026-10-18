# ARCANA MASTER CONTINUITY CHECKPOINT
**Snapshot:** 2026-10-17 (America/Los_Angeles)  
**Purpose:** Resume Arcana without depending on fragile ChatGPT conversations.  
**Status:** GitHub PR/branch facts checked through the connected repository during this checkpoint; requests, design decisions and untested functionality are explicitly distinguished from verified code.

## Read first: release and data safety
- **NEVER merge PR #33 into `main`** to release the Damage Calculator. It started from an **outdated six-card homepage** and would regress the approved modern design.
- **PR #34 is the modern integration** but remains **DRAFT, unmerged, and NOT on production**. It targets `preview/quick-tools-2026-10-17`, not `main`.
- Live domain: https://arcanacompanion.xyz/ . Isolated calculator QA preview: https://arcana-damage-calculator-qa-preview.up.railway.app/ . A preview deployment's successful build is not proof of production readiness.
- Do not delete any Railway services, runtime dependencies, volume mounts, persistent user data, artwork, or backups during chat cleanup. Production deployment requires direct tests and deliberate promotion.
- This backup branch itself is a point-in-time copy of the **PR #34 source**, not a copy of production databases, user accounts, secrets, unpublished Discord content, raw in-game captures, or old ChatGPT uploads.

## Source of truth and current branches
Private GitHub repository: `fytchx/Arcana`.

- `main`: repository default; **not** the approved modern homepage source for calculator integration.
- `preview/quick-tools-2026-10-17`: current modern UI baseline.
- `arcana-damage-modern-2026-10-17`: PR #34, current integrated modern UI plus new Damage Calculator. Check its live HEAD before any work.
- `feature/damage-calculator-foundation-2026-10-17`: PR #33, extensive calculator research but based on outdated `main`. Preserve as reference; do not merge as release.
- `pre-chat-cleanup-2026-10-12`: older rollback/source backup.
- `backup/chat-cleanup-2026-10-17`: **this checkpoint**, forked from PR #34's then-current HEAD `c055a32da9f7abc842bab218a7d018be7fe3b897`.

Open PRs: https://github.com/fytchx/Arcana/pull/34 and https://github.com/fytchx/Arcana/pull/33 .

## UI and product requirements: don't resurrect retired layouts
- Approved **modern Arcana mobile design**, NOT the stale six-card UI. Keep Build Studio as the main homepage hero, concise three-card feature entry (Pathfinder, Tools, Builds / Builds & Guides), the current bottom five-button dock, current icon/theme system and Theme Studio. Do not downgrade to an old branch simply because tests pass there.
- Wiki and LFG are in the menu; **do not clutter the homepage with calculator tiles**.
- Build Studio unifies gear, pets, runes, skill and passive trees; no fictional “utility slots.” Preserve correct legality, scroll positions and mobile touch behavior.
- Upgrade Calculator defaults to **A1+0 -> A2+0** and persists progress. Pathfinder groups materials by biome tier and lets players track needed resources.
- Admin controls global theme; include plentiful patterns/presets and desktop-friendly inline theme preview. Preserve signature footer and current refined IdleArc-inspired icon/design direction; user has developer permission to use game artwork.
- Native Discord sign-in/accounts and player cards; guests browse/use tools; publishing is limited to approved editors. Keep beta role continuity.

## Calculator state, evidence and open QA
**PR #34 (modern integration):** A genuine Damage Calculator route now replaces an obsolete “WORK IN PROGRESS” placeholder. Previous bug: duplicate `case 'calculators/damage'` routes caused the older placeholder to shadow the real UI. Source fix and a regression test were added. Reported `npm run check` was **330 tests passing**, and a separate real Chromium Android-viewport run checked the three-card home, five-tab dock, actual seven-tab calculator, and clickable Pet, Linked Stats and Build Studio Import panels (GitHub Action `39071531847`). The broader legacy `tests/mobile_smoke.py` still has stale assumptions and **must not be described as passing**. Production has not been touched by PR #34.

**Calculator scope:** ALL damage layers: hero Attack, pets, retaliation, ACS/class skills, secondary mechanics; simple inputs and advanced breakdown. Pet A/B comparisons should support four vs four pets, effective INT/DEX source stages, and optional player-calibrated total multipliers, without double counting. Effective skill rank is allocated points + ACS; cap EACH effect independently, not whole skill. Current recorded research: 90 skill IDs, 24 cap groups, five classes. Source evidence: 43 Hunter/Beastmaster screenshots, 91 additional Mage/Warrior screenshots and a video; raw captures **not committed**. Unverified: exact pet base/level damage, all current skill effects, Rogue/Druid screenshots, crit/double hit/conditional ordering, actual DPS and server timing. Mark uncertain results WIP; do not invent damage.

**PR #33** remains reference/research, not the branch to deploy. Verify any subsequent source changes directly against current PR #34 HEAD.

## VERY NEXT PRODUCT TASK, Oct 17
The user uploaded **`firsttestbuild.zip` in a prior broken chat**, requesting their CURRENT character's entire real build be imported into Arcana as the first end-to-end test. Goal is a **shareable** player build including stats, equipment/rarity/rolls, runes and full grid, class/passive skill trees, gems and pet loadout, correctly restored into Build Studio. Also **update the existing Warrior build/guide**. Avoid declaring success because partial fields or screenshots display: test export -> import -> edit -> publish/share -> reopen on Android.

**Attachment caution:** During this cleanup, `firsttestbuild.zip` was NOT found in accessible current-project/Library search. It may exist only in the prior chat. Preserve/re-upload it before deleting that conversation; do not fabricate or guess its fields.

## Wiki and verified game data
- Arcana is a connected companion, not disconnected page islands: Build Studio -> guides -> Wiki -> Codex -> Pathfinder/Tools.
- Wiki/article public copy should read as natural player guidance. Do **not** publicly mention AI, private capture methods, APK analysis or raw datamining. Internally distinguish verified in-game results from hypotheses.
- Season 2, v1.3.3 build 164 earlier baseline; game config `/config/game`; pets `/api/pets`. Keep data-version labels and reconfirm when game changes.
- Seasonal pet equalization K=10; permanent K=25; four equipped slots. EXP Gain is character XP, not monster-level XP. All gear, skills and item cost tables must use verified data; unknowns stay unknown.
- Item Codex retained (pictures primarily for player equipment); preserve actual assets and track missing new-season art. Rune grids/pet rules/skills should not silently reset.
- Current Warrior/Retaliation guide: defense, retaliation, blocking; later confirmation that Double Damage can affect Retaliation. Keep updates source-based, not stale Season 1 rules.

## Guilds and other workstreams (separate chats)
- PDX/OVK guild management; contemplated OVK + VOD merge (strong members OVK, developing players VOD); PDX min 5 guildstones/day, OVK 2/day; season ruby requirements week 1=50/day, week 2=100/day, week 3+=200/day; gold 500k/day. Audit join date and contribution windows before enforcement.
- IdleArc external Wiki/player guides, game config research and datamining log in separate chat.
- Separate original idle ARPG prototype and Discord bot ideas should not be mixed into critical Arcana release work.

## Chat-cleanup safeguards
1. Start new Arcana development chats by referring to **this file and PR #34**; first inspect real branch/PR HEAD and relevant docs. Maintain concise GitHub checkpoints instead of relying on chat summaries.
2. **Archive**, rather than delete, chats if the goal is just a clean sidebar. Before deleting any, export ChatGPT data and independently back up irreplaceable ZIPs/screenshots outside ChatGPT. A data export is not an importable conversation restoration.
3. The older complete reference `Arcana_Master_Handoff_2026-10-12.md` exists in ChatGPT Library (two versions). It contains older infrastructure recovery IDs and assumptions; defer to newer verified branch/UI facts here when they conflict.
4. For future consistency split chats into: **Arcana Engineering**, **IdleArc Wiki/Data**, **PDX/OVK/VOD Guilds**, **Original Game/Bot**. The GitHub repository and actually connected Railway resources remain the durable sources of truth.
5. Track each work item as: **done in code**, **tested**, **deployed to QA**, **deployed to production**. Those are different states.

**First step next session:** inspect PR #34 and any new commits; check `firsttestbuild.zip` availability; implement/validate end-to-end shareable character import in the modern UI without touching production.
