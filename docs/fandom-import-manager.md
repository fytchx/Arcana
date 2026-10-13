# Fandom -> ArcanaWiki Migration Manager

## Where it lives

Open **ArcanaWiki → Wiki Studio → Fandom Import Manager** on the staging site. Bulk import is gated to the Creator/Admin account; while OAuth rollout is unfinished, the existing private Wiki owner key can unlock the migration screen. Do not paste that key into chat, issue trackers or source control.

## How to migrate

1. Obtain a current Fandom **Special:Export** XML file. Ideally include revision history for attribution. XML contains raw MediaWiki markup and article links; it does not reliably contain the uploaded image bytes.
2. In Import Manager, upload the XML. The browser displays the page inventory, skipped namespace/redirect entries, detected internal links and conversion issues.
3. Optionally select PNG/JPEG/WebP files or a ZIP of artwork to match exact normalized source filenames. The importer extracts only matched ZIP entries, avoiding unrelated artwork. When no exact unique match exists, it leaves a review flag rather than guessing.
4. Start with **Select first 10** for a pilot. **Save selected as private drafts** writes to local browser IndexedDB, with at most 25 selected pages handled per operation. No import action publishes to the live wiki.
5. Edit an imported draft in Wiki Studio. Compare the original XML text and the converted layout, fix missing images and tables, update mechanics for the current season, and verify every internal link. Large pages preserve their original Wiki text in the private draft and block publishing until reviewed.
6. Export local backups regularly. The imported article's original title, source link and captured contributor information appear in the public attribution footer when approved for publication.
7. Approved Wiki Editors can publish reviewed pages one at a time using the existing server-side checks. Publishing against a conflicting existing article requires proper editor revision flow; XML import will not overwrite the live page.

## What the importer converts

- Main-namespace article titles, current/latest exported revisions and limited author metadata
- Basic headings, text emphasis, bullet lists, categories, infobox key/value pairs and wiki tables
- Internal article links **when the target is present in the same XML batch**, resulting in safe ArcanaWiki links
- Image references and exact filename matches from supplied files or ZIP art
- Source URL attribution derived from the XML's \`siteinfo/base\` field

## Known limitations (by design)

- Complex templates, Lua modules, galleries, raw custom HTML/CSS, deeply nested wiki markup and nonstandard infoboxes **need human conversion**. They are not executed inside Arcana.
- The current Wiki Studio limits content to 35 sections, 8,000 characters per section, 35 rows / 12 columns per table, and 10 images per article. Oversized content is flagged as lossy, preserved in \`importSource.rawWikitext\` (private only), and cannot be published until a maintainer explicitly compares it with the full original source. For huge reference tables, splitting into curated articles or moving structured data into Codex is preferable.
- XML alone does not include every binary image; artwork should be supplied separately. Art with unmatched or ambiguous filenames requires manual selection.
- Redirect pages and non-main namespaces are skipped rather than blindly published. Missing destination pages appear in the import report for editorial correction.
- Old articles are **not automatically considered Season 2 accurate**, even after successful format conversion.
- Links to articles that remain drafts will not work publicly until those articles are published.
- The import manager cannot verify reuse rights for each image. Source attribution and image-specific licensing still require editorial attention.
- The preview is **not a remote live-site scraper** and cannot guarantee a current Fandom export without the author providing one. XML stays in the browser and is not uploaded to the server.

## Release and safeguards

The automated tests exercise conversions, source preservation, SQL-free local handling, security escaping, and Wiki Studio rendering. End-to-end validation of a real Android upload, full artwork ZIP and several representative complex Fandom pages must still pass before any production domain change.

Do not overwrite or remove Railway services/volumes or delete the original Fandom wiki as part of importing. Keep the XML backup and verify the complete published article inventory.

## Historical baseline examples

Two earlier Library XML exports were used for format analysis, **not treated as a current wiki snapshot**:
- \`IdleArc_Season2_CLEAN_FIX.xml\` (September 27, 2026): 42 main-namespace pages and 5 wiki tables.
- \`IdleArc_Item_Codex_MOBILE_FIX.xml\` (October 2, 2026): 7 main-namespace pages and 175 wiki table definitions. Some pages are far larger than current editor limits, including an Awakening Costs page over 200,000 characters.

The large Item Codex pages should be handled as a distinct codex migration, not force-fitted into the short-form article editor.
