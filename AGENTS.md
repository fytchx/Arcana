# Arcana project guardrails

## Product boundary

- Build the Season 3 Playbook and related UI in **Arcana Next** only. Its reader routes use `/next` and its interface belongs in `next/`.
- Do not implement or redirect Playbook UI through the classic Arcana site, `/classic`, or legacy page modules.
- Shared assets or helpers may be reused, and shared code may be changed when genuinely needed for Arcana Next. Before changing shared code, identify its other consumers and check for effects on the classic site.
- Keep the existing production data volume untouched. Never merge to `main`, deploy Live, or publish Fandom changes without the owner's explicit approval.

## Theme Designer compatibility

- New Arcana Next UI must respond to the published Next design and the player's Theme Designer settings.
- Use the existing theme variables for surfaces, text, accents, borders, typography, spacing, corners and class colors. Do not hard-code a page palette, fonts, or layout values that should come from the theme.
- Preserve authentic in-game sprite colors where color conveys game meaning. Do not apply theme filters to game artwork.
- Avoid changing global theme variables or Theme Designer behavior as part of a Playbook change unless explicitly requested.

## Home-page protection and CSS scope

- Treat both `/` and `/next#/home` as protected regression surfaces. Do not change their structure or appearance as an incidental effect of Playbook work.
- Scope Playbook styles to Playbook-specific classes, prefixed `.playbook-`. Avoid broad selectors such as `:root`, `body`, `a`, headings, or shared `.nx-*` rules for page-specific styling.
- Avoid editing the shared app shell, navigation, home view, global tokens, or `next/index.html` routing for a Playbook-only change unless the task requires it.
- Before and after UI or CSS changes, compare screenshots of `/` and `/next#/home` at phone and desktop sizes using the same theme settings. Investigate any difference outside the requested Playbook surface.

## Change workflow

- Before editing, check the target branch against current `main`, read the relevant handoff, and identify the files the change needs.
- Keep changes limited to the requested Next feature. Review the full diff; explain every touched file outside `next/` or the approved asset paths.
- Run `npm run check` and the relevant mobile smoke checks for UI work. Verify the exact preview commit and route before reporting it ready.
- Do not use Railway `/data` as a working directory or edit its contents directly.
