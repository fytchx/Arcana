# Codex image decisions
Source: direct confirmation from the Arcana maintainer, 2026-10-12.

- **Octopusia** is the blue octopus depicted in the existing official pet sprite sheet (row 4, column 6; zero-based index 23). Original source asset key is `pets:octopussy`. Keep the display name **Octopusia**, add this explicit resolver alias, and preserve the original source file unchanged.
- **Materials dropped from biomes:** individual artwork is optional and should not be treated as a blocker. Keep material reference entries, drop details, and category navigation intact. Do not create substitute art for them.
- This waiver applies only to materials confirmed to be biome drops. Boss rewards, currencies, and other materials should not be automatically classified as biome drops without source data.
- Keep all previously verified sprite mappings and images. Re-run both source and live mobile tests before promoting to production.
