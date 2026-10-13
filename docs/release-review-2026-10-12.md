# Arcana integrated build: internal release review
Date: October 12, 2026

## Release scope

- A local "Continue where you left off" home panel for saved Build Studio, Guild Skill Tree, Compound, Pet Affix and ML farming plans and recent guides.
- Six additional source-backed ArcanaWiki guides: Forge, Guild Skill Tree, pet affix upgrade costs, sockets/gems, Rift Raids and item rarity.
- Grouped guide library and readable article table of contents; direct connections between reference records, guides and tools.
- Monster Level farming comparator taking measured kill times and applying only the published Season 2 relative XP modifiers, not hypothetical game statistics.
- Mobile search no longer triggers keyboard focus automatically.
- Updated older demonstration text that incorrectly treated all monsters in a biome as awarding identical Monster Level XP.
- Additional source and mobile smoke tests.

## Evidence boundaries

The game-rule snapshots in the repository are from the player-provided October 9 game configuration. The official Season 2 patch notes used as editorial reference were published September 25:
https://idlearc.com/patch-notes/1-3-1

**Do not interpret October 9 source data as live confirmation for subsequent updates.** The app's public App Store version history already lists version 1.3.5 on October 12. Refresh the authoritative game configuration and compare deltas before promoting claims affected by later balance patches.

No absolute Monster Level XP, monster HP, reroll probability, or drop rate is inferred by the comparator. It ranks relative XP per second using player-entered times.

## QA and deployment

- `npm run check` is required for the staging Railway build.
- `python tests/mobile_smoke.py` uses mocked network data and verifies navigation, Codex category scroll, saved contexts and calculators. It does not assert production APIs or live artwork availability.
- `assets/official-art/checksums.json` and the existing art source tests remain canonical for sprites.
- Retain staging on the GitHub feature branch. Do not move the public arcanacompanion.xyz domain until production vs staging service differences and live API integrations have been reviewed.
- QA should specifically check Android back/forward, keyboard focus, horizontal overflow, return-to-Codex scroll, ability to open official sprites, and saved builds after refresh.

## Existing constraints

- Item Upgrade and Equipment Compare intentionally show verified base values, not unverified full expected resource costs.
- Pet Affix value scaling is a projection from configured base and per-level values; no reroll chance simulator is implied.
- User-facing wiki articles should not include internal verification flags or audit chatter. Bring contradictions to the maintainer separately.
- Stable game record IDs must remain intact when linking from a reference to a planner.
