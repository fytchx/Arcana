# Arcana navigation audit · October 15, 2026

## Scope
This is a repository-wide static destination audit and a responsive layout regression update for the private development preview. Browser/phone QA is still required before open beta.

## Destination rules
* Dock: Home, Profile, Featured, Recent, Options. Do not repeat Home or Profile inside Options.
* Home: Wiki, Tools, Guides, Builds, Pathfinder, Guild & Raid Finder. Pathfinder opens its hub without another menu.
* Build Studio: Equipment, Rune Forge, Class Skills, Passive Tree share one workspace tab bar.
* Pathfinder: Upgrade Map, From → To, Upgrade Costs, Compare Items share one workspace. Standalone gear-tool links are redirected to the matching tab, preserving identifiers.
* Wiki: article and codex pages keep their meaningful parent breadcrumbs.
* Other tools (Pet Compound, Pet Affixes, ML Farming, Guild Planner) stay in Tools, not duplicated under Pathfinder.
* Explore All remains a deduplicated A-Z directory; contextual related links remain on content pages where useful.

## Redundant UI removed
1. The secondary From → To section previously repeated inside Pathfinder's upgrade timeline.
2. The old Options panel listed Home and User Center despite permanent dock buttons and repeated a separate "Useful destinations" list.
3. Tools previously separately advertised gear upgrade cost and comparison destinations that now live in Pathfinder.
4. Build Studio and Pathfinder no longer repeat their own tabs in "Where to next" navigation panels.
5. Legacy deep links to original Upgrade Cost / Compare pages still render Pathfinder's corresponding tab.

## Pathfinder mobile issue
The Pathfinder shell inherited a grid track with auto min-content width; horizontal step/tier rails could force a desktop-wide document. Its four tab buttons also competed for one short row. CSS now contains swipe rails within their panel, uses minmax(0,1fr) tracks, a 2x2 tab arrangement on phones, compact form elements, and vertical From/To fieldsets. Breakpoints are 700px / 355px and all selectors are scoped to Pathfinder. The homepage waves and intensity were intentionally not changed.

## Admin controls and authentication
Design Workshop is installed at Options → Settings → Design Workshop. The admin/editor panels are hidden without a server-verified Admin or Creator role. Guest Settings now explains whether the preview is missing Discord OAuth or whether sign-in is needed. It is not safe to bypass that server authorization in the browser. Preview OAuth credentials and Creator ID are still missing from the Railway preview configuration.

## Remaining QA
Run mobile browser smoke tests at 320, 360, 390 and 430px; validate no document-wide horizontal overflow on all four Pathfinder tabs and run touch scrolling tests inside long stage/step rails. Validate all breadcrumbs, back/fwd browser history, item pickers, login/OAuth, and account permissions on a real Android browser before launching beta.
