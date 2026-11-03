import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, normalizeLocale, translateEnglish, getLocale, LANGUAGE_KEY } from '../next/i18n.js';
import { GAME_TERMS_ENGLISH, GAME_TERM_GROUPS } from '../next/i18n-terms-base.js';
import { translatedGameTerm, loadGameTermPack, termPack } from '../next/i18n-game.js';
import { FEATURED_GUIDES } from '../next/guides-content.js';
import { CHAPTERS, PAGES } from '../next/handbook-content.js';

test('every locale has a separate term add-on containing every known IdleArc term', async () => {
  assert.ok(GAME_TERMS_ENGLISH.length >= 240);
  for (const {code} of SUPPORTED_LANGUAGES) {
    const pack = await loadGameTermPack(code);
    assert.ok(pack, code);
    assert.equal(Object.keys(pack).length, GAME_TERMS_ENGLISH.length, code);
    for (const name of GAME_TERMS_ENGLISH) {
      assert.ok(Object.hasOwn(pack,name), code + ': ' + name);
      assert.ok(pack[name].value, code + ': blank value for ' + name);
      assert.ok(['source-name','editorial-dictionary','editorial-class-label'].includes(pack[name].source), code);
    }
  }
});
test('proper names are retained until verified, and common class terms are curated', async () => {
  await loadGameTermPack('de');
  assert.equal(translatedGameTerm('Warrior', 'de'), 'Krieger');
  assert.equal(translatedGameTerm('Avatar of War', 'de'), 'Avatar of War');
  assert.equal(translatedGameTerm('Broken Sword', 'de'), 'Broken Sword');
  assert.equal(translatedGameTerm('Unknown skill', 'de'), 'Unknown skill');
});
test('English is identity for every named term and all editorial content', async () => {
  await loadGameTermPack('en');
  for (const term of GAME_TERMS_ENGLISH) {
    assert.equal(translatedGameTerm(term, 'en'), term);
    assert.equal(translateEnglish(term, 'en'), term);
  }
  for (const chapter of CHAPTERS) {
    assert.equal(translateEnglish(chapter.title, 'en'), chapter.title);
    assert.equal(translateEnglish(chapter.ask, 'en'), chapter.ask);
  }
  for (const page of PAGES) {
    for (const key of ['title', 'answer', 'body']) {
      assert.equal(translateEnglish(page[key], 'en'), page[key]);
    }
  }
  for (const guide of FEATURED_GUIDES) {
    for (const key of ['title', 'summary', 'body']) {
      assert.equal(translateEnglish(guide[key], 'en'), guide[key]);
    }
  }
});
