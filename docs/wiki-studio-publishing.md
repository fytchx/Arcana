# ArcanaWiki Studio: publishing setup and editor workflow

Wiki Studio lives at `#/wiki/studio` on the Arcana site. Any visitor can **create local drafts**, upload and label images, connect articles to the existing Arcana tools, preview, save to the browser, and export/import JSON backups. This does **not** give visitors permission to publish or overwrite the public Wiki.

## Writing a page

1. Open Wiki Studio, choose a blank page or a guided template.
2. Add a clear title, unique URL slug, category, summary and keywords.
3. Fill in section headings and accurate content. Blank lines separate paragraphs; lines beginning `- ` become bullet lists.
4. Upload PNG, JPEG or WebP images. The browser compresses them for mobile use. Write meaningful alternative text and optionally a caption. Assign pictures to the relevant sections.
5. Add source details when available. The source URL, if given, must use HTTPS.
6. Add related tool buttons and other guide slugs. The resulting public article is connected to the rest of Arcana.
7. Preview and export the draft backup. Drafts stay in the browser’s IndexedDB. Backups are essential when using multiple devices or clearing browser data.

Published pages live in `content/wiki/articles.json`; images are deployed as separate files in `content/wiki/images/<article-id>/`. The public Wiki loads those files alongside its existing editorial articles and includes published content in guide navigation and search.

## Owner-only publishing

Publishing is intentionally **disabled by default**. To enable it for a deployment, configure **all three** Railway service environment variables, as secret values where applicable:

- `ARCANA_WIKI_OWNER_KEY`: a fresh random secret at least 24 characters long, known only to the owner. It is never stored in browser localStorage.
- `ARCANA_WIKI_GITHUB_TOKEN`: a fine-grained GitHub access token with **Contents: Read and Write** scoped to the specific `fytchx/Arcana` repository. Never commit the token, paste it into public chat, or embed it in frontend code.
- `ARCANA_WIKI_PUBLISH_BRANCH`: the GitHub branch that this Railway deployment builds from.

Optional: `ARCANA_WIKI_GITHUB_REPO` if the repository moves (default: `fytchx/Arcana`).

The server confirms the owner key, validates the article, stores its images as separate Git blobs and commits the article registry and images in one atomic commit. A new Railway build then publishes the article; a failed build does not overwrite an existing healthy deployment. Publishing updates only the specified source branch. For a production release, verify production is configured to build that branch first.

## Security and maintenance

- Never give the owner key to general wiki contributors. They can export drafts to send for review.
- Do not configure tokens on a publicly editable environment before reviewing rate limits, deployment logs and repository permissions.
- The authoring system does not execute user-provided HTML, scripts or markup. Its public renderer escapes user text and limits image sources.
- Drafts are per-device. Export JSON before switching devices.
- Uploaded images are limited to ten optimized files per article. The default public file source is the GitHub repository, not an ephemeral Railway filesystem.
- New game mechanics and numeric claims should be verified before publication, with current season/version information checked by the editor.
- Built-in editorial pages have reserved slugs and cannot be overwritten from Wiki Studio.

## QA checklist

Verify image upload, alt text, captions, image assignment, preview, import/export, autosave across reload, editing a previously saved draft, public article links, source URLs, on-device scroll and keyboard behavior, error handling when publishing is disabled, authentication rejection, and safe GitHub publishing with a limited test token before enabling production.
