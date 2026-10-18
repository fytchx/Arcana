# Damage Calculator: partial character inputs, talismans and future API architecture

Checkpoint: 2026-10-18. Branch: `arcana-damage-modern-2026-10-17`, draft PR #34.

## Contract
- Every new calculator workspace starts genuinely blank. Missing inputs are unknown, **not zero**. Local legacy damage calculator drafts are not deleted, but they are not silently loaded into the new version.
- Never preload any personal player screenshot fixture into public calculator UI. Keep fixture screenshots/rounded anchors solely in test/source reference modules while we refactor tests.
- Independent modules: game configuration -> typed/sanitized source adapter -> saved optional Build Studio loadout -> explicit user-selected comparator -> sourced damage-stage engine. They are separate so eventual authorized game APIs can replace manual input without rewriting formulas.
- Build Studio now has optional two-slot talisman editor with a type, level 0–9, and **manual observed total** for each inscription stat. Unentered is unknown; 0 means entered zero. The result persists in the existing local draft and is included in explicit share URLs and guide/build previews.
- The Damage Calculator Talisman A/B tab keeps independent current/proposed entries and an explicit 'Load current from Build Studio'. It reports only measured/configured source changes. It does **not** silently add talismans to entire Attack, Pet or Retaliation outputs because their screenshot breakdown stage overlap and sacrifice stacking are not fully verified.
- The user-provided October 17 talisman response has personal equipped IDs and histories. NEVER commit the raw response or transport it to a server. `talisman-reference.js` contains only the public config tables; `talismansFromResponse()` strips IDs and metadata. Future authorized API adapters should follow the same pattern, with explicit player opt-in and read-only scopes.
- Reference tables include four types, all 0–9 configured base arrays, nine upgrade costs/chances, infusion costs, 16 inscription pools, rarity chances/pity and sacrifice constants. Live behavior, full inscription ritual cost scaling, sacrifice overflow, stat scaling and character-sum stage semantics still need verification before numeric recommendations.
- Older `warrior-retaliation-zane` public guide is a preexisting manually published guide, **not** the October 17 rolled-back screenshot import. User-controlled public guides may legitimately contain the author's profile; do not use them as calculator defaults.

## Next verified integration stages
1. Confirm actual tooltip stage mapping for talisman Attack Power, Pet Damage, Retaliation, Sacrifice effects and stat scaling; build a source-ledger delta that can replace stages once, not add screenshot totals twice.
2. Validate full Node suite, Android browser tests, and preview. Keep production untouched until the checks pass.
3. Add explicit gear/pet/skill/rune selectors that feed the same *provenance-aware* what-if source ledger, with missing fields allowed.
4. API future: an authenticated read-only adapter when the game creator officially authorizes access. Never rely on MITM or private endpoints for production Arcana.
