# Arcana localization release audit and approval gate

**Scope:** 12 IdleArc client languages on Arcana Next, all interface labels that can be safely extracted, current canonical Handbook, and the featured Retaliation Warrior guide. **Test only.** PR #86 must remain a draft until the owner explicitly approves a production promotion.

## Architecture and provenance

- Source language: English, default until visitor explicitly selects another locale. Browser locale does **not** force a change.
- Locales: en, de, es, fr, it, ja, ko, pl, pt, ru, tr, zh.
- Native UI: curated phrase packs plus optional generated UI strings, exact-match translation only. Unknown or unsupported strings fall back to English rather than replacing game data.
- Each locale has an add-on in `next/game-locales/<code>.js`, whose 264-term inventory comes from historical Hub-backed skill/gear/rune/affix/biome names and selected stat labels. `source-name` terms retain original proper names, while `editorial-*` terms are tentative site translations rather than verified native game strings.
- Static editorial content: GitHub Actions standard public runner downloads MIT-licensed `facebook/m2m100_418M` **at build time**, converts the current public Handbook/featured-guide text to static `next/generated-locales/<locale>.json`, and commits to the feature branch only. No runtime translation service, paid API, or Railway model process.
- User-generated community guide translations: **deferred by owner**. News/Journal and legacy Classic's old article surfaces also require an explicit follow-up coverage decision before claiming the entire website is multilingual.
- Displayed machine-translated editorial material is labeled, offers a return to the English original and must match source SHA-256. Edited Handbook pages whose source differs from the build-time snapshot fall back to English, not stale translations.

## Automated hard gates

1. `next/handbook-content.js` and `next/guides-content.js` must remain byte-identical to the reviewed English source. Verified during development against `main` as of 2026-11-02.
2. All 12 terminology add-ons contain the entire identical term inventory, with provenance metadata for every term. Run `node --test tests/next-locales-integrity.test.mjs`.
3. All 11 generated editorial packs exist and match the current source content SHA-256. `node scripts/audit-i18n.mjs --strict` must pass, including the exact numbers, Markdown table widths, internal wiki targets and external URLs.
4. Both `Arcana Checks / source` and `Arcana Checks / mobile` must finish successfully at **the final generated commit**.
5. The mobile Playwright test switches all languages at 390 and 360px, checks the synchronized Profile setting, German Handbook title, Retaliation heading and exact English article text after switching away and back.
6. Railway **Arcana-Test** must report `SUCCESS` for the exact final SHA. It is isolated from live and uses a separate /data volume.
7. Review long-form translation meaning with a native speaker or accepted machine-translation quality sampling before claiming correctness. Model-generated translations are unreviewed until this happens.
8. No change to account/wiki storage, Fandom, the live Railway source branch, or live deployment may be part of this PR.

## Production approval

Do **not** merge PR #86, change `main`, or alter the live Railway service without a separate explicit owner approval after Test review. Upon approval, perform a standard reviewed PR merge, wait for Railway success and release commit verification, check rollback options, and do not touch `/data`.

## Remaining manual review

- Inspect 12 languages' major navigation and common tools for mixed-language/overflow.
- Inspect every translated Handbook article and the full Retaliation guide (not only headings) for numerical, semantic and game terminology accuracy. The automated checks only cover structural integrity.
- Decide whether existing Classic and Journal/news surfaces must be translated before main release; if yes, extend the static translation intake and test coverage first.
- Ensure the latest source SHA and each generated locale pack correspond to the same commit; rerun the offline generator after editorial English changes.
