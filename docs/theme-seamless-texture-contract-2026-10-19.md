# Arcana texture seam repair | 2026-10-19

Scope: **test site only**. This work continues the Signature Collection branch from the Guild Crest preview baseline. Never publish the global design, merge to production, or change live user data as part of texture QA.

## Why the old textures showed square seams

The material programs were layered CSS gradients. Each gradient was being rasterized as a small background image (76px in the mini-preview and around 165/340px in material previews) and that image repeated. Non-periodic gradients, conic fields and radial light had different values on opposite tile borders. Repeating those pixels exposes straight vertical/horizontal edges halfway through a card. Applying a soft blur would only disguise them.

## Seamless renderer contract

- `theme-seamless.css` loads last. One full-size gradient field per drawn surface; `background-repeat: no-repeat`, `background-size: 100% 100%`, `background-position: center` for public panels, home feature cards, wallpaper target, mini-preview, finish thumbnails, and Signature preset artwork.
- “Seamless” does **not** mean no repeating gradient primitives. CSS `repeating-linear-gradient` or `repeating-radial-gradient` are mathematical functions that fill the **whole surface** without using tiled background images.
- All 84 texture definitions retain stable names and editor selection. Material, atmospheric and ornamental behavior are recorded in `src/theme-patterns.js`.
- The 14 visibly problematic Classic shader programs use matching continuous texture recipes for public site, mini-preview and gallery.
- `src/arcana-contour.css` and `signature-themes.css` scale line spacing *inside gradient stops* via `--arcana-pattern-scale` / `--mini-signature-scale`, rather than shrinking/repeating the raster image. Do not regress to shrinking background tiles to implement texture size.
- “No texture” remains untouched. Existing target placement (background, cards, both) and admin publishing controls retain their original semantics.

## Regression gates

1. `npm run check`, particularly `tests/theme-seamless.test.mjs`, `tests/signature-collection.test.mjs` and original texture tests.
2. `tests/mobile_smoke.py` tests real Chromium computed styles for Signature/Classic/ambient finishes, thumbnail, live mini-preview and actual Arcana home try-on. Every gradient layer must be non-repeating and cover 100% of its surface.
3. Manual Samsung Internet: raise intensity and scale, switch between wide and narrow preview sizes, inspect all 84 finishes as well as homepage / Build Studio / Pathfinder / Guild Hub. The repeating-gradient *geometry* can cross the edges of a card; a rectangular tile restart **inside** the card is a failure.
4. In editor, select background-only then cards-only placement, verify no design leakage to public users and no change to preview volume or login roles.

## Relevant files

`theme-seamless.css` (last CSS override), `signature-themes.css`, `arcana-contour.css`, `src/theme-patterns.js`, `src/design-mini-preview.js`, `src/launch-navigation.js`, `tests/theme-seamless.test.mjs`, `tests/mobile_smoke.py`.

This is not a request to alter default production appearance. The owner decides separately whether to promote theme changes.
