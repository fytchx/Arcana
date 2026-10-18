# Arcana Character Sandbox: unified character milestone

Updated 2026-10-18. Development branch: `arcana-damage-modern-2026-10-17` (draft PR #34). This is a preview-only change; production stays unchanged.

## Product requirement

The player has **one character in a sandbox**. They can enter any subset of gear, skills, runes, pet details, talismans and manually observed damage stats, without needing to set up a complete character. Each change should be comparable with protected snapshots. Advanced engine parameters are present only on request.

The UX at `#/calculators/damage` is therefore My Character, Experiment, Results, with the existing eight detailed calculators in a collapsed Advanced Damage Controls section. The navigational title is Character Sandbox.

## Source of truth

- Build Studio's existing `arcana-v3-local-build-1` local draft stores the editable working character, including talismans and `damageProfile` manual tooltip observations.
- `src/sandbox-character.js` is the pure character schema adapter, snapshot normalizer, source change ledger and provenance-aware comparison engine. Input null means unknown; an entered numeric zero is a real zero. It has no network calls and is suitable for future official API ingestion.
- `src/sandbox-ui.js` manages the optional protected Starting Point and up to twelve named variants in `arcana:sandbox:workspace:v1`. Variants are independent copies. Restores require explicit confirmation. No hidden personal-character fixture is preloaded.
- The advanced Damage Calculator's manual input baseline persists to the Build Studio character's `damageProfile`. Existing what-if scenario overrides remain separate to avoid mutating the underlying character unless a baseline input is intentionally edited.
- User-selected guide builds and shared build previews support Compare to my Sandbox, storing an independent comparison variant **without overwriting the working character**. Explicit build shares include talismans and the optional manual damage profile.

## Result honesty

Results show precisely which character sources changed: equipment slots and entered rolls, the equipped pets, talisman loadouts, rune placement, class skill and passive allocations, and manually entered damage stages. Configured talisman base/inscription deltas are displayed independently. Full numerical Attack/Pet/Retaliation percentages are only shown for directly entered and sufficiently complete manual damage stages. The source ledger does **not** infer full DPS from a gear change or secretly stack mutually overlapping screenshot tooltip subtotals.

Unknown stages should remain marked unknown. Future sourced simulations should add a provenance-bearing effect ledger and one-by-one contributions before claiming complete damage totals.

## Long-term API-ready boundary

```text
official authorized API (future) / manual input / guide / JSON
   -> privacy-safe source adapter
   -> normalized character
   -> immutable source snapshots
   -> provenance-aware computation
   -> human-readable comparison and explanations
```

There is no official IdleArc API connection yet. Do not add game-private endpoints, MITM access, credentials, or raw personal response data to production or GitHub.

## Remaining work, not falsely claimed completed

- Full automatic numerical modeling of every item, skill, pet, rune, gem and talisman influence.
- Individual-edit undo/redo and browser-independent cloud history; protected Starting Point and explicit variant restore are available now.
- Rich in-place per-system editor instead of linking into the corresponding Build Studio screen.
- Multiple independent active characters per signed-in account and official API refresh.
- Unknown-source coverage guidance by exact missing prerequisite, not fabricated defaults.

## QA requirements

Run `npm run check`, `tests/damage_route_mobile.py`, and `tests/mobile_smoke.py`. The dedicated Android test covers blank startup, creating a protected starting snapshot, saving a variant, switching experiment/results, canonical manual-stat persistence, and no fabricated full damage with partial input. QA Railway should be pinned to the **same passing GitHub commit**. Do not merge draft PR #34 to production without specific authorization.
