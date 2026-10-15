# ArcanaWiki V1 change plan

Current published code checkpoint: a5c5c0bfe9f5b7c864cfb4a1ca17c6abd4464ea0
Checkpoint branch: arcana-wiki-prelaunch-checkpoint-2026-10-15
Planning branch: wiki/wiki-structure-v1-workspace-2026-10-15
Public domain: arcanacompanion.xyz

Wait for the reviewed Wiki category/article tree before publishing any new content.

Use one versioned hierarchy registry for all primary page/parent relationships. Render breadcrumbs from that registry. Keep the Back action based on navigation history. Only list pages containing approved content and preserve existing links.

First release is navigation and categories only and should be committed as a clearly identified changeset, with existing articles and user data left untouched. Reverting that changeset restores the earlier navigation.

The Wiki's currently published JSON articles are on a persistent data volume. Reverting a source release does not undo article edits stored on that volume. Take and verify an independent article backup before republishing any of those articles. Drafts can be exported from Wiki Studio.
