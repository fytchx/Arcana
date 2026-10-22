# Arcana Combined Release — 2026-10-19
Supersedes the older three-feature-only scope in docs/release-three-features-2026-10-19.md.
Production source before launch: 49f7a27ff7824cb3b4ddc69e3a6f43431be9b397.
Preview QA source: 6419f00048401b414fe477cba1755cf162c16bbb.
Carry forward live BruTo guide, Pathfinder, Signature themes, wiki, profiles, and assets; add tags-only Guild Hub and recolorable psychedelic textures. Crest Designer remains cancelled.
Rollback ref: rollback/prod-2026-10-19-before-guild-theme-release (immutable live SHA above).
Prior Railway successful deployment: 737bee77-a24f-41da-89f0-547fc0a426f7, project Arcana Clean Staging, service Arcana Stable App, environment staging, official custom domains arcanacompanion.xyz and www.arcanacompanion.xyz.
Preserve same /data mounted volume arcana-wiki-articles and existing OAuth credentials. No database migration or published-theme changes. Rollback requires redeploy prior build and restore release branch to pinned rollback commit.
This candidate reconciles production's historical docs with the current feature tree; production-only obsolete test asserting Guild Hub is absent has been updated.
