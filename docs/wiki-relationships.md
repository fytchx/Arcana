# Linking Wiki content to Arcana

ArcanaWiki articles are not dead ends. Each article should provide a route to its relevant records and a practical tool, when one exists.

## Author a connection

1. Add the article to `WIKI_ARTICLES` in `src/wiki-data.js` with a stable, unique `id`, factual sections, and relevant `actions`.
2. Add its relationship metadata to `WIKI_CONNECTIONS`, or supply the same structure in the article's `connections` field.
3. Reference only actual article IDs, registered Codex categories, and keys from `NAV_DESTINATIONS`.
4. For a tool immediately useful to a particular article section, add its key under `sectionLinks` using the section's exact title.

Example:

```js
connections: {
  articles: ['rune-grid'],
  collections: ['rune','runeword'],
  tools: ['runes','build'],
  sectionLinks: {
    'Planning rune layouts': ['runes']
  }
}
```

Relations are intentionally editorial and not inferred from keyword similarity. Do not infer mechanics, drops or best-in-slot links from names. A visual Codex reference is not evidence of any unverified mechanic.

## Add a tool

Register the new destination once in `src/context-nav.js` in `NAV_DESTINATIONS`, and link to it from the relevant keys in `NAV_FLOWS`. Make sure the destination route actually exists in `routeView()` in `src/app.js`.

Links are rendered as actual working buttons. Shared cards automatically use the visitor's existing theme and are sized for touch.

## Link a specific game record

For a tool operating on an item (such as Compare or Upgrade), retain the game's exact record ID when navigating. The Codex already sends these IDs through dedicated action handlers. Never swap an ID for a guessed display-name match.

## Required checks

- `npm run check` validates article connections, supported routes, helper output, and existing game mechanics.
- Review responsive navigation, Codex horizontal categories and tool input focus at narrow Android widths.
- Deploy to staging first and keep `arcanacompanion.xyz` untouched until QA is complete.
