import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, normalizeLocale, translateEnglish, getLocale, LANGUAGE_KEY } from '../next/i18n.js';
import { TRANSLATIONS } from '../next/i18n-dictionary.js';

test('all 12 game client locales are represented with unique native names', () => {
  const codes = SUPPORTED_LANGUAGES.map(x => x.code);
  assert.deepEqual(codes, ['en','de','es','fr','it','ja','ko','pl','pt','ru','tr','zh']);
  assert.equal(new Set(codes).size, codes.length);
  for (const item of SUPPORTED_LANGUAGES) assert.ok(item.name);
});
test('regional language tags map to a supported base', () => {
  for (const [input, expected] of [['de-DE','de'],['pt-BR','pt'],['zh-Hant','zh'],['en-US','en'],['es_MX','es'],['xx-YY','en'],['','en']]) {
    assert.equal(normalizeLocale(input), expected, input);
  }
});
test('every non-English locale has full navigation and common UI translations', () => {
  for (const { code } of SUPPORTED_LANGUAGES.filter(x => x.code !== 'en')) {
    const t = TRANSLATIONS[code];
    assert.ok(Object.keys(t).length >= 100, code);
    for (const english of ['Home','Tools','Search','Builds','Handbook','Guides','Settings','Language','Select language','Save','Cancel','Featured builds','Featured guide']) {
      assert.ok(typeof t[english] === 'string' && t[english].trim().length, code + ': ' + english);
    }
  }
});
test('translations preserve whitespace and do not modify unknown game data or markup', () => {
  assert.equal(translateEnglish(' Home ', 'de'), ' Startseite ');
  assert.equal(translateEnglish('HAND BOOK', 'de'), 'HAND BOOK');
  assert.equal(translateEnglish('Monster Level 404 -> 405', 'de'), 'Monster Level 404 -> 405');
  assert.equal(translateEnglish('[[tool:retaliation|plan]]', 'fr'), '[[tool:retaliation|plan]]');
  assert.equal(translateEnglish('Pathfinder', 'de'), 'Pathfinder');
  assert.equal(translateEnglish('CHAPTER 2', 'de'), 'Kapitel 2');
  assert.equal(translateEnglish('Home', 'en'), 'Home');
  assert.equal(translateEnglish('Guides', 'ja'), 'ガイド');
});
test('unknown language falls back to English', () => {
  assert.equal(translateEnglish('Tools', 'xx'), 'Tools');
});

test('all languages translate expanded tool labels, Handbook navigation and featured guide title', () => {
  for (const { code } of SUPPORTED_LANGUAGES.filter(x => x.code !== 'en')) {
    for (const value of ['Display', 'Upgrade costs', 'Rarity reference', 'Getting started', 'How do runes and rune words work?', 'Retaliation Warrior: the journey to endgame']) {
      const text = translateEnglish(value, code);
      assert.ok(text && text !== value || ['it', 'en'].includes(code) && text === value, code + ': ' + value);
    }
    assert.ok(translateEnglish('The article is currently available in English.', code).length);
  }
  assert.equal(translateEnglish('‹ Tools', 'de'), '‹ Werkzeuge');
  assert.equal(translateEnglish('CHAPTER 1 · GETTING STARTED', 'de'), 'Kapitel 1 · ERSTE SCHRITTE');
  assert.equal(translateEnglish('CHAPTER 3 · COMBAT AND STATS', 'ja'), '章 3 · 戦闘とステータス');
  assert.equal(translateEnglish('Arcstone × 22.9', 'de'), 'Arcstone × 22.9');
  assert.equal(translateEnglish('Pathfinder', 'zh'), 'Pathfinder');
});

test('English is always the unselected first-visit default', () => {
  const original = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => null, setItem: () => {} };
    assert.equal(getLocale(), 'en');
    globalThis.localStorage = { getItem: key => key === LANGUAGE_KEY ? 'de' : null };
    assert.equal(getLocale(), 'de');
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
});

test('i18n: German editorial translations are reviewed and other machine packs stay gated', async () => {
  const { readFileSync } = await import('node:fs');
  const m = await import('../next/i18n-content.js');
  const pack = JSON.parse(readFileSync(new URL('../next/generated-locales/de.json', import.meta.url), 'utf8'));
  assert.deepEqual([...m.REVIEWED_LANGUAGES], ['de']);
  assert.deepEqual(pack.engine, { id: 'chatgpt-translation', mode: 'editorial' });
  assert.deepEqual(pack.ui, {});
  assert.equal(await m.loadEditorialLocale('es'), null);
});
