# Arcana · Stabilized recovery source

**Status:** Tested local recovery build. Not deployed to `arcanacompanion.xyz`.

Recovered from the latest successful Arcana V3 Preview Railway Function and its external stylesheet, on 2026-10-12. Unlike the current live gateway architecture, this build keeps the front-end source as actual editable files and does not inject code into JavaScript responses at runtime.

## Start

Requires Node.js 22 or later.

```bash
npm start
# Open http://localhost:3000
```

### Checks

```bash
npm run check
python tests/mobile_smoke.py
```

The first command verifies source structure, all imported modules, Codex category wiring, and the creator signature. The mobile test uses Chromium, an in-memory module loader, and **mocked** API and art responses. It checks the mobile homepage, footer, navigation, 14 Codex category links, category selection, horizontal-scroll persistence, and uncaught JavaScript errors. It does **not** verify the live data backend or actual artwork visibility. Install Python Playwright and a Chromium browser to run it.

## What is included

- Original app's 20 JavaScript modules recovered from Railway, with the previously deployed V3's deterministic modifications incorporated into the source.
- The verified-compatible Wiki category-label edit from the former public gateway.
- The actual 107 KB deployed stylesheet and locally bundled logo and six available skill icons.
- The footer rebuilt inside the application: “Made by Zane”, “Guild leader of PDX & OVK”, “For the IdleArc community”.
- A small standalone Node HTTP server with exact static-file serving, basic health checks, and narrowly scoped API/artwork routes.
- Native Node source checks and an isolated mobile browser test.

## Remaining dependencies

Until a fully self-contained art catalog is imported, the server forwards these paths to **existing** services:

- `/api/search/catalog`, `/api/guilds` to the existing Arcana Guild Directory Beta service.
- `/api/lfg/public` to ArcanaLFG public listings and plans.
- `/codex-art/*` to the current Arcana V3 art endpoints. This is a *temporary dependency*.
- `/official-art/*` to the official artwork CDN hosted from the existing `Arcana-codex-art` repo.
- `/game-assets/*` to the existing legacy Arcana art source.

This is a substantial improvement over rewriting the app on every request, but it is **not yet completely independent** of existing live services. Data volumes for guild listings and design settings are **not** contained in this archive and must not be deleted.

## Production release rule

1. Create a dedicated, writable **private** GitHub repository and commit this source.
2. Deploy a new Railway staging service from that repository, with `npm start`, healthcheck `/health`, Node 22+.
3. Test all real APIs and artwork, all 10 themes, mobile controls, Codex categories, persistent state, calculators, raids, and footer using a real URL. Confirm no blank art, no broken links, and zero newly introduced JavaScript exceptions.
4. Only then point `arcanacompanion.xyz` and `www.arcanacompanion.xyz` to the new service. Keep existing backups and old services for rollback.
5. Never remove the external source services or mounted volumes until their data/assets have been migrated and independently verified.

**Do not call a Railway deployment SUCCESS a completed site verification.** All source changes must be reviewed/tested before promotion.

## Proven issue in the old runtime gateway

Replaying the public gateway's current patch routine against the recovered, running app source produced:

```text
FAIL /src/assets.js     Material name normalizer unavailable
PASS /src/wiki-data.js
FAIL /src/wiki-views.js Record image markers absent
FAIL /src/app.js        Arcana category action marker missing
```

Those failures arose because the gateway expected exact code fragments that no longer existed in the app. This recovery intentionally removes that live patching layer. Do not reinstall it into the new service.

## Recovery archives

Unmodified deployed Railway Function source and rollback IDs are backed up in the private Google Drive folder named `Arcana Source Recovery 2026-10-12`. The original source backup documents include Base64 blocks that were read back and verified identical to the running Function source.
