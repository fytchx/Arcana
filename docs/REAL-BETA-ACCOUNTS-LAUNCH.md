# Arcana: real beta accounts and launch gates

## Real accounts, not test accounts
Player accounts are indexed by verified Discord identity, assigned permanent Arcana UUIDs and saved on the Railway staging volume. Do not reset them on main-domain launch. All beta member contributions, public player cards, cloud builds and Wiki articles must be migrated with the volume or backed-up database.

## Features implemented
- Discord OAuth2 sign-in, only the identify scope.
- Account-owned public player cards, editable details and resized optional avatar.
- Founding Beta Tester role, a server-issued permanent award. Members signing in while ARCANA_BETA_COHORT_OPEN=1 receive betaTesterSince; turning the switch off never removes existing awards or badges. No editor/moderator permissions are granted by this badge.
- Community guide and Build Studio snapshot publishing, author edits, temporary unpublishing and restoring, public attribution, and moderator protection.
- 20 private cloud saves per member, cross-device restore and revision-checked overwrite. Anonymous tools and shareable links remain free.
- Official Wiki is still curated by appointed Wiki Editors/Admins/Creator, not automatically open to all members.
- Staff manage editor/moderator roles. Creator identity is derived only from a configured trusted Discord ID.

## Discord configuration: currently blocking real signup
The Railway staging service does not yet have Discord OAuth credentials or Creator Discord ID. They must be provided via the Discord Developer Portal and Railway staging secret variables (never in chat or GitHub source).

1. Create or select the Arcana application at https://discord.com/developers/applications.
2. Set exact OAuth2 redirect URL:
   https://arcana-stable-app-staging.up.railway.app/api/account/callback
3. In Railway project / Arcana Stable App / staging Variables, set:
   ARCANA_DISCORD_CLIENT_ID = Discord application ID
   ARCANA_DISCORD_CLIENT_SECRET = Discord secret
   ARCANA_AUTH_BASE_URL = https://arcana-stable-app-staging.up.railway.app
   ARCANA_CREATOR_DISCORD_ID = real Creator Discord numeric ID.
4. Already prepared for staging: ARCANA_ACCOUNT_DATA_DIR=/data/accounts, ARCANA_BETA_COHORT_OPEN=1, ARCANA_WIKI_DATA_DIR=/data and existing persistent volume.
5. Before inviting members, log in on physical Android, refresh, log out/in, verify Founder badge and Creator access, update a profile, publish/edit/archive a guide, save and restore an account build, grant editor/moderator roles and verify ordinary members cannot publish official Wiki.

Do not mark signup enabled or send account-beta invitations before a real successful OAuth callback.

## Persistence, security, rollback
The attached Railway volume is mounted at /data:
- Wiki official articles: /data
- Member identities, sessions, public profile avatar: /data/accounts
- Private cloud saves: /data/accounts/builds
- Member contributions, moderation history: /data/accounts/community
- Anonymous beta reports: /data/beta-feedback

Do not delete, detach, reset or replace the mounted volume, even while rolling back code. Do not run multiple Railway replicas against these JSON files. Create and verify a restorable offsite backup before inviting real member accounts; source control and same-volume snapshots are not backups. Move to a backed-up multi-writer database before broad growth.

For eventual main-domain switch, ideally use this exact service with its existing volume. Update the origin, configure a matching Discord OAuth redirect, and allow users to sign in again because host-only session cookies cannot travel between hostnames. Account IDs, profiles, badges and content remain intact. If instead deploying another service, migrate and verify all data directories before switching traffic.

At the end of beta, change ARCANA_BETA_COHORT_OPEN to 0. That stops new Founder awards; existing ones persist permanently.

## Remaining work before a general public account launch
- Configure and physically test real Discord OAuth and Creator identity.
- Confirm restorable offsite backup and recovery.
- Review role grants, public posting, moderation, account data deletion and privacy documentation.
- ArcanaLFG is hosted separately and does not yet share Arcana's account session; do not advertise account-only posting there.
- Wiki XML content still needs review and real Fandom media matching, and some calculators have limited validated coverage.
- Source and mocked-browser tests are automated but cannot replace first-person physical Android beta acceptance.

## Beta invitation copy (send only after sign-in + backup checks)
We're inviting IdleArc players to join the Arcana beta. Accounts are real and your player card, saved builds and contributions will carry through full launch. Everyone who joins during Founding Beta Tester enrollment receives a permanent badge. You can use the Wiki, Labs and calculators, save builds to your account, publish community guides and builds, and report problems through Beta & Feedback. Official Wiki editing is available to approved editors. Help us identify inaccurate data, broken buttons, missing art and confusing screens.
