# Arcana Damage Calculator for Android

An offline, standalone Android app for capturing IdleArc character screens and exporting a local character data file. It does not connect to or modify Arcana Build Studio. It also includes a separate manual Attack, Pet, and Retaliation calculator for players who only want to enter damage formula values.

## Live character capture

1. Tap **Start screen capture** and accept Android's screen-sharing prompt.
2. Switch to IdleArc. Keep the Android notification visible and navigate through the character screens you want to capture.
3. Return to Arcana, stop capture, review the screen classifications and OCR text, and correct any mistakes.
4. Export `arcana-character-snapshot.json` to a location you choose.

The scanner requests a frame about once every 1.25 seconds while active, requires stable OCR across two frames, and stores up to 100 distinct recognized screens in private app preferences. OCR uses the bundled ML Kit Latin model on-device. Frame pixels are held in memory only; the app does not save screenshots, record audio, or send data over a network. Android's foreground notification provides a Stop action. Capture permission is required again each session.

OCR review cards allow the player to reclassify a screen and edit its recognized text. The export preserves OCR evidence and normalized text-line positions. Version 0.2 does **not** yet convert every image into verified structured equipment, pet, rune, and skill values. Those typed fields remain empty; the original text evidence is retained for later parsing/import work. The completion checkbox only marks the player's confirmation after all desired screens are visited; missing screen categories are still listed.

The export file is created through Android's document picker. No Arcana account, upload, API call, accessibility service, or always-on capture is involved.

## Manual damage-only option

Use the Attack, Pet, or Retaliation selector to enter only the values needed by a damage formula and export a separate `arcana-damage-only.json`. This does not require screen-capture permission or a full character scan.

## Formula behavior

- **Attack:** apply the combined additive percentage to the weapon range, add flat bonuses, then apply each separate multiplicative layer in order.
- **Pet:** add pet base damage, level scaling, and flat bonuses, then apply each separate multiplicative layer in order.
- **Retaliation:** multiply Defense by the configured 0.6 ratio and the sum of reflecting, Deflection, and Bulwark base percentages, then apply separate damage layers and combat stance. The configured 0.70 variance floor creates the displayed low-to-high range. Block bonus is conditional and is shown separately from the normal-hit range.
- Damage is rounded after each formula stage by default. The rounding setting can be changed or disabled to compare results.

The local `/Data mine` audit and config-path index use snapshot `2026-10-06-002`. They provide configured coefficients and thresholds, not the server's executable damage code. The Retaliation implementation is cross-checked against the supplied breakdown: the 0.70 variance explains its lower bound, and block damage is not applied to every enemy attack. Attack and Pet layer ordering is represented as shown in the breakdown; their hidden server rounding and any unlisted conversions remain unverified. Character inputs start blank; the app only pre-fills game-wide Retaliation constants, not a sample character.

## Build

This project uses Java 17, Android Gradle Plugin 8.7.3, Gradle 8.9, and Android SDK 35. The repository workflow runs Node formula tests and packages a debug-signed APK.
