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

## Railway plan limitation (confirmed by owner, October 20, 2026)

The **Arcana Stable App → Backups** screen currently says **“No Backups”** and **“Upgrade to Pro to create new backups, set up automated schedules, or enable point-in-time recovery.”**

**Arcana does not currently have a verified Railway snapshot or automatic backup.** The data volume is persistent but this does NOT provide recovery from accidental deletion or corruption. On this account's current plan, do not instruct the owner to use a nonexistent **Create backup** or **Edit schedule** control, and do not claim anything was backed up.

Upgrading to Pro is optional; the plan-independent alternative below lets the owner download an independent copy. Treat that downloaded copy as a **point-in-time file export**, not a transactionally consistent platform snapshot.

## Practical no-Pro option: download the production volume with the Railway CLI

Railway's published CLI reference documents downloading **entire directories**, not just individual files:
https://docs.railway.com/cli/volume

This is a *read-only download* from Railway. Run these commands on a trusted private computer with sufficient disk space, **not** inside the production container and **not** inside a public CI job:

```bash
npm install -g @railway/cli
railway login
railway link
# Select the project "Arcana Clean Staging", environment "staging",
# and service "Arcana Stable App" (the LIVE production service).
railway volume files --volume arcana-wiki-articles list /
railway volume files --volume arcana-wiki-articles download / ./arcana-private-backup
```

1. Ensure the volume shown is **arcana-wiki-articles** (ID `1805cf76-59b4-4d3e-9249-eb53fe5af438`, mount `/data`); never select the preview volume.
2. Inspect the downloaded folder locally and verify its expected directories and file counts. Source volume usage was roughly **51 MB** when last measured.
3. **Check the actual values** of `ARCANA_WIKI_DATA_DIR` and `ARCANA_ACCOUNT_DATA_DIR` in Railway's Variables screen **privately**, without posting screenshots containing secrets. Both variable names are confirmed configured, but the connector does not reveal their values. Also check any traffic/feedback override variables. If any data roots resolve **outside `/data`**, the volume copy alone is incomplete.
4. Data files may change while a directory download is in progress. A successful CLI exit does **not** guarantee a fully consistent multi-file snapshot. For a higher-assurance backup, coordinate a short application write-free window or implement a reviewed consistent export mechanism.
5. Immediately **encrypt the downloaded directory or archive** using reputable local backup/encryption software. Store the encrypted archive somewhere private **outside Railway**, with a separately secured recovery key. Remove any unencrypted temporary copies once the encrypted copy is verified.
6. Test that the encrypted archive can be decrypted and the expected files are present, then periodically repeat the export. Never upload raw account/session JSON to the GitHub repo, Discord, or a publicly accessible URL.

The Railway CLI also supports `railway volume browse /`, an interactive browser with download controls. That is an alternative for owners uncomfortable with command-line directory transfers.

### If Pro is enabled in the future

On the *correct* production service's Backups tab, enable Daily (6-day retention), Weekly (27-day retention), and Monthly (89-day retention) if desired, and verify a manual backup. Railway's backups can be restored only within their project/environment, so retain independently encrypted offsite copies regardless of plan.

## Read-only integrity inspection

Run when connected to a trusted shell that has the application environment variables and mounted volume:

```bash
npm run data:audit
```

This does **not** copy, alter, or delete files. It recursively checks readable JSON syntax and summarizes aggregate file counts/bytes for each configured storage root. It exits nonzero on missing/unreadable directories, malformed JSON, symlinks, or uninspectably large JSON files. It intentionally does not print account IDs, filenames, message contents, or secrets.

A clean check proves only that the inspected files were parseable and accessible. It does **not** prove that every transaction is consistent, that the data is complete, or that a usable backup exists.

## Independent/offsite protection

Periodically export an **encrypted** copy of the volume to a separately controlled private storage account, with an independently secured encryption key. The instructions above provide a Railway CLI directory-export path without Pro. Do not put raw archives in the public GitHub repository, Google-indexed URLs, Discord attachments, or ephemeral Railway app storage. The Railway CLI supports browsing and recursively downloading directories (`railway volume files list`, `railway volume files download`). For a complete and consistent backup, prefer a reviewed backup job that captures the entire data tree safely while writes are quiescent and encrypts the archive before leaving the host.

Inventory of what an offsite restore needs: user/account files; session records (treat as secrets); community posts; guild hub; published Wiki data/assets and revision history; Journal articles; administration/theme configuration; chat and moderation files; feedback. It must preserve directory layout. Ensure backups capture any data roots configured **outside** `/data`.

## Recovery drill (no changes to live production)

1. Confirm a recent, independently encrypted volume export (or Railway snapshot if Pro has been enabled). Keep its timestamp, the existing release SHA, and environment-variable configuration documented.
2. Make a new **isolated QA environment/project** with dummy domains and a **separate volume**. Do not attach production's `/data`, and never expose real personal data publicly.
3. Use a **sanitized fixture snapshot** to rehearse restoring the on-disk structure and launching Arcana. Inspect JSON validity and verify basic routes before any production recovery.
4. If Pro was later enabled and you are validating a real Railway snapshot, remember Railway currently only restores into the **same project and environment**. A production snapshot restore stages a volume replacement and redeployment, which is **not a harmless read-only test**. Do not click Restore/Deploy as a drill against live production.
5. For an actual incident, preserve the existing volume and logs first. If recovering from the independent encrypted export, restore files only to a **separate recovery volume** after reviewing and testing the procedure. If recovering from a Railway Pro snapshot, review the staged mount replacement carefully before deploy; Railway retains the old unmounted volume but may not preserve newer snapshots on the restored replacement.

Recovery should be considered **unverified** until an independently restored, sanitized copy has passed smoke testing. Do not fake a recovery drill using a newly created empty volume.

## Quick production safety checks

- Canonical domain: `https://arcanacompanion.xyz/`
- Health route: `https://arcanacompanion.xyz/health`
- Current backup state: **no Railway volume backups on the current plan**. Verify independent encrypted export or a later Pro snapshot before claiming recoverability.
- Expected volume mounted: **`/data`** on **Arcana Stable App**.
- Current production commit must be verified again before any deploy.
- No automated write tests, synthetic profiles, or deletion operations on production.
