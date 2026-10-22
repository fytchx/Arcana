plugins {
    id("com.android.application")
}

android {
    namespace = "com.arcanacompanion.damagecalculator"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.arcanacompanion.damagecalculator"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
}

dependencies {
    // Bundled model keeps OCR available offline on first launch.
    implementation("com.google.mlkit:text-recognition:16.0.1")
    implementation("androidx.core:core:1.15.0")
}
