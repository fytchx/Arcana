# Build Studio overhaul contract (2026-10-13)

## Scope and isolation
This branch is dedicated to rebuilding the Build Studio equipment manager. Baseline: `arcana-wiki-studio-integrated-2026-10-12`. Do not deploy/merge until mobile interactions, build persistence, share tokens, account-saved builds, game-data validity and regressions have been tested. Keep the Rune Forge, Pets, skill trees, Wiki Studio, Item Codex and live production stable.

## Visual/interaction reference
Use the supplied October 13 in-game preset-manager video as the interaction reference, not as a direct asset to publish. Mobile first: compact 13-position-equipment grid, readable item art, rarity coloring, equipped state, a bottom sheet to select an item, and a detail sheet to change or remove it.

**Canonical equipment-editing sequence:**
1. Tap a loadout slot; if empty, open the *valid base-item* picker for that slot.
2. Choose a base item; keep the source item ID separate from the synthetic setup.
3. Choose its rarity: Normal (only if supported), Uncommon, Rare, Epic, Legendary or Infernal. Awakened A1–A30 is an Infernal item with an awakening rank, not a seventh ordinary rarity.
4. Choose a legal Drop Bonus **type**, then choose a legal Drop Bonus tier where needed. Show the actual config-sourced min–max **value** with the correct stat units.
5. Allow a specific intended roll only inside the verified range. Do not confuse a bonus-value range with a roll probability.
6. Edit other allowed affixes and gems in later iterations using their own game rules. Confirm/change/remove without full-page navigation or scroll reset.
7. Preserve build settings across device-local drafts, sharable links, registered account builds and read-only guide inspection.

## Audited data (2026-10-09 config)
Source: `IdleArc_2026-10-09_game_config.json` (available to the project; do not treat as live server state). Contains **40 base equipment definitions**, **21 Drop Bonus definitions**, **26 ordinary affixes**, **rarities 1–6**, bonus-value tables by bonus tier **2–9**, item-type and some class restrictions, ordinary-affix `applicable_to` slot restrictions, and Forge/Gilded/Awakening rules.

Crucial distinction: `itemization.drop_bonuses` has `min_tier`, stat, category and `values` for each bonus tier, but **does not contain a per-equipment-slot whitelist**. `affixes[*].applicable_to` supplies slot/type legality for ordinary affixes. Do not silently treat ordinary-affix restrictions as Drop Bonus restrictions. The missing Drop Bonus slot restrictions, including special cases, need client/server evidence or in-game verification before enforcing them.

Examples for initial unit fixtures:
- Prosperous, bonus tier 6: **25–38% Gold Gain**.
- Fierce, bonus tier 6: **18–26% Attack Damage**.
- Reflecting (slug `thorned`), bonus tier 6: **18–26% Retaliation/Thorns** (verify UI wording separately).
- Scavenger's, bonus tier 6: **8–12% Item Drop Chance**.
- A Normal item has 0 ordinary affix slots; Uncommon/Rare/Epic/Legendary/Infernal have 1/2/3/4/5 respectively.
- Two-handed weapons and class-restricted base items must not create impossible equipped combinations.

## Data/model decisions
- Do not fabricate items, ranges, eligibility, or odds. Use source-labeled, versioned, auditable rules.
- Keep the existing `equipment[slot] = itemId | null` representation during migration, because other tools and older saved/shared builds rely on it.
- Add a parallel per-slot `equipmentConfig` keyed by the real slot keys, containing version, rarity tier, awaken level, bonus type, bonus tier and explicit chosen roll. Two ring slots must remain independent.
- Normalize absent/legacy configurations safely. Unverified data should disable the affected input with a clear explanation instead of silently inventing a permissible value.
- All editing is user-created simulated gear, **not** a claim to be the user's actual in-game inventory.

## Delivery phases
1. **Rules and fixtures**: extract item, rarity, bonus and affix metadata into a verified module. Implement pure legality/range validation, unit tests and migration rules.
2. **Equipment interaction**: rebuild the responsive slot-grid and item picker; staged editor: base → rarity/awakening → Drop Bonus; detail/change/remove.
3. **Legality and polish**: class/two-handed constraints, slot-based ordinary affix restrictions, UI affordances, optimistic local save and no-scroll-reset behavior.
4. **Integration**: sharing/account persistence, guide cloning/inspection, wiki links, Codex item references, build import/export.
5. **Verification**: mobile replay against in-game reference, keyboard and touch tests, build/reload/share/restore, boundary tests A1/A30, comprehensive regression, review before deployment.

## Acceptance checks
- Empty slot only shows compatible base items and never moves the page back to the top.
- Repeated edit of occupied slot retains base, rarity, awakening and chosen bonus.
- Infernal, A1 and A30 do not get treated as three unrelated base rarities; rarity-specific bonus slots remain correct.
- The displayed bonus range exactly matches the selected Drop Bonus *tier*, not an adjacent rarity, and unavailable tiers are not invented.
- Ordinary affixes unavailable on a slot cannot be selected, and class/two-handed rules prevent impossible setups.
- Two separately edited rings retain different rolls after reload, share, copy and account save.
- Old build records still open; an unsupported record is flagged, not silently altered or deleted.
- No unrelated Arcana workflow is broken by the rebuild.
