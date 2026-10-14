# Arcana Minimal — Original Icon Assets

**Version 1.0 — 144 themeable SVG assets**

An original, unified icon system for the Arcana IdleArc companion experience. The silhouettes are informed by familiar RPG categories, not extracted game sprites or reproduced game logos. Game/item reference artwork remains separate.

## Directory

| Category | SVGs | Purpose |
| --- | ---: | --- |
| UI | 66 | Navigation, feedback, input, controls, accounts, actions |
| Equipment | 13 | Every equipped gear slot, including both ring and utility slots |
| Classes | 5 | Warrior, Archer, Mage, Rogue, Druid |
| Features | 17 | Build Studio, Wiki, Codex, Rune Forge, passive/class tree, calculators, social |
| Stats | 30 | Damage, retaliation, block, EXP, buffs, pets, upgrades, etc. |
| Currencies | 13 | Rubies, gold, Arcstone, Guildstones, materials, pets, gems |

The authoritative index is `manifest.json`; files are individual vector assets.

## Recommended usage

Render using `arcanaIcon(id, size)` from `src/arcana-icons.js`, or `icon(id, size)` from `src/ui.js`. Both yield **inline SVG** so CSS variables and player icon preferences work. SVGs loaded through `<img src="...">` do not inherit a page's CSS variables, so for live theme switching do not use img tags.

The visual system uses `stroke="currentColor"` and, on glyphs with a second detail layer, `--arcana-icon-detail` (falling back to currentColor).

### Appearance controls

User Center → App Settings:

* Site appearance: Slate, Midnight, Obsidian, Dusk, or follow managed Arcana surface
* Site accent: any of the 10 historical color presets or managed accent
* Icon color: follow site's selected color (default) or any of the 10 colors **independently**
* Icon treatment: Neutral, Accent, Two-tone (default), Subtle
* Preferences are browser-local and deliberately do not affect build statistics or the game

`applyTheme()` in `src/theme.js` sets `--arcana-icon-color` and `data-arcana-icon-mode`. The asset pack itself is **one set**, never duplicated into 10 sets or shipped as raster icons.

### Restrictions

* SVG source is static, owned by Arcana, no embedded scripts, network links, fonts, image references, or runtime uploads.
* Players may upload a custom **Build Studio profile portrait**, but that image is local state, separate from the SVG library, with dedicated validation and compression.
* Missing icon IDs are resolved to a simple box rather than blank screens.
* New icons must remain recognizable at 16–24px and avoid fake decorative effects.

## Quality checks

`npm run check` verifies the manifest, every on-disk SVG, theme settings and compatibility with legacy icon helpers. Mobile smoke checks Build Studio, navigation and settings; preview-only live checks require the staged server.

**Warning:** App configuration and public Wiki pages must not mistake these icons for verified in-game item artwork.
