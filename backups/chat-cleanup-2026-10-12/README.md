# Arcana pre-chat-deletion backup index
Created October 12, 2026. This branch is BACKUP ONLY. Do not configure Railway production to auto-deploy it.

## Source-code snapshots (copied from deployed Railway Functions)
- backups/chat-cleanup-2026-10-12/railway/production_arcana_live_gateway.bun.js: currently custom-domain service `arcanacompanion.xyz`, source snapshot (18,144 characters).
- backups/chat-cleanup-2026-10-12/railway/production_arcanalfg.bun.js: currently `lfg.arcanacompanion.xyz`, source snapshot (85,774 characters).
- backups/chat-cleanup-2026-10-12/railway/legacy_arcana_web.bun.js: legacy/asset source `arcana.up.railway.app`, source snapshot (99,249 characters).
- backups/chat-cleanup-2026-10-12/railway/guild_directory_beta.bun.js: currently used for guild/search APIs, source snapshot (22,918 characters).
- backups/chat-cleanup-2026-10-12/railway/design_control.bun.js: theme/design control service, source snapshot (78,097 characters).

These are code snapshots, NOT a complete disaster-recovery backup. Railway environment variables, volumes, and any external assets/databases are not copied here.

## Most recent development branch (do not lose)
- Repository: `fytchx/Arcana` (private)
- GitHub branch: `arcana-wiki-studio-integrated-2026-10-12`
- Railway project: `Arcana Clean Staging`, ID `73c9e606-008e-407d-8a0f-78dbb8e34ca9`
- Staging site: https://arcana-stable-app-staging.up.railway.app/
- Wiki editor URL: https://arcana-stable-app-staging.up.railway.app/#/wiki/studio
- Staging volume: `arcana-wiki-articles`, 500 MB, mounted at `/data`.
- Staging is GitHub-backed and has a successful deployment from the above branch; latest observed deployment commit `b43860504919030274df5003930ee7059eae2a80`.
- Wiki Studio editor was reported to pass 88 automated tests; manual Android QA, live API/image checks, owner publishing and production promotion still require verification.
- Persistent publishing uses Railway environment variable `ARCANA_WIKI_OWNER_KEY`; never paste its value into chats/repositories. Owner key absent/unconfigured may prevent persistent publishing.
- The new site still depends on several legacy API/art endpoints, so DO NOT delete older Railway projects/services/volumes without replacing/validating those dependencies.

## Current production and recovery
- Production Arcana: https://arcanacompanion.xyz/ (also www)
- Railway project: `Arcana Restore`, ID `cef78f76-b750-4522-8542-f7fe07c837d2`
- Live service: `ArcanaWiki V12 Recovered Art`, ID `17146089-82dc-4e5e-b12d-3c7218eb3e5a`.
- Separate previews and pre-browsing/pre-pictures rollback services exist in the same project.
- LFG production: https://lfg.arcanacompanion.xyz/
- Railway project: `ArcanaLFG`, ID `891a17a4-be03-4d00-ad12-715ddcb3391b`
- Service: `ArcanaLFG Web`, ID `0bad06df-0fcf-4960-b3ee-8c7939e3209f`
- LFG listings volume: `ArcanaLFG Listings`, 100 MB, mounted at `/data`.
- Legacy Arcana project: `Arcana Volume Production`, ID `446ca80e-34fc-4e2b-8e52-9aa73c191e89`
- Its `Arcana Web` volume `Arcana Assets` is mounted at `/data`; `Arcana Design Control` has a separate design-settings volume; `Arcana Guild Directory Beta` has a listings volume. These are **not** captured in this GitHub branch.

## Existing source archives
Google Drive recovery folder:
https://drive.google.com/drive/folders/1koFOUI7g_n7kO0kNn4vNVaOu9lnsAVUn
Confirmed items include `Arcana_Stabilization_Recovery_Source_2026-10-12.zip`, recovery inventory / rollback IDs, and source snapshots for Arcana V3, public gateway, static styles v12, and Guild Directory Beta.

ChatGPT Library confirmed:
- `IdleArc_Wiki_Ready_Renamed_Images.zip` ~83 MB
- `IdleArc_Image_Asset_Inventory.csv`
- `Arcana_Artwork_Staging_Bundle_v1.zip` ~84 MB
- `Arcana_Art_Merged_Manifest_v1.json`
- `Arcana_Stabilization_Recovery_Source_2026-10-12.zip`
- Several asset recovery manifests, pet rules, QA reports, and Codex files.
Files independently saved in Library remain there after deleting a chat, but review Library to ensure the specific irreplaceable upload is saved. Chat exports should also be downloaded separately.

## Project continuity guardrails
- Never redeploy from these backup files directly without auditing and integration tests.
- Do not treat a Railway SUCCESS deployment as proof that navigation/images/features work.
- Keep deployment/volume/source separation intact until a full migration.
- Use one GitHub-backed source branch for current development, separate staging from production, verify Android/mobile behavior and full artwork before promotion.
- Preserve the original artwork, verified mechanics, Codex mappings, wiki content, and user design decisions.
- Do not delete old chats until ChatGPT data export has been downloaded and locally saved.
