# Arcana Damage Calculator for Android

An offline, standalone Android app with Attack, Pet, and Retaliation modes. It does not connect to or modify Arcana Build Studio. Values are stored locally in the app's WebView storage.

## Formula behavior

- **Attack:** apply the combined additive percentage to the weapon range, add flat bonuses, then apply each separate multiplicative layer in order.
- **Pet:** add pet base damage, level scaling, and flat bonuses, then apply each separate multiplicative layer in order.
- **Retaliation:** multiply Defense by the configured 0.6 ratio and the sum of reflecting, Deflection, and Bulwark base percentages, then apply separate damage layers and combat stance. The configured 0.70 variance floor creates the displayed low-to-high range. Block bonus is conditional and is shown separately from the normal-hit range.
- Damage is rounded after each formula stage by default. The rounding setting can be changed or disabled to compare results.

The local `/Data mine` audit and config-path index use snapshot `2026-10-06-002`. They provide configured coefficients and thresholds, not the server's executable damage code. The Retaliation implementation is cross-checked against the supplied breakdown: the 0.70 variance explains its lower bound, and block damage is not applied to every enemy attack. Attack and Pet layer ordering is represented as shown in the breakdown; their hidden server rounding and any unlisted conversions remain unverified. Character inputs start blank; the app only pre-fills game-wide Retaliation constants, not a sample character.

## Build

This project uses Java 17, Android Gradle Plugin 8.7.3, Gradle 8.9, and Android SDK 35. The repository workflow runs Node formula tests and packages a debug-signed APK.
