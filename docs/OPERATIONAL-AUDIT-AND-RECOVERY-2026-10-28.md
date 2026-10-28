# Arcana operational audit and continuity runbook
**Audit date:** 2026-10-28  
**Status:** Preliminary read-only infrastructure audit; CI test repairs proposed separately in this branch. **Do not consider backup or restore verified.**

## Canonical architecture (verified in Railway and GitHub)
- Live domain: `https://arcanacompanion.xyz` and `www`.
- Canonical source: `fytchx/Arcana`, `main`.
- Actual live Railway service: project **Arcana Clean Staging**, environment **staging**, service **Arcana Stable App**. The historical names do *not* imply this is disposable staging.
- Main production persistent volume: **arcana-wiki-articles**, mounted at **`/data`**, 500 MB provisioned. Service configuration uses `ARCANA_ACCOUNT_DATA_DIR` and `ARCANA_WIKI_DATA_DIR` variables. Do not change the mount path.
- Actual isolated preview: **Arcana Preview** > **preview** > **Arcana Preview App** at `arcana-preview-app-preview.up.railway.app`; separate **Arcana Preview Data (isolated)** volume.
- Other Railway projects host external art, historical functions, directory/listing utilities, and legacy gateways. Even when apparently redundant, their necessity has NOT been established. Do not delete or consolidate before mapping live requests, dependent URLs, and volumes.

## Audit evidence and initial risk register
| Priority | Item | Evidence | Status / next action |
| --- | --- | --- | --- |
| P0 | Restorable offsite user-data copy not verified | Production account/wiki state lives on attached `/data` volume; Git history does not contain user data; no backup operation proved | Enable snapshot schedule, export safely offsite, and perform an isolated restore drill |
| P1 | Deployments can start with failing GitHub checks | Railway source config has `checkSuites: false`. `main` SHA `db3c465` failed Arcana Checks while Railway deployment queued | Require successful CI before production release; tighten ruleset/approval and check-suite behavior |
| P1 | Pending/failed production deploys | At audit: two recent production deployments QUEUED and three failed on Oct 27; prior successful `b0aeda7` | Inspect actual latest settled version; follow build logs; do not claim new guide is live until release succeeds |
| P1 | Legacy code and data dependencies | README documents proxy dependencies for catalog, guilds, LFG, artwork; multiple Railway Functions are not connected to `main` | Build dependency map and migrate carefully |
| P2 | Old workflow triggers | `staging-smoke.yml`, `live-release-smoke.yml`, `journal-release.yml` use dated feature/release branches | Rationalize branches and workflows once canonical preview/release paths are proven |
| P2 | Unclear account/auth verification | Main service contains Discord client credentials *names*; Google credentials listed on preview; real-provider sign-in not end-to-end audited | Verify sign-in, session, role boundaries and login redirects on the actual domain; never expose secrets |
| P2 | Existing docs disagree with current rollout | Multiple older docs describe prelaunch staging and incomplete OAuth | Label historical docs; make this runbook the operational source of truth |
| P2 | Branch and project proliferation | GitHub shows many archival feature/checkpoint branches; Railway lists multiple Arcana project generations | Audit reference usage and billing; archive only after safe export and owner approval |

**Traffic observation:** Railway's production service reported 12,291 HTTP requests with 0 5xx and 88 4xx during the sampled 24h. Typical response time was low. This **does not** prove visual, login, or business-logic correctness.

**Build observation:** On `db3c465` GitHub Actions source job failed (417 passed / 2 failed). `tests/season2-practical-entry.test.mjs` used `await` inside a non-async test. `tests/guide-chapter-navigator.test.mjs` still expected 36 guide sections and disallowed the new practical jump; the source now has 37 sections. Repairs are on this audit branch; GitHub Arcana Checks (source and mobile) passed for PR #69 SHA `057aab6` on 2026-10-28. The PR is still draft and has not been merged. Live deployment status must be checked again before promotion.

## Backup and recovery procedure
The repository, Railway snapshots, and an independently stored **offsite data export** serve different purposes. GitHub is **only code/config version control**. Railway backups are snapshots tied to the **same Railway project and environment**, according to Railway docs. They are not a complete Railway-exit plan.

### A. Immediate, lowest-risk protection (owner: Railway dashboard)
1. Open Railway > **Arcana Clean Staging** > **staging** > **Arcana Stable App** > **Backups**.
2. Verify a backup schedule is enabled on the **existing** production `/data` volume. Prefer Daily plus Weekly and a manual baseline. Review cost/limits in Railway before enabling.
3. Record the most recent successful backup timestamp and **confirm restoration procedure using an isolated/non-production copy**. Never overwrite the production volume to rehearse a restore.
4. Repeat later for the separate preview and any confirmed active volume-backed directory/design services.
5. Do not delete or detach production volumes; do not wipe volumes (this also deletes their Railway backups).

Railway backup reference: https://docs.railway.com/volumes/backups

### B. Independent offsite copy (required before host migration)
1. Export all needed `/data` content, including `accounts/`, account builds/community, wiki article JSON/images/history, and beta feedback, using Railway's **volume browser** or an authenticated Railway CLI. Sample commands *after selecting the correct project/service/environment*: `railway volume browse /` and `railway volume files list /`. Railway supports `railway volume files download <remote> <local>`.
2. Store an encrypted archive in a separate location controlled by the owner, e.g., private Drive plus another independent storage. **Never** put sessions, profile data, auth tokens, key material, or private user data into the public GitHub repo or a public link.
3. Create and retain a manifest with UTC timestamp, file counts, aggregate hashes, and required app commit. Preserve file ownership and paths.
4. Verify restore **to a separate disposable service and volume**, including account identity, Wiki articles/images, and cloud builds; avoid invoking real OAuth writes in the drill.
5. Document how application and secrets are restored separately. OAuth secrets must be re-entered only into secure provider/Railway settings, never into source files, messages, or backup docs.
6. Repeat exports on a predictable schedule. A backup that has never been restored is only a hopeful collection of bytes.

Railway volume management: https://docs.railway.com/volumes  
Railway SSH/SFTP copy: https://docs.railway.com/cli/ssh

### C. If Railway goes away
1. Export **code** at a known tagged passing commit; export **data** and dependencies separately as above.
2. Choose a Node.js 22+ hosting platform supporting a persistent data disk or migrate JSON data to a managed database/object store. Avoid hosts with ephemeral local file storage unless replacing persistence properly.
3. Configure `npm start`, `/health`, service port, and **private** environment variables; attach persistent `/data`, not a fresh empty directory.
4. Start on a temporary domain. Test login redirects/cookies, public Wiki, private saves, artwork proxy dependencies, user guides, and mobile navigation.
5. Change Discord/Google OAuth redirect URIs and app base URL to the new domain **before** sending traffic; update DNS only after tests pass. Keep the old service intact for rollback and account reconciliation. Never run two independent writable stores for the same live accounts.
6. Verify backup and rollback on the new host, then monitor errors and browser behavior.

## Proposed release workflow (not yet enforced)
1. Create a small feature branch from latest green `main`; avoid work on a stale unmerged branch.
2. Make one coherent change, with Node tests and mobile browser checks; open PR.
3. Require `Arcana Checks / source` and `Arcana Checks / mobile` to pass, with approved review. Do not merge failing changes, even if Railway can deploy them.
4. Deploy **preview** from the candidate commit (not an unrelated old feature branch). Verify deployment SHA, `/health`, artwork, scripts, login, tools and Android.
5. After a recent verified data backup, merge to `main` and have Railway deploy **only** after the approved green check. Confirm Railway status `SUCCESS` and commit SHA; run read-only live smoke; monitor 5xx, latency and visual regressions.
6. Tag known-good production SHA and record deployment ID, changelog and backup timestamp.
7. For a broken release, use a known-good **code** deployment/revert, and leave the persistent volume untouched. Do not overwrite active accounts with an old snapshot unless data restore is explicitly warranted and reconciled.

## Test matrix for full signoff
- Guest home, mobile/desktop nav, layered overlays, page scroll lock, PWA icon, all themes and texture editor.
- Pathfinder: base/average/max materials, pity and refunds, 1–X quantity, biome ordering, gold at bottom. Compare with in-game sources.
- Damage formula calculator: direct unlisted URL, no public nav, three modes, shorthand large numbers, storage/clear and outcome validation.
- Upgrade optimizer, pet compound, affix calculator, rune/grid/tree tools, Guild and Build Studio; blank-start and saved-load fidelity.
- Wiki/Journal: chapter navigator overlay, practical-first entry, internal links, accessibility/focus, contributor attribution, article publish/revise, image paths.
- Real Discord/Google login on allowed callbacks, session expiry, guest access restrictions, creator/admin/editor authorization, private cloud save.
- Search/SEO: sitemap/robots, route discovery, canonical redirects, link availability.
- Production health, deployment/version consistency, and external service dependency checks.

## Owner actions and blockers
- **Required now:** In the Railway dashboard, inspect **Backups** for the production Arcana Stable App volume and report whether Daily/Weekly snapshots and manual baseline are enabled. Do not send credentials.
- **Required after CI repair:** In GitHub Settings > Rules (or branch protection), require successful PR checks before merging to `main`. GitHub connector cannot verify existing branch-protection state (403).
- **Required before migration:** Verify ownership/access to domain registrar, Railway, GitHub and provider OAuth apps; document renewal date and secure recovery options privately.
- **Required for acceptance:** Android smoke of login, account saves, Wiki publish, Pathfinder, chapter selector, damage URL; send concrete failures/screenshots.
- **Owner approval only:** any deletions, expensive backup plan changes, production routing/DNS changes, secret rotation, or volume restore.

## Current audit limits
- No restore test has been performed. Railway connector cannot inspect all snapshot settings or export volume contents itself.
- Public web inspection could not load the domain from this runtime; infrastructure-level HTTP data is from Railway, not a real browser visual pass.
- No secrets are included in this runbook. Service variable **names** alone do not establish functional OAuth.
- Full source lint/security and functional QA across every interactive route is still pending; this runbook documents evidence and next actions rather than falsely marking the audit complete.


## Full Railway project cleanup inventory (rechecked 2026-10-28)
One Railway workspace contains multiple distinct historical deployments; project names and descriptions are **not authoritative**. A successful historical deployment is not proof that a service is depended upon today. Source-proxy references and custom domains must be verified before deletion.

| Project | Environment inventory | Disposition |
| --- | --- | --- |
| Arcana Clean Staging | 1 production-domain app, 500 MB data volume | **PROTECT:** actual public Arcana home |
| Arcana Preview | 3 services, 512 MB isolated preview data volume | **PROTECT** for testing; reduce redundant preview services later |
| ArcanaLFG | 1 live service, 100 MB listings volume | **PROTECT** external LFG dependency |
| Arcana Volume Production | 12 services, 3 data volumes (assets 100 MB, design 100 MB, guild listings 500 MB) | **INVESTIGATE** service-by-service; main app still references catalog/art |
| Arcana V3 Production | 5 live/stale service resources, including art services | **INVESTIGATE** referenced art endpoints |
| Arcana Restore | 6 historical recovered functions | **INVESTIGATE** before retirement |
| Arcana (project 871fd2b7...) | 0 services, but **ArcanaAssets** bucket in sjc | **DO NOT DELETE** until bucket contents, uses and backup verified |
| Arcana Final | 0 live services, volumes or buckets | cleanup candidate |
| Arcana Production v2 | 0 live services, volumes or buckets | cleanup candidate |
| Arcana Stable | 0 live services, volumes or buckets | cleanup candidate |
| Arcana Production (project 1a0055b5...) | 0 live services, volumes or buckets | cleanup candidate |
| Arcana Production (project 16c25d1b...) | 0 live services, volumes or buckets | cleanup candidate |
| Arcana (project 0fa228b3...) | 0 live services, volumes or buckets | cleanup candidate |
| IdleArc Companion | 0 live services, volumes or buckets | cleanup candidate |
| IdleArc Discord Bot, community proposal, two idle game prototypes, abundant-freedom | Unrelated or separate projects; some have staged or historic resources | **OUTSIDE this Arcana cleanup**, preserve until separately reviewed |

**Connector discrepancy caution:** `list_services` can include historical or staged service definitions not present in `describe_environment` live resource inventory (e.g. Arcana Stable and Arcana Production v2). Confirm in dashboard and reconcile historical metadata before deleting a project, even if its live environment appears empty.

**Runtime status update:** At later inspection on Oct 28, the production service was ONLINE with one running replica. The previously queued unlisted damage calculator commit `28fb1e0` became the active successful deployment. The newer practical-first guide commit `db3c465` failed its build tests and did **not** become live. Recent 1-hour Railway HTTP metrics showed 404 total requests, 0 server 5xx. Prior successful code remains active, so this is a release failure, not a confirmed public outage.

**Next:** Resolve failing main CI by reviewing/publishing PR #69 only after backups and release safety gates. Run external dependency and bucket usage checks. Inventory unused domain routes, backups, and exact billing before proposing reversible shutdowns. Do not delete any resources as part of the audit.

## Railway backup gating confirmed by owner screenshot (2026-10-28)
The production **Arcana Stable App > Backups** view explicitly says **No Backups** and `Upgrade to Pro to create new backups, set up automated schedules, or enable point-in-time recovery`. This overrides earlier advice to enable Daily/Weekly snapshots from the current plan: those actions are **not available on this workspace plan**. Do not buy Pro solely to obtain backups.

**Preferred low-cost, phone-friendly fallback:** Railway announced that its Console tab and in-dashboard service file browser became generally available in June 2026, even without the Priority Boarding feature flag. Open the actual production service and swipe the horizontal tab row to **Console** (if available on the account). Look for read-only navigation to `/data`, then confirm the persistent folders. Source: https://railway.com/changelog/2026-06-05-sandboxes

Once available, use a shell to create **an encrypted archive written outside `/data`**, for example `/tmp`, using tools verified present (`tar` and `openssl`). Password must be chosen by the owner, retained securely, and **never sent in chat**. A typical shell pipeline (only after checking command availability and confirming paths) is:

```bash
command -v tar && command -v openssl
tar -C /data -czf - . | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -out /tmp/arcana-private-backup.tar.gz.enc
```

Download the encrypted file via **Console > file browser** (from `/tmp`). Copy the file to an owner-controlled offsite location (private cloud and second copy), record the decryption passphrase in an independent password manager or safely stored record, and test decryption/extraction to a **temporary directory on another machine/service**, never directly over the live volume. Note that creating a live file archive without pausing writes is not a point-in-time consistent snapshot; verify relevant JSON references and repeat during a quiet window if needed. Check that the live service stays responsive, and never expose `/data` through public web routes.

**Alternative CLI path:** Railway supports recursive `railway volume files --volume <volume-name> download / <local-destination>` directly from its CLI, documented at https://docs.railway.com/cli/volume . That is a readable file transfer, *not* intrinsically encrypted: protect local copies and encrypt before storing them in the cloud. The CLI requires proper account authentication, and Android Termux compatibility has not been verified. Do not guess that Railway's AI connector can download volume contents; it cannot do so with its available calls.

**Platform banner:** User screenshot also reports Railway incident **Deployments stuck in initializing**, attributed by Railway to its platform. Separately, the newest Season 2 practical-first commit failed our source tests. Those are different diagnoses. Latest checked production state was ONLINE with 1/1 replica, previous successful damage-calculator commit `28fb1e0`, and no 5xx in the sampled last hour. Do not assume the application is down solely due to the incident banner.

