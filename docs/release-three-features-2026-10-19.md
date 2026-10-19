# Arcana Production Release: Three Approved Features

Production baseline: c8aa0f82e0663b06e609ecc5f54c2b0edb554626. Preview-verified source: 6a4015add53f2ab114add6fbb378c97cbf00ad2b.

In scope: BruTo's permissioned Season 2 progression guide, Pathfinder quantity and biome-order integration, and Signature Collection / seamless texture engine. Keep full existing theme customizer, current LFG and site content.

Out of scope: new Guild Hub registration and moderator approval, and crest builder. These remain in isolated preview until authenticated security and moderation tests pass.

Operational: retain production /data volume (accounts, wiki, content), Discord OAuth secrets, custom domain and service/environment. No account/data migrations. Keep code rollback ref anchored to c8aa0f82e0663b06e609ecc5f54c2b0edb554626. A separate volume-level backup is advisable before any later migrations. Do not globally change the currently published theme.
