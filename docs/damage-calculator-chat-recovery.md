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
