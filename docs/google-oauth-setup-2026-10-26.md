# Google sign-in setup for Arcana (2026-10-26)

Google login is implemented as OpenID Connect authorization-code sign-in, but it is **off until properly configured**. Discord login continues to work without changes. **Never copy client secrets into GitHub, docs, chat, or a screenshot**.

## Google Cloud Console

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create/select the Arcana project, configure its Google Auth Platform branding/consent screen and authorized domain. Request only `openid email profile` for identification, **not** Drive permissions or other game/user-data scopes.
2. Create **OAuth Client ID → Web application**. Register the *exact* redirect URIs:
   - Live: `https://arcanacompanion.xyz/api/account/google/callback`
   - Preview: `https://arcana-preview-app-preview.up.railway.app/api/account/google/callback`
3. Ideally use separate OAuth clients for preview and production to avoid cross-environment mistakes.
4. In each Railway service's private Variables tab set `ARCANA_GOOGLE_CLIENT_ID` and `ARCANA_GOOGLE_CLIENT_SECRET`. Check that `ARCANA_AUTH_BASE_URL` exactly matches the environment's canonical HTTPS origin. Don't change existing Discord variables.
5. If Google OAuth consent is still in Testing mode, add designated test users in Google Cloud Console before doing a real sign-in. If external audiences are allowed, finalize Google consent branding and publishing as required by Google.
6. Test new Google account, returning Google account, Discord member → Connect Google, Google member → Connect Discord, provider conflict rejection, beta badge persistence, and creator/admin permissions. Only the configured creator Discord ID may unlock the owner's management portal.
7. Keep both the production `/data` account volume and the isolated preview `/data` volume. **Never copy preview accounts into production.** Independently verify a restorable offsite backup before any account storage migrations.

## Account behavior

- Login options appear on the same `/#/account` page when their provider is configured.
- Provider linking is opt-in from an already authenticated account. The link callback must still carry the initiating account session and the short-lived state cookie. Automatic email-based merging is prohibited.
- Google user `sub` is the only Google account index; email is not used as an ID or persisted. Tokens are verified against Google's public RSA signing keys, the client audience, issuer, expiration, state and nonce, and are not persisted.
- `/api/account/me` exposes `providers.google`, `providers.discord`, and per-member `authProviders` booleans without exposing account-provider identifiers.
- A Google-only account gets standard member capabilities and founding beta eligibility, but never creator status unless its owner **explicitly links** the creator's verified Discord account.
- The login flow requires the owner to configure Google OAuth credentials in their own Cloud Console. ChatGPT cannot manufacture live Google credentials.

## Rollout guardrails

Use the `feature/home-google-signin-2026-10-26` branch and independent Railway preview service for QA. Do not merge to `main` until CI and browser smoke are green and the user approves production release.
