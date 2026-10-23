# Manual Damage Formula calculator — test release, October 23, 2026

Baseline: `main` commit `ffa52e7`, after Directory-only signature and Journal fixes.
Deploy target: Arcana Preview App only. Production is not authorized.

The tool accepts manually supplied tooltip formula values, saves each mode in a
new localStorage key, starts blank, clears the current mode, and has no dependency
on Build Studio state. Screenshot OCR is lazy-loaded Tesseract.js 6.0.1. It runs
in-browser, accepts 1–3 images, and requires review before applying values.
CDN downloads require internet access; images and OCR text are not uploaded or saved.

Formula evidence reviewed:

- Supplied October 23 Attack, Retaliation and Pet Damage Breakdown screenshots.
- Historical `arcana-damage-modern-2026-10-17` engine, retaliation engine,
  screenshot references, and current-config-cap audit. These explicitly preserve
  gaps in exact damage rounding and pet pre-bonus base derivation.
- `IdleArc_Latest_Datamine_2026-09-30_CONSOLIDATED.zip`, SHA manifest and current
  companion reference data. Contains pet species base ranges and configuration
  tables; does not establish current server integer-rounding semantics.

Attack: `(weapon + jewelry) × (1 + sum(additive)/100)`, then flat bonuses,
then the separate percentage layers, each `1 + pct/100`.

Pet: `(individual pet base + level scaling + flat bonuses)` × separate layers.
Base and level scaling are manually entered; never infer these from a final pet card.

Retaliation: `Defense × global ratio × sum(base pool percentages)/100`, then
independent layers and the explicitly entered stance factor. Minimum roll is
entered as a percentage of maximum. Blocked factor produces a separate range.
No global ratio, range factor, stance, or character values are prefilled.

The tool uses JavaScript double precision without fabricated per-stage rounding.
Display formatting rounds to at most two decimal places. It does not claim bit-exact
game totals: abbreviated tooltip inputs, hidden precision, and the exact game
rounding order remain validation gaps. No crit, proc, DPS or enemy-mitigation model
is included. Promotion to production requires resolving the rounding gap and
comparing a complete Attack/Pet fixture, including an actual unmodified pet base.

Test-only screenshot values are confined to tests. The retaliation fixture checks
consistency at displayed precision, not exact server equality. Synthetic fixtures
verify stage grouping and arithmetic independently of that approximation.
