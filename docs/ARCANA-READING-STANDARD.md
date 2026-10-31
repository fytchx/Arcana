# Arcana Guide and Journal Reading Standard · v1

**Decision:** 2026-10-30. **Applies to:** all new/edited ArcanaWiki guides, contributor articles, and Journal posts. This is an editorial and UI contract, not a game mechanic.

## First viewport is for content

On a normal Android phone (~360–430 CSS px wide), the opening paragraph or first chapter heading must appear without scrolling on ordinary articles. Do not stack multiple framed intro panels before content.

**One compact masthead** contains:
- Category and useful read-time or date, title, a single concise description.
- Author/source attribution and a quiet chapter picker (if 3+ chapters), and small Share control when supported.
- An optional ONE-LINE editorial progression strip, when it truly explains the article. The ML guide uses: **01 Push ML › 02 Upgrade damage › 03 Repeat**.
- Do not add a second giant three-step card, full table of contents, marketing panel, CTA stack, tag chips, or a duplicate Back button above the article.

Chapters open inside the existing custom Arcana overlay; preserve proper focus and mobile accessibility. The masthead should fit roughly 170–280 CSS px on phones, depending on title length, and text should begin above the bottom navigation.

## Tool linking

**No tool promotion grids on reading pages.** No repeated stacks of calculators between every chapter. Link a tool only at the point where the reader benefits from it; make *the words describing the tool* clickable. Maximum 1–2 contextual tool links for a normal guide; more only when the content genuinely requires it.

In ArcanaWiki section bodies, use a safe source-only inline token:

`[[tool:upgrade|Pathfinder's upgrade costs]]` or `[[tool:mlxp|ML XP planner]]`

Keys are validated against `NAV_DESTINATIONS`; unknown keys display plain label text rather than inventing a route. Don't place raw HTML or unverified URLs inside editorial strings. Other existing `[[arcana:slug|Article]]` references remain supported.

Avoid arbitrary footer link galleries. At most one simple text navigation row at the end is enough. Put a link in a note only if it adds value.

## Writing and layout

Start with a useful insight or practical advice, not a generic welcome or self-congratulatory paragraph. Keep headings clear and modest; split long sections when it improves navigation, not to create 37 nearly empty cards. Paragraphs should be scannable, facts labeled by patch and confidence, and player opinions visibly attributed. Images must demonstrate something, not decorate empty space. Never extend a cover illustration into a full-screen obstacle before the opening text.

Use theme tokens (`--theme-card`, `--theme-highlight`, `--theme-border`, `--text`, `--soft`) and shared `reading-standard.css`; avoid hard-coded colors that fight the Theme Designer. Check 320/360/390/430px, tablet and desktop.

## Review gates

- The first chapter content is visible in the initial viewport on 390×844 Android equivalent after the site header and bottom nav.
- Guides have a single top masthead; other content does not start with a second attention-grabbing card.
- The chapter overlay opens for articles with 3+ sections, and its selected/current state and return focus work.
- Tool links are meaningful inline text rather than card grids.
- Journal intro does not insert a huge cover between headline and text; when there is a cover, render it as a small optional thumb in masthead.
- Regression-check theme contrast, long titles, imported attribution, article links, mobile footer and scroll anchor position.
- Never auto-promote an editorial draft to production. Preview branch first, then explicit owner approval.

Implementation on preview: `src/wiki-views.js`, `src/journal-views.js`, `src/app.js`, `src/ml-one-shot-milestone-guide.js`, `reading-standard.css`, `src/css-bundle.mjs`.
