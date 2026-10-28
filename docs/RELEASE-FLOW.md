# Arcana Release Flow: Test First or Direct Live

> Operational source of truth, October 28, 2026. Changes to this process must be reviewed like code. **No live deployment is complete until Railway shows SUCCESS at the intended full commit and the release verifier passes.**

## Where the site actually runs

| Target | Railway project / service | Repo source | Data |
| --- | --- | --- | --- |
| **LIVE** `https://arcanacompanion.xyz` | `Arcana Clean Staging` / `staging` / `Arcana Stable App` | `fytchx/Arcana` branch `main` | `/data` production volume; never replace |
| **PREVIEW** `https://arcana-preview-app-preview.up.railway.app` | `Arcana Preview` / `preview` / `Arcana Preview App` | feature/preview candidate | separate isolated `/data` volume |

The project label `Clean Staging` is historical. It **is production**. Do not point the live domain to the preview service or mount the production data volume on preview.

## One standard workflow, two destination choices

1. **Always start a fresh, single-purpose feature branch at the current `main`.** Include tests and only the feature requested. Open a PR *to `main`*; check that both `Arcana Checks / source` and `Arcana Checks / mobile` pass. Production `main` remains the sole release branch.
2. **If the owner says TEST FIRST**, connect the *isolated preview service* to the candidate feature branch, preferably pinned to the exact tested 40-character commit SHA. Build preview and verify the exact SHA using `/health` and `scripts/verify-release.mjs`. Perform the visual and functional QA on Android. If the candidate changes, repeat CI and preview validation.
3. **If the owner says STRAIGHT TO LIVE**, skip the preview URL, **not** the tests, code review, backups or health checks. Once CI passes, merge only that feature PR to `main`.
4. **For either approved promotion**, only `main` is connected to the production service. Enable Railway **Wait for CI** on that service so failed GitHub check suites prevent attempted builds. Then read Railway's actual deployment status and commit ID; success is never inferred from GitHub merge alone.
5. **Verify released SHA** from GitHub Actions > `Arcana Verify Released Commit` > Run workflow, with `target` and *exact full commit SHA*. This is a read-only health and public-route check. It intentionally runs only on demand, **after** Railway has deployed, avoiding a Wait for CI deadlock.
6. Record target, SHA, GitHub CI link, preview/live links, Railway deployment ID/status, verification result, any known issues and rollback commit. For visual work, confirm screenshot or real Android behavior. Only then report **LIVE**.

**Do not merge the preview branch itself into `main`.** On October 28, the old `preview/season2-complete-guide-2026-10-27` branch was six commits ahead and fifteen behind `main`, and contained unrelated ML XP experiments. Merging it wholesale could publish unreviewed changes or regress features. Move one tested feature PR at a time.

## One-time owner-side guardrails

**Railway:** `Arcana Clean Staging` > `Arcana Stable App` > Settings > Source (GitHub section) > enable **Wait for CI**. The service is connected to `fytchx/Arcana` / `main`; `checkSuites` was **false** during this audit. Railway documentation: https://docs.railway.com/deployments/github-autodeploys#wait-for-ci . If the toggle is unavailable, verify updated permissions for Railway's GitHub App and that `Arcana Checks` runs on push to `main`.

**GitHub:** repo Settings > Rules > Rulesets (or Branches > branch protection) > protect `main`: require pull requests, require both `Arcana Checks / source` and `Arcana Checks / mobile` passing, prevent force-push/deletion. Ensure ruleset is active and applies to admins if desired. The current connector cannot read or change repository admin settings (403); owner must verify the final state.

**Backup:** user's encrypted `/data` archive was exported and checksum matched outside Railway on October 28. **Decryption, successful restore, and an ongoing offsite schedule remain unverified.** Do not call this disaster recovery complete.

## Release status vocabulary

- **CODE READY** = committed, CI green, not yet deployed.
- **PREVIEW LIVE** = preview Railway deploy SUCCESS at exact SHA, expected features verified; production unchanged.
- **PRODUCTION DEPLOYING** = `main` merged and Railway queued/building/deploying.
- **LIVE VERIFIED** = production Railway deploy SUCCESS at exact SHA, `/health` exact SHA, read-only route and feature smoke checks passed.
- **BLOCKED** = CI failed, deploy failed, mismatch between SHA and site, or functional test failed; keep the previous healthy production version.

## Troubleshooting

| Symptom | Meaning | Next action |
| --- | --- | --- |
| New content in GitHub but not on live site | Commit did not successfully deploy, often because tests failed or Railway has not completed | Compare `main` SHA to Railway deployment SHA and `/health` response; inspect failing job/build log |
| Preview differs from live | Preview is on another branch with unmerged experiments | Never merge the whole preview branch. Test one candidate based on `main` and promote only its PR |
| Railway shows `Deploying` or `Queued` for a long time | Platform incident, approval requirement, or build delay | Check deployment state/incident; do not report success until deployed SHA matches |
| Tests pass but feature wrong on phone | Fixtures missed real UX/data behavior | Fix in feature branch, rerun CI, and test the same candidate SHA again |
| Website broken after release | Application regression | Redeploy/revert known-good **code** version; preserve `/data`, account records, and current uploads. Do not restore old data casually |

### Example: October 28 Season 2 Guide

- `main` commit `db3c46578ec3a0e4bf8a6d920baac9fc01b8de0d` updated the practical-first guide but **failed two GitHub tests**, so Railway's build failed.
- Live Railway continued serving previous successful commit `28fb1e0e99bd8880ee0e2098f931dc0b55a6fc8c`, containing the unlisted damage calculator feature.
- Audit PR #69 fixes the two faulty guide tests (async syntax and outdated chapter count/expectations) and passed CI before release-process changes. Validate new checks before review/merge.
- Only mark the practical-first guide released when the fixed main commit successfully deploys and is verified on the real website.
