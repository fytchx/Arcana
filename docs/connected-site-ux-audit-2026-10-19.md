# Arcana Connected UX audit | 2026-10-19
## Verified release baseline
Official production source: `1c0d092e4ab5afa4c4d49fdf98d8dd054e5a402f`, official domain Arcana Stable App, persistent `/data` volume preserved.
Protected rollback: `rollback/live-before-navigation-studio-audit-2026-10-19`.
No IdleArc mechanic data, build values, registry ownership rules or previously published design values are changed in this release.

## Navigation inventory and navigation contract
**Five bottom destinations stay available:** Home, Community, **Search**, Recent and Directory. The former Featured tab becomes a search/discovery sheet, not an additional feed page. A useful set of six destinations fills the sheet until a search query is entered; then existing full merged Arcana index supplies results. Clearing the query restores discovery. Existing `#/featured` legacy deep link continues to resolve.
The header's top-right search affordance is removed. The **Admin portal** icon occupies that location only after the authenticated account API reports a creator/admin role; it is absent for guests and ordinary users. This is a visibility convenience, never a substitute for API server authorization. The actual Admin Control Center remains role-protected.
`Ctrl/Cmd+K` still opens global search. A–Z directory remains the complete destination list.
## Home page audit
Home now treats its five decision areas as comparable entry points: Build Studio, current Journal story, Pathfinder, Tools and a connected Builds/Guides/Wiki path. Desktop cards are proportioned to readable heights, not tiny icons over wallpaper. The knowledge bridge underneath links Player Guides, Community Builds and ArcanaWiki. Older routes remain intact and the live Journal feature still hydrates current story metadata.
## Community audit
Community now leads with Guild Hub, Wiki/Guides, Build Studio and Journal navigation cards in one visual system. The actual player publishing feed remains untouched, with its existing authorization requirements, individual post routes and moderators. No fake community content is inserted.
## Theme Studio audit
The 42 Classic, Signature and Psychedelic presets now share one visual library. Twelve diverse starters show first; an explicit reveal offers the other 30, and search covers all 42. No collection-specific headings or duplicate catalogs remain. The texture gallery still has 88 finishes and every existing stored design key remains compatible.
The editor navigation is organized Presets → Colors → Textures → Homepage advanced → Buttons advanced → Text advanced → Saved designs. Most advanced panels remain closed by default. A status strip explains the setting that just changed. On desktop, the **actual current Arcana page iframe preview** is sticky alongside the controls and scrolls naturally inside its own bounded view; mobile keeps its compact dock.
All edits remain **local drafts** until the authenticated owner explicitly clicks Publish to everyone. All existing published-theme version history and restore control remain available.
## Regression, performance and access
- Existing full Node `npm run check`, Source QA and Android Chromium mobile/desktop smoke must pass.
- New `tests/connected-ux-refresh.test.mjs` asserts preset completeness, role-only header, search discovery, home parity and community links.
- Android smoke checks visitor search results, community routes, admin header hidden as guest and visible for a **synthetic authenticated role**. This **is not** access to the owner's own browser login, which cannot be borrowed through GitHub/Railway APIs.
- The extra stylesheet is static; no new public visitor runtime iframe, polling loop or database read was introduced.
- Release authorization: user explicitly requested production publishing after QA, using protected rollback. Restore the prior Railway successful image and reset release branch to protected commit on a critical rollout failure. Never replace/delete/detach the production volume.
## Follow-up opportunities
- Replace remaining aging secondary shortcuts with one central navigation registry in a later maintenance cycle. This audit deliberately preserves legacy URLs and functionality rather than breaking old links.
- Keep future theme control additions tied to a specific preview page and a short explanation of what they affect.
- Admin identity should be confirmed by the owner in their own live session after deploy; synthetic role tests validate gating but not their specific account.
