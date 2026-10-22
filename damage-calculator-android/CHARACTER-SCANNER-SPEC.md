# Live Character Scanner — implementation contract

Status: approved direction; implementation has not started.
Branch base: standalone Damage Calculator APK feature branch.
Keep this work isolated from production and from the Build Studio overhaul.

## Product goal

Let an IdleArc player start a live screen scan in the Arcana Android app, return to the game, and move through the character screens. Arcana recognizes visible character values, assembles a complete character snapshot, lets the player review and correct it, then uploads the structured snapshot to the player's Arcana account.

This is a companion-data import. It must not automate gameplay, inspect hidden game state, or require IdleArc API access.

## User flow

1. Tap **Scan character** in the APK.
2. Android shows its screen-capture consent prompt. The player approves and sees a persistent capture indicator/notification with a clear stop action.
3. Follow a guided checklist while visiting the game screens: character stats, equipment and affixes, skills, runes, pets, talisman, and any other supported character panel.
4. The scanner samples stable frames, identifies the screen, reads visible labels/values and avoids adding the same panel twice.
5. Return to Arcana. Review a profile preview. Mark uncertain or missing fields; do not silently guess.
6. Confirm **Upload to Arcana** after signing in/linking the app to an Arcana account.
7. Arcana stores a private, versioned character snapshot. It is not a public build and is not shared unless the player explicitly chooses that later.

## Privacy and capture behavior

- Capture only after the player starts a session and grants Android's system permission.
- Make capture state visible and provide a reliable stop control.
- Process frames on-device. Discard frames after OCR/recognition; never upload or retain the raw recording in the default flow.
- Upload only the reviewed structured values and source metadata after explicit confirmation.
- Do not request microphone/audio capture.
- Explain that the scanner only sees screens the player opens and cannot read hidden values.

## Recognition and data quality

- Use screen classification plus OCR and official game icon matching where useful.
- Sample only when frames are stable, rather than attempting to interpret every display frame.
- Keep recognized text, normalized value, source screen, timestamp, and confidence together until review.
- Support decimal abbreviations, percentages, multipliers, ranges, rarity labels, and missing values without coercing uncertain text into a number.
- Prefer explicit correction prompts over fabricated values.
- Store a schema version and game-data snapshot/source so Arcana can identify stale or unverified fields.

## Arcana upload contract

The current Arcana account API supports account-owned Build Studio saves, but there is no character-snapshot upload endpoint yet. Add a separate account-owned endpoint; do not overload the Build Studio build-save route.

The upload path needs:
- Explicit Arcana account linking from the APK using a short-lived, single-use authorization handoff; do not embed a client secret in the APK.
- HTTPS, same-account authorization, strict schema/size validation, and safe account quotas.
- A private character record with creation/update times and scanner/schema versions.
- A review/confirm screen before submission and an account-side replace/keep-both choice.
- A response that confirms the saved record and can be opened in Arcana.

Never upload by sending account cookies or session tokens through an untrusted intent, URL, logs, or analytics.

## Delivery phases

### Phase 1 — Live capture and review prototype
Implement MediaProjection session start/stop and on-device OCR in the standalone APK. Recognize the known stats and damage-breakdown screens first. Show detected fields with confidence and let the user correct them. No account upload in this phase.

### Phase 2 — Full character capture
Extend the guided scanner to equipment, affixes, pets, skills, runes, talisman, and other character panels. Build a versioned character JSON model and test it against user-provided recordings from multiple screens and character classes.

### Phase 3 — Arcana account upload
Implement the account-linking flow and private character endpoint. Test through an isolated Arcana preview/service and verify authorization, size limits, reload, edits, and delete/replace behavior before any production rollout.

## Acceptance checks

- Android system consent is required for every new capture session; stop ends capture immediately.
- Scanning does not affect game input or perform any game action.
- Frames are not retained or transmitted; a network inspection during scanning confirms no upload until the player presses **Upload to Arcana**.
- The review screen shows every value, its source, and any uncertainty before upload.
- Incomplete screens produce an incomplete profile with clear gaps, not a falsely complete character.
- A successful upload appears only in the authenticated user's private Arcana account.
- The damage calculator remains a separate Attack / Pet / Retaliation formula sandbox. Build Studio remains a separate build-assembly tool.