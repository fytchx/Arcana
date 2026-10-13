# Arcana membership, profiles and publishing policy
Design and staging implementation baseline, October 12, 2026.

## Product principle
Arcana is usable without an account. Guests can inspect the entire public site, use every calculator and planner, save their local build, and share planner URLs. Accounts are for public identity, persistent contributions and moderated collaboration, not a paywall.

## Access rules
| Actor | May do |
| --- | --- |
| Guest | All public reading, tools, calculators and planner-link sharing |
| Arcana Member | Guest abilities plus public player card and community guide/build posting. Raid and guild posting belongs here once ArcanaLFG identity is migrated. |
| Arcana Wiki Editor | Member abilities plus publishing and revising official ArcanaWiki articles |
| Moderator | Member abilities plus hide/unhide community content and future listing/report moderation, no permanent delete |
| Admin | Moderation, permanent delete, managing Wiki Editor/Moderator grants |
| Developer | Contributor badge; access to GitHub/Railway is managed independently, not automatically content admin |
| Creator | Exclusive owner status derived from a configured trusted Discord user ID, full administrative capabilities |

Roles stack. Every account is a member. Only the Creator can promote to Admin or Developer, and no account can set its own privileges. Moderators cannot permanently delete content.

## Distinct content surfaces
- **ArcanaWiki** is curated game documentation, editable only by approved wiki editors, admins, and the Creator.
- **Player Community** contains member-authored builds and guides. They carry public authorship and can be hidden by moderators; only admins and the Creator can delete.
- **Build Studio** continues to work locally without signing in. Sharing its guest planner links is unrelated to publishing a community build.
- **ArcanaLFG** is unchanged in this release. Account-required posting must be integrated with its separate data and infrastructure in a later migration, without losing existing listings.

## Player cards
Self-selected display name, in-game character, guild, favorite class/build, short description, availability for daily raid teams, and guild recruitment information. The user chooses what to disclose; all saved profile fields are public. Roles appear as server-authenticated badges. Guild membership and class preferences are self-reported, not verified.

## Initial authentication
The code supports Discord OAuth2 authorization-code sign-in with `identify` scope, the smallest scope necessary for basic identity. Arcana does not store passwords or Discord access tokens. Browser sessions use random opaque tokens stored as hashes in private server files and HTTPS HttpOnly SameSite=Lax host-only cookies. OAuth state checks block login CSRF. State-changing session endpoints require a same-origin request. Client UI checks do not substitute for server permission checks.

To enable sign-in in **staging**, configure these Railway variables out of GitHub:
- `ARCANA_DISCORD_CLIENT_ID`
- `ARCANA_DISCORD_CLIENT_SECRET`
- `ARCANA_AUTH_BASE_URL`, the exact HTTPS staging origin
- `ARCANA_CREATOR_DISCORD_ID`, the Creator's correct Discord user ID
- `ARCANA_ACCOUNT_DATA_DIR`, optional; defaults to `<ARCANA_WIKI_DATA_DIR>/accounts`

Register the exact `/api/account/callback` redirect URI in the Discord Developer Portal. No sign-in is available until credentials and the redirect are configured. For future cross-subdomain login, use a central identity service or reviewed SSO architecture rather than assuming staging cookies work on production and LFG.

## Storage and release safety
Profiles, sessions and member contributions are separate from wiki JSON files, under the account data directory on the existing mounted Railway volume. The local JSON store and serialized writes are suited to a single staging replica and early validation, **not multi-replica production**. Move identity and content to a properly backed-up database before larger public deployment. Back up the live volume separately. The source repository is not a backup for user-created account data.

The old Wiki owner key remains a temporary migration fallback. Rotate or disable it after the Creator account has been verified and Editor roles work across reloads and sessions.

## Follow-up work before a public account launch
- Configure real OAuth and test Android login, logout, cookie privacy and session expiry.
- Test Editor publication, moderation and role grants end to end against the staging volume.
- Add member post revision/editor UI, report queues, moderation history and anti-spam controls.
- Move account/profile/community records to a backed-up production database.
- Connect the same identity to ArcanaLFG posting **later**, without changing existing raid/guild listings prematurely.
- Consider cross-device saved builds, showcase pins and favorites as reasons to sign up. Do not restrict anonymous tools.
