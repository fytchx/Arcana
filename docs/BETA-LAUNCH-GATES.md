# Arcana Beta Release Gates

Target: https://arcana-stable-app-staging.up.railway.app/
Production: https://arcanacompanion.xyz/ — do not switch yet.

## Available to guest testers
- Codex, art atlas, Wiki reference pages, calculators, Rune Forge, skill tree, Guild Skill Tree, Build Studio and locally saved plans.
- New Build Studio accounts start with **empty gear**, not a demonstration loadout.
- Build Studio share links carry the build inside a bounded compressed URL. Guests can open a read-only shared build and copy it into their own local workspaces without an account.
- Public LFG and guild directories can be browsed as long as their independent services are online.
- Beta Center is open to everyone. Submissions persist on the staging volume, and only staff can read and triage submissions.

## Not ready for general availability
- **Discord account sign-in is not configured.** Profiles, account-only community publishing, and role changes cannot be advertised as working until real authentication is configured and tested.
- Guild and raid posting still belongs to separate services; Arcana has not enforced member-only posting on ArcanaLFG.
- Upgrade Cost Calculator is a partial verified tier-change reference, not the complete Awakened / expected-materials tool. Other calculators use published configuration snapshots that can become outdated.
- Fandom XML imports are drafts for manual review, not a verified current Wiki. The full page/art migration is not completed.
- Browser drafts are local. They do not automatically sync across devices.
- Feedback currently accepts text and an optional reply email, not screenshots. Users should never send secrets.

## Go / No-Go gates
- [x] New source is in an isolated feature branch; production services and domain untouched.
- [x] Guest issue submission, rate limits, origin restriction, persistent feedback, protected inbox and status management added.
- [x] Blank-build onboarding and anonymous build sharing added.
- [x] Official art, Codex and existing tools preserved; old demonstration guide removed from the primary home and Wiki spotlight.
- [x] Node source tests and mocked Chromium mobile regression run on each pull request.
- [ ] **Live staging browser/HTTP gate passes**, including real artwork, real catalog, beta feedback endpoint, no guest access to staff inbox.
- [ ] Physical Android QA: open site, navigate every major section, save/reload personal build, share/read-only/clone build, submit actual feedback, review staff inbox, reload.
- [ ] Test browser back/forward, Codex rail scrolling, small-screen overflow and broken image fallback.
- [ ] Verify backing volume survives a deployment and create a restorable offsite snapshot.
- [ ] Review representative gameplay pages against the latest game rules and fix known broken information.
- [ ] Resolve all P0/P1 issues (data loss, security, site unavailable, broken core tool, lost guest share, nonworking feedback).
- [ ] Decide guest-only vs account-enabled beta. OAuth requires credentials, exact staging callback, verified Creator identity and end-to-end Android tests before enabling.

## Rollout phases

1. Owner QA on staging using real Android and desktop, with real HTTP—not only fixture tests.
2. A small guest-first beta invitation on the staging URL, clearly labeling unconfigured account features. Ask testers to submit specific real-world problems through Beta Center.
3. Prioritize P0/P1 reports before adding more features; after fixing, broaden invites.
4. Main-domain cutover is a **separate explicit release**, after backups, rollback rehearsal, security review, and role/login validation.

## Triage and rollback

Staff inbox route: #/beta/reports. Protected by staff account or private transitional owner key; never post the owner key publicly.

Issue severity: P0 data loss/privacy/security or total outage; P1 major core workflow fails; P2 incorrect art/data/navigation with workaround; P3 cosmetic polish.

To roll back, revert only the application deployment/commit. **Never delete or overwrite the mounted wiki/accounts/feedback volume** as a shortcut. Source Git history does not back up member-created content.

## Short invite draft

We're inviting a small number of testers to try Arcana's separate beta site. The Codex, guides, calculators, and build planners are open without an account. You can share your build with a link, and use the built-in Beta & Feedback page if anything breaks or feels confusing. Account registration and some community features are still being prepared, so this is a guest-first beta. Tell us what goes wrong in real use; that's how we'll decide what to fix next.
