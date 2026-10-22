# Live Character Scanner — implementation contract

Status: approved direction; implementation has not started.
Branch: feature/live-character-scanner-2026-10-22, based on the standalone Damage Calculator APK branch.
Keep this work isolated from production and the Build Studio redesign.

## Product goal

Build an Android app workflow that can either capture a complete IdleArc character or let a player manually enter only the damage-breakdown values. Both paths produce a versioned character data file on the device. Arcana import is a later project. The scanner needs no IdleArc API access and must not automate gameplay or inspect hidden game state.

## Capture scope

Use the supplied real gameplay screenshots as initial recognition examples. A complete scan should collect:
- Full Character Stats window, including every visible stat and its displayed value.
- Attack Damage Breakdown, including base weapon range, flat bonuses, additive bonuses, multiplicative layers, intermediate totals, and final damage range.
- Pet Damage Breakdown, including pet base/level scaling, flat bonuses, each separate multiplier, and effective multiplier/result.
- Retaliation Breakdown, including reflecting/base pool, Defense, ratio, every multiplier, per-enemy-attack conditions, and damage range/result.
- Every equipment slot and item detail, including rarity/awakening/level, base stats, every affix, Drop Bonus, and every socketed gem with its stats.
- Every rune in each captured preset/loadout, preserving grid position, rune identity/type, grade/awakening/level, and bonuses.
- Every pet in the captured collection, including identity, level/mastery/affixes and visible bonuses; preserve which pets are equipped or favorited when visible.
- Passive Skill Tree and Class Skill Tree allocations, ranks/levels, and visible node names.
- Full stat breakdown panels for pets, runes, and the Passive Skill Tree, keeping source and value for each contribution.

Only claim completeness for panels the player actually opened and scanned. Use a guided checklist to expose missing stats windows, damage breakdowns, equipment, rune presets, pet pages, tree sections, and detail panels.

## Two ways to create a file

### Full character capture
Start live capture and visit the guided checklist. The app classifies screens, reads visible values, and assembles a full profile for review and export.

### Damage breakdown only
Skip screen capture and full character setup. Manually enter the Attack, Pet, and Retaliation breakdown values in the APK, with each breakdown independently optional. Export a smaller damage-only file that records the entered formula layers and results. This is the quick option for players who only want to share or inspect their damage math.

The existing calculator remains usable as a standalone manual sandbox. The quick-entry path adds an exportable record without requiring a full scan.

## Capture user flow

1. Choose **Full character capture** or **Damage breakdown only**.
2. For full capture, tap **Start character scan**. Android shows its screen-capture consent prompt. The player approves and sees a persistent capture indicator/notification with a clear stop action.
3. Visit the checklist: Character Stats; Attack/Pet/Retaliation breakdowns; gear and item details; rune presets and rune details; pets and pet details; Passive Tree; Class Skills; pet/rune/passive stat breakdown panels.
4. The scanner samples stable frames, classifies the page, reads visible labels/values, and deduplicates repeated frames and panels.
5. Review a preview. Missing/uncertain fields are highlighted for correction. Manual damage-only users can enter or correct each field here.
6. Tap **Export character file** to save a JSON file on the device; optionally share it to another app.

## Privacy and capture behavior

- Capture only after the player starts a session and grants Android's system permission.
- Make capture state visible and provide a reliable stop control.
- Process frames on-device. Discard frames after OCR/recognition; never upload or retain the raw recording in the default flow.
- The only output is the structured JSON file the player explicitly exports.
- Do not request microphone/audio capture or network permission for the scanner-only build.
- Explain that the scanner only sees screens the player opens and cannot read hidden values.

## Recognition and data quality

- Use screen classification plus on-device OCR and official game icon matching where useful.
- Sample only when frames are stable, not every display frame.
- Keep recognized text, normalized value, source screen, timestamp, and confidence together until review.
- Support decimal abbreviations, percentages, multipliers, ranges, rarity labels, tiers, and missing values without coercing uncertain text into a number.
- Prefer explicit correction prompts over fabricated values.
- Preserve preset ID and grid coordinates for runes; preserve item slot for equipment; preserve identity and capture order for repeated pets/items.
- Store scanner version, schema version, game snapshot/source, and scan timestamp in the exported file.

## Character file format

Use the versioned schema in character-snapshot.v1.schema.json. It includes capture mode, character metadata, the full stats window, the three formula breakdowns, equipment, rune presets and grids, pet collection, Passive/Class trees, pet/rune/passive stat breakdowns, and recognition evidence. In damage-only mode, character gear/skill/pet sections may be absent; at least one manually entered damage breakdown is required. Unknown or unreadable fields stay null/omitted and appear in the review UI.

Do not include raw screenshots/video, Arcana login tokens, account cookies, or device identifiers in the exported file.

## Delivery phases

### Phase 1 — Manual damage file and live-capture prototype
Keep the three manual damage forms available and add damage-only JSON export. Implement MediaProjection start/stop and on-device OCR. Recognize the supplied Character Stats, Attack/Pet/Retaliation breakdown, rune, gear, tree, and pet examples; show a reviewable local draft with confidence. Validate the exact breakdown values before attempting broad item capture.

### Phase 2 — Complete character capture
Extend the guided scanner across all supported gear slots, gems, affixes, rune presets, pets, Passive/Class skills, and required stat-breakdown panels. Export schema-v1 JSON and validate completeness without inventing hidden values.

### Phase 3 — Competitive-player validation
Have a small set of players capture varied classes and screen layouts. Fix OCR/confidence and workflow gaps, then freeze and document schema version 1 for later Arcana import.

### Later, outside this APK milestone — Arcana import
Build a separate Arcana translator/import flow for exported character JSON after the scanner format is stable. Do not add account upload or Arcana-specific auth to the current APK milestone.

## Acceptance checks

- Android system consent is required for every new capture session; stop ends capture immediately.
- Scanning does not affect game input or perform any game action.
- Frames are not retained or transmitted; no network request happens during capture/export.
- Full capture includes the Character Stats window and all three damage breakdown screens as explicit checklist items.
- Manual damage-only mode works without screen-capture permission and exports entered Attack/Pet/Retaliation values without requiring gear/rune/tree/pet scanning.
- The review screen shows every recognized value, source panel, and uncertainty before export.
- Incomplete scans are clearly incomplete and list the screens still needed.
- Exported JSON validates against schema v1 and contains no raw image/video data.
- The damage calculator remains a separate Attack / Pet / Retaliation formula sandbox. This character capture workflow exports data and does not edit Build Studio.