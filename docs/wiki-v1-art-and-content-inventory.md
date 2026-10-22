# ArcanaWiki V1 publishing inventory and Item Codex art audit

Version: 2026-10-15. Baseline: verified October 9 Season 2 equipment snapshot and pinned local artwork manifest.

## Approved taxonomy

8 primary Wiki categories, 30 proposed page IDs. 10 IDs were already source-controlled Wiki articles. Five concise class overview articles are also now sourced from verified class branches, bringing the initial public article count to 15. The remaining 15 pages are registered in `src/wiki-taxonomy.js` but are **not** served as article links until they have real content. The existing `guide-builds` instructional demonstration stays reachable through Guides, outside the 30 mechanics/article page list.

Each article has one primary parent in the taxonomy. Legacy article routes `#/wiki/article?id=...` and old topic URLs remain usable. `Home › ArcanaWiki › <Category> › <Article>` is the canonical location, while the Back button follows actual browser history and falls back to its parent on direct entry.

## Equipment artwork

Only equipment cards use illustrative artwork. Other verified records remain available as compact text results, not duplicate picture galleries.

The pinned official artwork inventory contains:
- 19 official artwork groups.
- 12 items in the dedicated Season 2 `items` atlas.
- 218 mapping entries in the base `equipment` atlas (some are rarity versions of the same item).
- 40 base items in the verified equipment snapshot.

All **12 newly added Season 2 equipment bases** in the verified snapshot have a uniquely matching dedicated item sprite in the official manifest: Wardplate, Bloodweave Vest, Harmonic Cuirass, Visionary Hood, Beast Crown, Sage Diadem, Slayer Gauntlets, Berserker Grips, Symbiotic Handwraps, Swiftstride Boots, Grounded Treads and Pathfinder Treads.

The asset resolver already handles 11 possessive-name aliases (e.g. Warrior's Ring → the original `warrior-ring` key) without guessing their numbered rarity variants.

These **6 older/general equipment bases** have no safely verified unique icon in the local official manifest and remain honestly marked as awaiting artwork:
- Sandals of Starszy
- Quiver
- Rusty Dagger
- Greatsword
- Grand Staff
- Claws

Do not substitute a visually similar but different named tier (such as Broken Grand Staff for Grand Staff). Any additional asset mappings should come from a verified original item image / approved archive. Keep the original asset sheets intact and update only explicit names after verification.

## Rollback and data

The initial version is code-only and does not mutate the production Railway `/data` Wiki volume. Restore the code from `arcana-wiki-prelaunch-checkpoint-2026-10-15` or revert the Wiki release commit. A code rollback does not revert published content stored on the persistent volume; export it independently before later bulk content changes.
