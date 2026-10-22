# Arcana Theme Studio V3

Production branch: release/arcana-mobile-2026-10-15. Owner/admin only, at /#/admin?tab=appearance.

## Persistent preview
Desktop: a side-by-side sticky preview. Mobile: a floating drawer above the dock that can be collapsed, enlarged or viewed full-screen, with a swipe grip and automatic retreat while typing.

Preview choices: Home, Build Studio, Pathfinder, Wiki, Profile; Phone, Tablet, Desktop; Before and After. The preview is a live *simulator* of design colors, textures and control styles, not embedded real pages.

## Advanced studio
32 CSS-only texture designs, searchable theme presets, jump navigation, 4 local design-vault slots, JSON export/import, live text contrast meter and a one-tap button-label contrast recommendation.

Saved vault slots are local to the admin's browser. Importing a theme never publishes it. Global publication still uses the protected admin API, requires explicit confirmation, and retains rollback.

## Verify before release signoff
- Android Samsung Internet: controls, preview drawer, keyboard auto-retreat, tap/swipe sizing, no horizontal overflow.
- Desktop Edge/Chrome/Firefox: sticky preview beside scrolling editor, selectable patterns, high-contrast selects.
- All five simulated pages, device switches, Before/After, saved vault restore and import/export.
- A published theme applies to anonymous visitors, while local drafts remain private and rollback works.
- Recheck Build Studio, Pathfinder, Wiki and account data unaffected by appearance changes.

Automated source checks cannot substitute for hands-on visual browser tests.