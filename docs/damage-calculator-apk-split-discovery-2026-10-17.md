# Arcana damage calculator: supplied split APK discovery (2026-10-17)

**Source:** user-supplied `2222` file, SAI APK export ZIP; SHA-256 `8f1cf48968e6d5e22cd7691a061643fae7a8810301c106472d85c4c73b792608`. Private original archive remains outside repository.

## Confirmed by direct ZIP inspection

- `meta.sai_v1.json`: package `com.mikhaelstudio.idlearc`, version **1.3.6**, code **167**.
- Contains `base.apk` (106,573,369 bytes), **byte-identical** to previously supplied `IdleArc (3).apk`, SHA-256 `cb215c27f1b513392e3778d729600c2ef94df3ad9faf31e2c53c0e468a5303d1`.
- Contains missing `split_config.arm64_v8a.apk` (42,378,020 bytes), with **`lib/arm64-v8a/libapp.so`** (29,819,824 bytes) and `libflutter.so` (11,107,920 bytes). Other splits en, es, xxhdpi.
- `libapp.so`: AArch64 stripped Flutter/Dart AOT binary; **not the original Dart source code**.
- Scan of embedded UTF-8 strings identifies compiled client identifiers `package:idlearc/models/config/class_skill_cap.dart`, `ClassSkillCap`, `ClassSkillCap.fromJson`, `ClassSkillCapContribution.fromJson`, `ClassSkillCapStatus`, `computeClassSkillCapStatuses`, and config key `class_skill_caps`. Strong evidence **client explicitly supports per-effect skill cap data**, but strings alone do not reveal exact cap values, ordering, or whether server combat uses identical rules.
- Distinct cap label identifiers visible: `skillCapLabelTrapDamage`, `skillCapLabelBossDamage`, `skillCapLabelExecuteThreshold`, `skillCapLabelCounterstrike`, `skillCapLabelEchoDamage`, `skillCapLabelTriggerChance`, `skillCapLabelAttackConversion`, `skillCapLabelWeaknessAmp`, `skillCapLabelRetaliation`, `skillCapLabelHealOnKill`, `skillCapLabelPetEggChance`, `skillCapLabelLuckyTierChance`, `skillCapLabelDuplicateChance`, `skillCapLabelBonusDamage`, `skillCapLabelPetXpGain`, `skillCapLabelExtraKillChance`, and `skillCapLabelBlockChance`.
- Other explicit client identifiers: `attackDamageBreakdown`, `petDamageBreakdown`, `Retaliation Breakdown`, `retaliationBreakdownBaseFormula`, `get:attackDamageBreakdownPostFlatSection`.
- Bundled base APK does **not** include raw `/config/game` response JSON, nor a `class_skill_caps` JSON asset; configuration is accessed/parsed at runtime.

## Previously checked captures

- `1111.pcapng` SHA-256 `48184ceb9e3370d9d5c9f81d5e4e69601c30d71267cf28f8830546ec8cb904c6`.
- `222` SHA-256 `3cc27ea6c9350d8a7c180330c11df54f38fa2ffb137904e8959a3c163fd08f39`.
- These are same files previously analyzed: `222` contains encrypted TLS to `idlearc.com`; neither capture establishes the decrypted `/config/game` response or server damage formula.

## Research implications / limitations

**Previous 'missing ABI split' blocker is solved.** Flutter AOT static analysis is now possible but requires further extraction/analysis; simple strings checks do **not** mean the binary has been exhaustively reverse engineered. **Game server implementation remains separate**, so the client cannot definitively prove server combat behavior.

**Immediate priority:** obtain complete sanitized current `/config/game` JSON (especially `class_skill_caps`, `class_skill_trees`, `retaliation`) and compare to the compiled 1.3.6 client schema and to the old Oct 9 Arcana snapshot. Do not publish speculative cap numbers or commit user packet captures or binaries.
