# Arcana Damage Calculator for Android

An offline, standalone Android app with Attack, Pet, and Retaliation modes. It does not connect to or modify Arcana Build Studio. Values are stored locally in the app's WebView storage.

## Formula behavior

- **Attack:** apply the combined additive percentage to the weapon range, add flat bonuses, then apply each separate multiplicative layer in order.
- **Pet:** add pet base damage, level scaling, and flat bonuses, then apply each separate multiplicative layer in order.
- **Retaliation:** multiply Defense by the global ratio and the sum of reflecting/Deflection/Bulwark percentages, then apply separate damage layers and per-enemy-attack modifiers.
- Damage is rounded after each formula stage by default. The rounding setting can be changed or disabled to compare results.

The source screens show these formula groups but do not establish every rounding detail for every game action. The app exposes rounding choices and lets users enter the displayed formula values directly instead of inventing class stat conversions. Formula inputs start blank; no sample character is loaded.

## Build

This project uses Java 17, Android Gradle Plugin 8.7.3, Gradle 8.9, and Android SDK 35. The repository workflow runs Node formula tests and packages a debug-signed APK.
