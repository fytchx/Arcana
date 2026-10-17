# Arcana Damage Calculator: chat recovery checkpoint

Last verified: 2026-10-17. This is a recovery pointer for when ChatGPT conversations fail or become too large. **GitHub, not chat history, is the source of truth.**

## Repo / work status
- Private repository: `fytchx/Arcana`
- Work branch: `feature/damage-calculator-foundation-2026-10-17`
- Draft PR: https://github.com/fytchx/Arcana/pull/33
- Head commit at checkpoint creation: `004dfc70b355b3b98dce8f590ba5ec663c192978` (do not assume it remains the latest)
- At checkpoint: 36 commits, 20 changed files, unmerged. **Do not merge or deploy until verified.**
- Read PR #33 description and newest commits first in any replacement conversation.

## Confirmed reference cases already encoded in work
- Beastmaster / Hunter: 43 screenshots; on-screen attack 175.6K–243.8K approximately reproduced, and pet multiplier ×132.24 (rounding difference from tooltip components).
- Retaliation Warrior: 91 added screenshots + 403-second video also cover Mage; Warrior 26.1M–36.94M attack and 58.74B–83.92B tooltip Retaliation reproduced. Stance ×1.25 belongs in displayed range, conditional block ×1.75 does not.
- Attack Mage: 23.33B–34.12B attack reproduced from tooltip factors.
- ACS caps backed by 17 tooltip screenshots: Deflection independently caps block at 25% and Retaliation at 40%; certain Mage procs/bonuses at 100%; shared Culling+Executioner threshold cap 35%. Inspect PR for detailed semantics and sources.

## Files / approach
- `src/damage-calculator-engine.js`
- `src/retaliation-damage-engine.js`
- `src/class-skill-effect-model.js`
- `src/damage-calculator-crossclass-fixtures.js`
- `src/damage-calculator-ui.js`
- `docs/damage-calculator-*` research notes
- Calculator target: **all damage**, not just pets; pet-focused comparisons remain an easy workflow. Inputs can be partial; missing values must never be silently invented.
- Maintain strict separation of additive attack inputs, independent multiplicative sources, attribute percentages, pet damage, critical / double hit and conditional effects. Distinguish displayed damage, estimated expected damage and actual DPS.

## Verified vs unresolved
- 18 isolated JS model tests reported passing as of PR description; UI markup generation checked.
- Full repository tests, CI and browser/mobile end-to-end **not** verified.
- Tooltips are rounded observations, not precise full server-state values.
- Open research: actual pet base/level scaling; event timing and real DPS; unresolved ACS caps/outputs; Rogue and Druid baseline coverage; latest full game configuration.
- Original screenshot/video files **are not committed** and may need reattachment if we need to re-examine raw evidence. Fixture values and audit notes already committed should be reused first.

## Workflow to avoid lost progress
1. On any new chat, read this file, PR #33 and its latest commits before doing new work. Never reconstruct code from chat memory alone.
2. Work in small bounded implementation batches, with one or more commits to the feature branch per batch.
3. After each batch, run relevant tests and update the PR with: what changed, which checks passed/failed, outstanding assumptions and the next task.
4. Never conduct a giant research + implementation + release pass as one uncommitted operation.
5. Keep PR as draft until full verification and a separate merge/deploy decision.
6. For missing raw attachments, ask only for the *specific missing evidence*, never require the user to repeat already encoded calculations.

## Resume prompt
"Continue Arcana Damage Calculator from `fytchx/Arcana` draft PR #33. First read `docs/damage-calculator-chat-recovery.md`, the PR description and current branch files. Work in short committed batches, reporting exactly what was saved and tested. Don't merge or deploy without validation."

## 2026-10-17 continuation: measured/blank state and Marginal Gains Lab

Committed to this same draft feature branch after the first recovery checkpoint:

- `src/damage-calculator-engine.js`: `blankDamageBuild()` creates truly empty builds. An entered zero is distinct from an unknown/null field. Attack now reports `known` and `complete` input coverage; Pet remains unknown when pre-bonus pet base is absent.
- `src/retaliation-damage-engine.js`: required unset/null defense, global ratio, stance, and roll factors no longer turn into a fabricated zero Retaliation result.
- `src/damage-calculator-ui.js`: Clear values removes ALL screenshot-derived values, renders unknown/partial coverage honestly, allows cleared inputs to return to unknown, and shows only measured combat/pet breakdowns.
- New `src/damage-calculator-marginals.js` and UI Marginal Gains Lab: for an entered Attack/Pet snapshot, rank what `+1`, `+10`, or `+100` **percentage points** to each **already measured** source would do. Correctly distinguishes additive Attack % from independent layers and shows percent change without inventing specific equipment/pet roll availability or DPS. The mobile accordion is collapsed by default, and scenario edits refresh it.
- Tests: `tests/damage-calculator-empty-inputs.test.mjs` and `tests/damage-calculator-marginals.test.mjs`.

**Validation performed:** Parsed updated UI JavaScript in a V8 evaluator; executed updated pure math modules in isolation: Hunter, Mage and Warrior Attack screenshot anchors, Warrior Retaliation tooltip anchor, blank-vs-zero behavior and example Pet/Attack marginal rankings. These targeted checks passed. This is NOT the full Node test suite or browser/mobile QA.

**CI warning remains:** Arcana Checks on the updated head still reports `failure` for both source and mobile jobs with **zero steps** in both jobs, and job logs were unavailable. This does not demonstrate a test assertion failure. Runner provisioning/account/Actions configuration needs diagnosis. Do not describe CI as green.

**Release:** Still draft PR #33, unmerged, undeployed. Next stage: reliable CI or local full repo tests, browser/mobile QA, more source-verified Rogue/Druid and pet/combat event coverage. Do not convert marginal percentage-point rankings to real gear advice until actual obtainable source costs/rolls are known.

### Continuation validation checkpoint (after PR head 387f45e)

- The two NEW test files were executed in an isolated V8 test harness with Node-style assertion shims: **8/8 passing**.
- Fresh parse check of the updated calculator UI passed.
- This is **not** a green `npm run check`, nor a browser/mobile run, because repository code execution/CI runner remains unavailable from this session.
- An erased conditional blocked-hit multiplier returns `null` rather than a false ×0; the regression assertion is included.
- The draft PR remains the only work branch for this iteration.

## 2026-10-17 continuation checkpoint: four-slot Pet A/B Lab

- New `src/damage-pet-quick-engine.js`: source-preserving comparison of exactly **4 current vs 4 proposed slots** using the already-measured Pet Damage tooltip as the baseline. Existing current bonuses are **subtracted before proposed ones are applied**, avoiding double-counting. The module rejects unknown breakdown rows, unfilled values and inconsistent totals; it does not fabricate pet base damage.
- The allowed source channels are explicitly named and bounded: equipment Pet Damage %, Companions drop bonus %, effective extra INT points (0.05% pet damage each), and effective extra DEX points (0.1% each). **Effective INT/DEX** means stat points after increased-attribute calculations, **not** raw Increased INT/DEX roll %. No unverified conversion of a hatch bonus into a tooltip stage.
- New `src/damage-pet-quick-ui.js`: mobile-first A/B slot editor on the Damage Calculator's **Pets tab**; separate persistent preferences; result × multiplier, relative gain and source breakdown; copy current to proposed, reset, illustrative 2×20 vs 4×20 comparison, and **Send proposed sources to what-if**.
- `src/damage-calculator-ui.js` links the Pet Lab and stage-safe applies its computed measured rows into main what-if fields. The lab always calibrates against the saved **baseline**, not the scenario, so repeated application cannot compound changes accidentally.
- `src/damage-calculator-engine.js`: two required observed endpoints now gate pre-bonus pet damage output. A single entered endpoint remains unknown.
- New `tests/damage-pet-quick-engine.test.mjs` and extended `tests/damage-calculator-empty-inputs.test.mjs`.

### Verification and limits
- **12/12 focused assertions passed in an isolated V8 harness with Node-style assertion shims**, including source deltas, mixed INT/DEX, unknown/inconsistent stages, correct pet-base optionality and stage replacements.
- Five production modules parsed in a V8 syntax check; Hunter Attack remains within +0.002% and the calculated Pet tooltip multiplier within -0.066% of screenshot references.
- Full `node --test`, `npm run check`, GitHub Actions runner execution, and real mobile browser QA remain **unverified**. GitHub Actions continues returning jobs marked failed with zero steps. No merge/deploy.
- The quick comparison is intentionally **not** an automated pet hatch rarity/compound optimizer: exact effect-to-tooltip mapping, increased-attribute stat pools, ACS and real combat events need independent source confirmation before such recommendations can be calculated authoritatively.

## 2026-10-17 continuation checkpoint: calibrated Pet comparison and low-friction entry

### New saved work
- `src/damage-pet-quick-engine.js` supports an **optional observed total Pet multiplier**, e.g. ×15. Players only need to enter the breakdown layers **they are changing**, and the comparator applies source-correct ratio deltas to the measured ×15. Without a measured total, projected × results are explicitly labeled **product of entered layers only**, not true overall Pet Damage.
- The reference value is validated (finite, greater than zero); invalid or nonexistent evidence never becomes a claimed full multiplier. Pet raw base damage remains unknown unless both base endpoints are supplied.
- `src/damage-pet-quick-ui.js` now displays **four inline baseline fields** above the A/B pet slots: equipment Pet Damage %, Companions drop bonus %, Pet INT contribution %, and Pet DEX contribution %. These fields are wired to the same saved baseline as the advanced Pets tab, so users don't need to scroll into 67 manual inputs for common comparisons.
- Added an illustrative **2 Pet Damage % + 2 effective INT vs 4 Pet Damage %** preset in addition to the previous 2-vs-4 Pet % example. The inputs are examples, not promises of legal hatch bonus rolls.
- A measured total × is **bound to a fingerprint of the current Pet breakdown, flat sources, base range and class identifier**. If the reference character/stages change, the old calibration is discarded and the UI explains why. Hero Attack changes alone do not invalidate it.
- `src/damage-calculator-ui.js` synchronizes compact and advanced duplicate inputs without replacing the focused input or scrolling; handoff requires observed (not null/blank) baseline stages. Main Pet/Attack cards distinguish partial entered sources from a full measured tooltip rather than presenting every default ×1 as authoritative.
- Tests expanded under `tests/damage-pet-quick-engine.test.mjs` and new `tests/damage-pet-quick-ui.test.mjs` for observed-anchor ratio math, invalid references, subset entry, four inline fields, and fingerprint invalidation. These are normal Node test files ready to execute in CI.

### Verification / gating
- Isolated V8 execution (not full Node): **14/14 focused engine and UI regression cases passed** after this batch; relevant UI and math modules parsed. The known Hunter ×132.24 reference can anchor precise relative projections.
- Existing earlier tests and more extensive CI / npm check / browser-mobile QA were NOT all rerun. GitHub Actions on prior heads failed before obtaining a runner and completing any steps.
- Increased INT/DEX **percentage** hatch rolls remain unresolved: callers must enter effective total INT/DEX points **after scaling**, because the exact eligible base pool / stacking order has not been established. The Pet-only comparison does not represent simultaneous changes to hero Attack and secondary combat stats.
- Maintain **draft PR #33**, unmerged, undeployed. Next priorities: restore CI runner provisioning, full Node + mobile test gate, verify Increased INT stacking and Rogue/Druid live screens, then safe Build Studio import using exact provenance.

## 2026-10-17 continuation checkpoint: Linked Effective Stats across Attack, Pet and Combat

### Development completed on draft PR #33
- New `src/damage-attribute-link.js`: validated, source-aware preview for an **effective STR, INT or DEX point change**. These are post-scaling, character-stat-point deltas, **not** raw pet Increased STR/INT/DEX percentages. Item STR/INT goes into the existing Attack **additive** item-stat field; non-item STR/INT goes into the existing separate independent multiplier stage. The same effective INT/DEX totals also enter the measured Pet percentage layer at the 2026-10-17 stat-tooltip rates.
- Effective INT also adjusts only the *measured Double Damage chance* (+0.2 chance percentage points per INT), with the separate chance rollover preview, not an unverified unconditional Attack multiplier. Known STR Retaliation (0.5% per effective STR) and DEX Dodge (0.05% per effective DEX) are reported as reference deltas **without routing to unverified stage interpretations or DPS**.
- The proposed build is copied and inputs are validated. Only already observed numeric stages are replaced, no unknown field gets fabricated as zero. A partial baseline produces `skipped` diagnostics and is not eligible for the UI's apply action. The original baseline is never mutated.
- New `src/damage-attribute-ui.js`: compact **Linked Stats** tab on the full Damage Calculator. Pick STR, INT or DEX, select item/non-item source when relevant, enter the **change in effective points**, and supply the relevant measured Attack/Pet/Double Damage baseline fields directly. Review source replacements, projected hero Attack interval, Pet percentage multiplier and chance effects, then explicitly apply a complete preview to the what-if scenario.
- The UI and math engine share a single `linkedAttributeStageFields` definition; the calculator re-evaluates event inputs from its own saved baseline before applying them, rather than trusting arbitrary DOM-supplied replacement numbers. Existing advanced fields mirror the compact fields and continue to work.
- New Node-format test suites `tests/damage-attribute-link.test.mjs` and `tests/damage-attribute-ui.test.mjs` cover the item/non-item routing distinction, STR/INT/DEX cross-channel deltas, Double Damage expected-roll metadata, missing sources, nonnegative constraints, and responsive/accessible UI markup.

### Validation and release gate
- **10/10 new targeted tests passed** when executed in an isolated V8 harness with Node-style test/assert shims. Four edited production modules parsed successfully. These are NOT claims that `node --test`, `npm run check`, GitHub Actions or mobile browser E2E ran.
- Remain on **draft/unmerged/undeployed PR #33**. CI runs are still failing with no runner assigned or steps executed. There is no evidence yet of actual source assertion failures; investigate GitHub Actions allocation or billing/settings and rerun full checks before merging.
- Do not infer pet Increased INT% eligible stat pool, stacking, ACS interactions, actual proc timing or full DPS from these post-scaling point deltas. The full four-pet Pet A/B Lab remains available independently for simple multiplier comparisons.

## 2026-10-17 full-send checkpoint: reviewed Build Studio equipment imports

**Actual implementation on this same draft branch:**
- Added `src/damage-build-studio-bridge.js` with the **existing real Build Studio storage key** `arcana-v3-local-build-1`. The bridge reads the locally saved loadout (never uploads or modifies it), respects verified October 9 base-item IDs, 11 legal equipment slots, class/slot rules, bonus tier bounds, and **exact manually entered drop rolls**. No hypothetical tier midpoint, RNG, rarity-induced stats, base weapon values, pet level/damage, pet hatch bonus, ACS, rune, or DPS extrapolation.
- **Only equipment-only tooltip sources** are eligible for direct stage replacement: Fierce / Attack equipment Drop Bonus % → `attack.layers.dropBonus`; Companion's equipment bonus % → `pet.layers.equipmentAffixes`; Reflecting gear % → `retaliation.baseBonuses.reflectingGear`. Item Crit Chance/Crit Damage/Double Hit/Double Damage are deliberately **excluded** because the calculator's corresponding fields are *whole-character totals* rather than distinct equipment subtotals. Overwriting them with item-only percentages would erase unrelated sources.
- An equipped non-Normal piece with no bonus selected is an **unknown bonus**, not proven zero, so it blocks importing an apparently complete equipment subtotal. Invalid/unverified item IDs, illegal slot/class, missing roll, outside-range values and cross-class fixture mismatches also block the import. Unsupported bonuses remain visible in an audit list rather than being silently counted as damage.
- Added `src/damage-studio-import-ui.js` as a **Build Studio Import tab** on the Damage Calculator. It lists exact item-by-item audit evidence, what can safely replace existing stages, blockers, and source limits. Players must explicitly press **Apply verified equipment subtotals**. The main calculator then **re-reads the saved draft** and recomputes numeric values from source data, ignoring arbitrary event-supplied totals.
- `src/app.js` now has a direct **Open Damage Calculator** action in the editable Build Studio profile; it calls `persistDraft()` *before* navigating, so the imported draft is up to date. Existing Build Studio and save/cloud workflows are unchanged.
- Added 3 Node-format regression suites: `tests/damage-build-studio-bridge.test.mjs`, `tests/damage-studio-import-ui.test.mjs`, and `tests/damage-studio-navigation.test.mjs`. Added `className:'Archer'` to Hunter screenshot fixture so importing Warrior source rolls into an Archer benchmark can be refused correctly.
- **Targeted execution:** 14/14 bridge/import tests passed in isolated V8 with assert/test shims. Six JS modules including `src/app.js` parsed successfully, and 4 source/navigation/handoff contract checks were true. These are not full Node runner, CI, or browser E2E results.
- **CI blocker still open:** GitHub Actions `source` and `mobile` jobs repeatedly fail with **zero steps**, no assigned runner and unavailable logs. This is infrastructure/account execution blocking reliable full verification. Do not merge/deploy; continue source-specific development as committed checkpoints.

**High-value next engineering steps:** obtain running CI or local full `npm run check`; browser/mobile regression on an actual preview; source-verify October 17+ equipment and Increased INT scaling; add source-aware decomposition of whole-character Crit/Double Hit/DD stats before importing their item contributions; link skill allocations only after verifying Build Studio node-ID-to-skill-ID mapping. Don't silently overstate integration completeness.
