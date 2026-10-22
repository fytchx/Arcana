# Arcana Guild Hub: tags only (supersedes 2026-10-18 crest concept)

Decision dated October 19, 2026: the **Guild Crest Designer is cancelled**. This document supersedes any earlier Guild Hub notes suggesting crests, emblems, shields, icon uploads or a heraldry studio should appear on Arcana.

## Preserve the useful guild features
- Guilds have a discoverable page with name, introduction, reserved four-letter tag, members, recruitment availability, and applications.
- Anyone with an eligible Arcana account can request a guild; ownership and official four-letter tags remain pending until moderator approval.
- Any player may use an unregistered, unclaimed four-letter tag in plain gray. Approved registered tags are unique, only assigned to the actual guild's members, and can be color-styled by guild owners.
- Tag controls: one hex color, and exactly one of **Solid**, **Soft glow**, **Subtle gradient**. This is intentionally the upper bound of identity customization.
- Moderators retain approval and rejection powers; owners/officers retain roster/recruitment/applicant management. This is not a Discord replacement or verification of IdleArc in-game memberships.
- No crest routes in navigation, no emblem rendering in cards or chat, no page image uploader/review flow. Existing former `#/guilds/crest` deep links safely display the directory.

## Legacy data and API
- Previously recorded `crest` and `icon` fields are **not deleted** from existing guild JSON files; archived preview records are retained to prevent irreversible loss. They are never exposed in the public Guild API or displayed by UI.
- New guild records do not contain them. Attempting to update a crest fails validation; icon upload returns HTTP 410, and icon moderation commands are invalid.
- `guildBadge` and `guildTagBadge` live in `src/guild-badge.js` with validated tags and hex colors. Unregistered gray behavior is enforced in renderer, not merely CSS themes.
- `src/guild-crest.js`, `src/guild-crest-workshop.js`, and `guild-crest-workshop.css` are gone.

## Theme Studio / public visitor guardrails
- This branch includes earlier 42 presets and 88 material finishes and contains the newest preview version of Pathfinder, Build Studio, Journal and BruTo's approved guide.
- Four psychedelic motifs reuse internal SVG geometry in one 360×360 exact-repeat tile. The same generated URL is cached and never assigned again if it already matches.
- Visitors **never** run the second Arcana iframe used for studio preview or load palette editing markup. The mobile Theme Playground starts in a compact drawer and expands to a real current-page preview without stale sizing.
- Review `tests/guild-hub.test.mjs`, `tests/guild-tags-public-theme-performance.test.mjs`, `tests/mobile_smoke.py` and `tests/public_theme_performance.py` for gates and performance results. Automated browser results are CI diagnostics, not proof of real-world Samsung FPS or device battery usage.

## Release staging rule
All of these changes currently live in a feature branch, with production untouched. Do not publish to `arcanacompanion.xyz` or merge to a production/live branch until user visual approval and successful performance checks. Always verify the official site's exact current deployed SHA and reconcile with this branch before the final release.
