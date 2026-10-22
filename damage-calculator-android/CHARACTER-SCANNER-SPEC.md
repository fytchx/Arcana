# Live Character Scanner — implementation contract

Status: approved direction; implementation has not started.
Branch: feature/live-character-scanner-2026-10-22, based on the standalone Damage Calculator APK branch.
Keep this work isolated from production and the Build Studio redesign.

## Product goal

Build an Android app workflow that captures an IdleArc character by watching screens the player opens, then produces a versioned character data file on the device. Arcana import is a later project. The scanner does not need IdleArc API access and must not automate gameplay or inspect hidden game state.

## Capture scope

Use the supplied real gameplay screenshots as initial recognition examples. A complete scan should collect:
- Character stats page and visible character identity/progression.
- Every equipment slot and item detail, including rarity/awakening/level, base stats, every affix, Drop Bonus, and every socketed gem with its stats.
- Every rune in each captured preset/loadout, preserving grid position, rune identity/type, grade/awakening/level, and bonuses.
- Every pet in the captured collection, including identity, level/mastery/affixes and visible bonuses; preserve which pets are equipped or favorited when visible.
- Passive Skill Tree and Class Skill Tree allocations, ranks/levels, and visible node names.
- The full stat breakdown panels for pets, runes, and the passive Skill Tree, keeping source and value for each contribution.

Only claim completeness for panels the player actually opened and scanned. Use a guided checklist to expose missing equipment, rune presets, pet pages, tree sections, and detail panels.

## User flow

1. Tap **Start character scan** in the APK.
2. Android shows its screen-capture consent prompt. The player approves and sees a persistent capture indicator/notification with a clear stop action.
3. The player returns to IdleArc and visits pages using the guided checklist. No game input is automated.
4. The scanner samples stable frames, classifies the page, reads visible labels/values, and deduplicates repeated frames and panels.
5. The player stops capture and reviews a character preview. Missing/uncertain fields are highlighted for correction.
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

Use the versioned schema in character-snapshot.v1.schema.json. The file includes character metadata, stats, equipment, rune presets and grids, pet collection, passive/class trees, stat breakdowns, and recognition evidence. Numeric-looking values remain typed values; unknown or unreadable fields stay null/omitted and appear in the review UI.

Do not include raw screenshots/video, Arcana login tokens, account cookies, or device identifiers in the exported file.

## Delivery phases

### Phase 1 — Capture and OCR prototype
Implement MediaProjection start/stop and on-device OCR in the standalone APK. Recognize the supplied character/rune/gear/tree/pet examples and create a reviewable draft locally. Establish screen classifiers, stable-frame sampling, evidence confidence, and stop/resume behavior.

### Phase 2 — Complete character capture
Extend the guided scanner across all supported gear slots, gems, affixes, rune presets, pets, passive/class skills, and required stat-breakdown panels. Export schema-v1 JSON and validate completeness without inventing hidden values.

### Phase 3 — Competitive-player validation
Have a small set of players capture varied classes and screen layouts. Fix OCR/confidence and workflow gaps, then freeze and document schema version 1 for later Arcana import.

### Later, outside this APK milestone — Arcana import
Build a separate Arcana translator/import flow for exported character JSON after the scanner format is stable. Do not add account upload or Arcana-specific auth to the current APK milestone.

## Acceptance checks

- Android system consent is required for every new capture session; stop ends capture immediately.
- Scanning does not affect game input or perform any game action.
- Frames are not retained or transmitted; no network request happens during capture/export.
- The review screen shows every recognized value, source panel, and uncertainty before export.
- Incomplete scans are clearly incomplete and list the screens still needed.
- Exported JSON validates against schema v1 and contains no raw image/video data.
- The damage calculator remains a separate Attack / Pet / Retaliation formula sandbox. This character capture workflow exports data and does not edit Build Studio.