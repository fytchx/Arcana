# Arcana production data protection and recovery

**Production resource, verified October 20, 2026**

- Railway project: **Arcana Clean Staging** (the historical project name is misleading).
- Environment: **staging** (this is the **live production** environment).
- Service: **Arcana Stable App**, hosting `https://arcanacompanion.xyz/`.
- Volume: **arcana-wiki-articles** (ID `1805cf76-59b4-4d3e-9249-eb53fe5af438`), mounted at **`/data`**.
- Latest verified production release when this document was prepared: `release/arcana-mobile-2026-10-15`, commit `8fd2668`.

**Never delete, recreate, move, or detach this volume as part of a code release.** Never move the production domain to an empty clone. All testing must use disposable data, not the production volume.

## What is stored

The application stores accounts and sessions, profiles, builds, player activity, community posts, guild pages/tags, moderation records, chat messages, administration/theme configuration, Journal articles, Wiki publishing files, and feedback in file-backed directories. Depending on Railway environment settings, the following variables can redirect storage to separate paths:

- `ARCANA_WIKI_DATA_DIR`
- `ARCANA_ACCOUNT_DATA_DIR`
- `ARCANA_TRAFFIC_DATA_DIR`
- `ARCANA_BETA_FEEDBACK_DIR`

Before considering backups complete, confirm **all** configured data directories are inside the protected volume. If any variable points outside `/data`, make a separate persistent-storage and backup plan for that path. Backups of `/data` do not protect application files stored elsewhere.

## Enable Railway volume snapshots (owner action in Railway dashboard)

The Railway connector used to inspect services currently does **not** expose backup schedules or snapshots. Snapshot protection cannot be verified or enabled using it. **Do not describe backups as active until checked in Railway.**

1. Open Railway → **Arcana Clean Staging** → **staging** → **Arcana Stable App** → **Backups**.
2. Confirm the listed volume is **arcana-wiki-articles** at `/data`. Double-check you are not editing **Arcana Preview** or another historical production project.
3. Choose **Edit schedule** and enable **Daily, Weekly and Monthly** snapshots. Railway's documented retention is daily six days, weekly 27 days, monthly 89 days.
4. Create **one manual backup now**. Verify it appears in the list with a timestamp and a successful status.
5. Consider **locking** the manual backup, which prevents ordinary expiry/deletion. Be aware that deleting or wiping the volume also deletes its Railway backups.
6. Capture evidence of active schedules and the manual snapshot's timestamp in your private operations notes. Never post backup archives, access tokens, session cookies, or user records in public channels.

Railway snapshots restore only within the **same project and environment**. They are not a substitute for a securely stored offsite copy. Backups are billed incrementally; see Railway's current pricing.

## Read-only integrity inspection

Run when connected to a trusted shell that has the application environment variables and mounted volume:

```bash
npm run data:audit
```

This does **not** copy, alter, or delete files. It recursively checks readable JSON syntax and summarizes aggregate file counts/bytes for each configured storage root. It exits nonzero on missing/unreadable directories, malformed JSON, symlinks, or uninspectably large JSON files. It intentionally does not print account IDs, filenames, message contents, or secrets.

A clean check proves only that the inspected files were parseable and accessible. It does **not** prove that every transaction is consistent, that the data is complete, or that a usable backup exists.

## Independent/offsite protection

Periodically export an **encrypted** copy of the volume to a separately controlled private storage account, with an independently secured encryption key. Do not put raw archives in the public GitHub repository, Google-indexed URLs, Discord attachments, or ephemeral Railway app storage. The Railway CLI supports browsing and downloading individual volume files (`railway volume files list`, `railway volume files download`). For a complete and consistent backup, prefer a reviewed backup job that captures the entire data tree safely while writes are quiescent and encrypts the archive before leaving the host.

Inventory of what an offsite restore needs: user/account files; session records (treat as secrets); community posts; guild hub; published Wiki data/assets and revision history; Journal articles; administration/theme configuration; chat and moderation files; feedback. It must preserve directory layout. Ensure backups capture any data roots configured **outside** `/data`.

## Recovery drill (no changes to live production)

1. Confirm a recent successful Railway snapshot and keep the existing release SHA and environment-variable configuration documented.
2. Make a new **isolated QA environment/project** with dummy domains and a **separate volume**. Do not attach production's `/data`, and never expose real personal data publicly.
3. Use a **sanitized fixture snapshot** to rehearse restoring the on-disk structure and launching Arcana. Inspect JSON validity and verify basic routes before any production recovery.
4. If validating a real Railway snapshot, remember Railway currently only restores into the **same project and environment**. A production snapshot restore stages a volume replacement and redeployment, which is **not a harmless read-only test**. Do not click Restore/Deploy as a drill against live production.
5. For an actual incident, preserve the existing volume and logs first, select the required snapshot, review Railway's staged mount replacement carefully, and take a clear checkpoint before final deploy. Railway retains the old unmounted volume but may not preserve newer snapshots on the restored replacement.

Recovery should be considered **unverified** until an independently restored, sanitized copy has passed smoke testing. Do not fake a recovery drill using a newly created empty volume.

## Quick production safety checks

- Canonical domain: `https://arcanacompanion.xyz/`
- Health route: `https://arcanacompanion.xyz/health`
- Backup setting: **Railway dashboard → production-hosting service → Backups**, not app health.
- Expected volume mounted: **`/data`** on **Arcana Stable App**.
- Current production commit must be verified again before any deploy.
- No automated write tests, synthetic profiles, or deletion operations on production.
