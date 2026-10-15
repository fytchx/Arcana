# Arcana sign-in readiness and safe beta rollout

The Discord sign-in flow already exists in `src/account-server.mjs`. It uses an OAuth authorization code exchange with a state cookie, 14-day HttpOnly sessions, and server-derived roles. Creator status is verified against `ARCANA_CREATOR_DISCORD_ID`; there is no safe client-side creator override.

## Current environment findings (2026-10-15)

* The **Arcana Preview App** service is hosted at `https://arcana-preview-app-preview.up.railway.app`, on an isolated /data volume. It has `ARCANA_AUTH_BASE_URL` but does **not** have `ARCANA_DISCORD_CLIENT_ID`, `ARCANA_DISCORD_CLIENT_SECRET` or `ARCANA_CREATOR_DISCORD_ID`. Accordingly `/api/account/me` will report `enabled: false`.
* The **Arcana Stable App** project that hosts `arcanacompanion.xyz` already lists all three Discord/creator variables. The secrets are not readable through this integration and must **never** be copied into code or messages.

## Configure preview sign-in

1. Open the Discord Developer Portal and choose your Arcana OAuth application. Add **exactly** `https://arcana-preview-app-preview.up.railway.app/api/account/callback` to the application's OAuth2 redirect URIs. Keep the production callback URI as well.
2. In Railway's Arcana Preview project, choose Arcana Preview App > preview > Variables. Set the following **privately in Railway**: `ARCANA_DISCORD_CLIENT_ID`, `ARCANA_DISCORD_CLIENT_SECRET`, `ARCANA_CREATOR_DISCORD_ID`. Do not paste the secret into chat or GitHub. Verify `ARCANA_AUTH_BASE_URL=https://arcana-preview-app-preview.up.railway.app` (no trailing slash).
3. Redeploy and check `/api/account/me` responds with `enabled: true`. Then test login, return, logout, session persistence, a new player card, and creator permissions.
4. Only turn on `ARCANA_BETA_COHORT_OPEN=1` when the cohort is ready. Test a new user receives the Founding Beta Tester role and keeps it once enrollment is turned off.

## Important: preview accounts are isolated

Preview and production use separate data volumes, so preview player accounts cannot be treated as permanent production accounts without an explicit migration. Do **not** advertise preview accounts as permanent. For real community accounts with persistent beta roles, use the stable canonical domain and carefully promote tested code without resetting its volume.

## Open beta release gates

* Run real Android browser smoke testing at 320, 390 and 430px and desktop.
* Test OAuth code/state protection and creator/admin/moderator permissions against real accounts.
* Confirm account and wiki data volumes survive a redeploy.
* Check posting, chat moderation, data backups, image uploads, and safe redirects.
* Confirm return paths and Pathfinder range/material calculations are source-backed.
* Promote after a tagged release and a rollback snapshot. Avoid exposing preview service as production.
