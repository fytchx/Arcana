# Immutable production-source checkpoint: after Journal, before Guild Hub

Captured Oct 18, 2026, prior to any Guild Hub deployment, from the **running Railway production service** rather than guessed GitHub main.

- Public domain: https://arcanacompanion.xyz/
- Railway project: Arcana Clean Staging (production-hosted)
- Railway environment: staging / ccf42463-83ac-4f56-b438-4f16acc75ebb
- Production service: Arcana Stable App / c1dbc4f3-d40e-4bac-86f8-79e62ee1a297
- Last successful live deployment ID: ab43b0eb-346d-4b20-91bd-64e4c0a6b550
- Live deployment snapshot ID: 02a63eab-783e-49c0-808c-2a5c24f3da0f
- **Exact deployed Git commit SHA**: c8aa0f82e0663b06e609ecc5f54c2b0edb554626
- Source ref at time: release/arcana-mobile-2026-10-15
- Exact GitHub checkpoint branch: snapshot/live-after-journal-before-guilds-2026-10-18. Branch initial pointer equals deployed SHA; avoid commits on that branch.
- Includes Arcana Journal, Oct 18 balance/home changes, and Google verification allowlist. There are no Guild Hub changes at this SHA.
- Separate persistent production volume: arcana-wiki-articles (1805cf76-59b4-4d3e-9249-eb53fe5af438), mounted at /data. **The Git checkpoint does not copy or snapshot the production data volume** and must not be misrepresented as a data backup. Keep it attached to the original production service. Ask user to create an independent verified Railway volume backup before risky migrations.

## Isolated preview deployment

- Separate Railway project: Arcana Preview (ddb157cb-ab62-410f-829f-180432db31c6), environment: preview (4650cd2d-1ea5-475f-a49c-22730f90e062).
- Existing Arcana Preview App service: 22dd161d-14b1-4645-83a8-646aae27f629.
- Its own isolated /data volume: Arcana Preview Data (isolated), 79249673-a1fb-4292-800d-13eddc8447f9. **Never attach production /data here**.
- Previous test source: preview/texture-lab-2026-10-16 at ebdc811c05e74e114294e879656e84c663056981. This branch and previous deployment remain available for rollback.
- Test source: feature/guild-crest-preview-from-live-2026-10-18, direct descendant of the exact post-Journal live commit.

## Scope decisions

Guild Hub represents guild identity and recruitment, **not a Discord alternative**. It provides free gray four-letter tags, moderated official registrations, profile badges, roster/applications, page icon moderation, and a public guest-friendly Crest Designer. No channels, chat, event planner, raid RSVPs, DMs, or Discord-style boards. Crest Designer is the main showcase; guild use stays optional.
