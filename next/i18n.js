// Arcana Next localization. No translation API, requests, or runtime service.
// Exact translations protect item names, formulas, links and player-authored content.
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './i18n-dictionary.js';
import { EXTRA_TRANSLATIONS } from './i18n-extra.js';
import { HANDBOOK_TRANSLATIONS } from './i18n-handbook.js';
import { translatedGameTerm, loadGameTermPack, termPack } from './i18n-game.js';

export { SUPPORTED_LANGUAGES };
export const LANGUAGE_KEY = 'arcana-language-v1';
const translations = Object.freeze(Object.fromEntries(
  SUPPORTED_LANGUAGES.filter(x => x.code !== 'en').map(x => [x.code,
    Object.freeze({ ...TRANSLATIONS[x.code], ...EXTRA_TRANSLATIONS[x.code], ...HANDBOOK_TRANSLATIONS[x.code] })])
));
const supported = new Set(SUPPORTED_LANGUAGES.map(x => x.code));

export function normalizeLocale(input) {
  const code = String(input || '').toLowerCase().replace('_', '-').split('-')[0];
  return supported.has(code) ? code : 'en';
}
export function getLocale() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved) return normalizeLocale(saved);
  } catch { /* Private mode: use browser language. */ }
  if (typeof navigator !== 'undefined') {
    const choices = navigator.languages || [navigator.language];
    for (const candidate of choices) {
      const language = String(candidate || '').split(/[-_]/)[0].toLowerCase();
      if (supported.has(language)) return language;
    }
  }
  return 'en';
}
export function translateEnglish(input, language = getLocale()) {
  const str = String(input ?? '');
  const lang = normalizeLocale(language);
  if (lang === 'en' || !str) return str;
  const dict = translations[lang] || {};
  // Preserve formatting and capitalization; do not substring-replace game terminology.
  const match = str.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return str;
  const [, before, phrase, after] = match;
  if (!phrase) return str;
  const direct = dict[phrase];
  if (direct !== undefined) return before + direct + after;
  // Navigation arrows are decoration, not part of the content or game term.
  const arrow = phrase.match(/^([‹←]\s+)(.+)$/);
  if (arrow && dict[arrow[2]]) return before + arrow[1] + dict[arrow[2]] + after;
  if (/^[A-Z][A-Z ]{2,}$/.test(phrase)) {
    const key = Object.keys(dict).find(k => k.toUpperCase() === phrase);
    if (key) return before + (['ja','ko','zh'].includes(lang) ? dict[key] : dict[key].toLocaleUpperCase(lang)) + after;
  }
  const chapter = phrase.match(/^CHAPTER (\d+)(?: · (.*))?$/);
  if (chapter) {
    const label = chapter[2] || '';
    const originalKey = Object.keys(dict).find(k => k.toUpperCase() === label.toUpperCase());
    const translated = originalKey ? dict[originalKey] : label;
    const title = label === label.toUpperCase() && !['ja','ko','zh'].includes(lang) ? translated.toLocaleUpperCase(lang) : translated;
    return before + (dict.Chapter || 'Chapter') + ' ' + chapter[1] + (label ? ' · ' + title : '') + after;
  }
  // Game's original proper names survive unless an explicit curated locale term exists.
  const term = translatedGameTerm(phrase, lang);
  if (term !== phrase) return before + term + after;
  // Fallback is always English. No network translation or paid provider.
  return str;
}

const originals = new WeakMap();
const attributes = new WeakMap();
const ATTRIBUTES = ['placeholder', 'aria-label', 'title'];
const PROTECTED = '.gd-body, .hb-page, .nx-article, [contenteditable], [data-no-translate]';
const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','PRE','CODE','TEXTAREA','OPTION']);
// Option is excluded because locale menu values are deliberately native-language names.
function blocked(node) {
  const parent = node.nodeType === 1 ? node : node.parentElement;
  return !parent || SKIP.has(parent.tagName) || !!parent.closest(PROTECTED);
}
function textNode(node, locale) {
  if (blocked(node)) return;
  const now = node.nodeValue;
  const state = originals.get(node);
  const original = state && now === state.output ? state.source : now;
  const next = translateEnglish(original, locale);
  originals.set(node, { source: original, output: next });
  if (next !== now) node.nodeValue = next;
}
function elementAttributes(el, locale) {
  if (blocked(el) || el.closest('[data-language-ui]')) return;
  let values = attributes.get(el);
  if (!values) { values = {}; attributes.set(el, values); }
  for (const name of ATTRIBUTES) {
    const now = el.getAttribute(name);
    if (now == null) continue;
    const prev = values[name];
    const source = prev && prev.output === now ? prev.source : now;
    const next = translateEnglish(source, locale);
    values[name] = { source, output: next };
    if (now !== next) el.setAttribute(name, next);
  }
}
export function translateTree(root = document.body, locale = getLocale()) {
  if (!root) return;
  if (root.nodeType === 3) { textNode(root, locale); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) elementAttributes(root, locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === 3) textNode(node, locale);
    else elementAttributes(node, locale);
  }
}

export function setLocale(locale) {
  const next = normalizeLocale(locale);
  try { localStorage.setItem(LANGUAGE_KEY, next); } catch {}
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  return next;
}

let menuOpen = false;
const escapeText = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function languageControl() {
  const lang = getLocale();
  const title = translateEnglish('Select language', lang);
  const options = SUPPORTED_LANGUAGES.map(x =>
    '<button type="button" class="nx-language-option" role="option" aria-selected="' + (x.code === lang) +
    '" data-language-choose="' + x.code + '"><span lang="' + x.code + '">' + escapeText(x.name) +
    '</span>' + (x.code === lang ? '<span aria-hidden="true">✓</span>' : '') + '</button>').join('');
  return '<div class="nx-language" data-language-ui><button type="button" class="nx-language-trigger" data-language-toggle aria-label="' +
    escapeText(title) + '" title="' + escapeText(title) + '" aria-expanded="' + menuOpen +
    '" aria-controls="nxLanguageMenu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/></svg><span>' +
    lang.toUpperCase() + '</span></button>' + (menuOpen ?
    '<div class="nx-language-menu" id="nxLanguageMenu" role="listbox" aria-label="' + escapeText(title) +
    '"><span class="nx-language-heading">' + escapeText(title) + '</span>' + options + '</div>' : '') + '</div>';
}

export function languageSettingsField() {
  const current = getLocale();
  const options = SUPPORTED_LANGUAGES.map(x => '<option value="' + x.code + '"' +
    (current === x.code ? ' selected' : '') + ' lang="' + x.code + '">' + escapeText(x.name) + '</option>').join('');
  return '<section class="nx-language-settings"><label class="nx-field" for="nxLanguageSelect">' +
    escapeText(translateEnglish('Language', current)) + '</label><select id="nxLanguageSelect" data-language-select aria-label="' +
    escapeText(translateEnglish('Select language', current)) + '">' + options + '</select></section>';
}

export function initLocalization(render) {
  document.documentElement.lang = getLocale();
  const warm = code => {
    if (code === 'en' || termPack(code)) return;
    loadGameTermPack(code).then(p => { if (p && getLocale() === code) render(); });
  };
  warm(getLocale());
  document.addEventListener('click', event => {
    const toggle = event.target.closest('[data-language-toggle]');
    if (toggle) { event.preventDefault(); menuOpen = !menuOpen; render(); return; }
    const choice = event.target.closest('[data-language-choose]');
    if (choice) {
      event.preventDefault();
      const chosen = setLocale(choice.dataset.languageChoose);
      menuOpen = false;
      render();
      warm(chosen);
      return;
    }
    if (menuOpen && !event.target.closest('[data-language-ui]')) { menuOpen = false; render(); }
  });
  document.addEventListener('change', event => {
    const picker = event.target.closest('[data-language-select]');
    if (!picker) return;
    const chosen = setLocale(picker.value);
    menuOpen = false;
    render();
    warm(chosen);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menuOpen) return;
    menuOpen = false; render();
    document.querySelector('[data-language-toggle]')?.focus();
  });
  // Dynamic rendering, including sub-tools and async API data.
  const observer = new MutationObserver(records => {
    const locale = getLocale();
    for (const record of records) {
      if (record.type === 'characterData') translateTree(record.target, locale);
      for (const node of record.addedNodes) translateTree(node, locale);
    }
  });
  observer.observe(document.body, { childList:true, characterData:true, subtree:true });
}
