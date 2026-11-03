// Lazy-loaded terminology packs, with verified English identity as the default.
// Names without confirmed translations deliberately remain as published in game data.
import { SUPPORTED_LANGUAGES } from './i18n-dictionary.js';
const valid = new Set(SUPPORTED_LANGUAGES.map(x => x.code));
const cache = new Map();
const pending = new Map();
export function termPack(locale) { return cache.get(locale) || null; }
export function translatedGameTerm(term, locale) {
  if (!term || locale === 'en') return term;
  const entry = cache.get(locale)?.[String(term)];
  return entry?.value ?? term;
}
export function gameTermProvenance(term, locale) {
  return cache.get(locale)?.[String(term)]?.source || 'unreviewed';
}
export function loadGameTermPack(locale) {
  if (!valid.has(locale)) return Promise.resolve(null);
  if (cache.has(locale)) return Promise.resolve(cache.get(locale));
  if (pending.has(locale)) return pending.get(locale);
  // Paths are fixed literals to avoid interpreting untrusted remote strings.
  const modules = {
    en: () => import('./game-locales/en.js'),
    de: () => import('./game-locales/de.js'),
    es: () => import('./game-locales/es.js'),
    fr: () => import('./game-locales/fr.js'),
    it: () => import('./game-locales/it.js'),
    ja: () => import('./game-locales/ja.js'),
    ko: () => import('./game-locales/ko.js'),
    pl: () => import('./game-locales/pl.js'),
    pt: () => import('./game-locales/pt.js'),
    ru: () => import('./game-locales/ru.js'),
    tr: () => import('./game-locales/tr.js'),
    zh: () => import('./game-locales/zh.js')
  };
  const promise = modules[locale]().then(x => {
    if (x.GAME_LOCALE !== locale) throw Error('Locale pack mismatch');
    cache.set(locale, x.GAME_TERM_ADDON);
    pending.delete(locale);
    return x.GAME_TERM_ADDON;
  }).catch(() => { pending.delete(locale); return null; });
  pending.set(locale, promise);
  return promise;
}
