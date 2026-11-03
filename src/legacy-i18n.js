// Shared, opt-in Arcana language UI for legacy /classic pages.
// Preserves all original English strings, account data and community text.
import { initLocalization, languageControl, translateTree, getLocale } from '../next/i18n.js';
import { loadEditorialLocale, initEditorialLocalization } from '../next/i18n-content.js';

const header = document.querySelector('.launchTopRight');
const dock = document.getElementById('arcanaDock');
const app = document.getElementById('app');
if (header && dock && app) {
  const wrap = document.createElement('div');
  wrap.id = 'arcanaClassicLanguage';
  wrap.className = 'arcana-classic-language';
  header.prepend(wrap);
  function applyLanguage() {
    document.documentElement.lang = getLocale();
    wrap.innerHTML = languageControl();
    translateTree(app);
    translateTree(dock);
  }
  initLocalization(applyLanguage);
  initEditorialLocalization(applyLanguage);
  applyLanguage();
  // Classic has a separate renderer. Translate its newly mounted UI too.
  const rerendered = new MutationObserver(entries => {
    for (const entry of entries) {
      if (entry.type === 'characterData') translateTree(entry.target);
      else for (const node of entry.addedNodes) translateTree(node);
    }
  });
  rerendered.observe(app, {childList:true, characterData:true, subtree:true});
  rerendered.observe(dock, {childList:true, characterData:true, subtree:true});
  if (getLocale() !== 'en') loadEditorialLocale(getLocale());
}
