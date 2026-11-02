"""Offline Playwright smoke for Arcana Next's 12-language UI; no production APIs."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

class QuietFiles(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietFiles, directory=str(ROOT)))
worker = Thread(target=server.serve_forever, daemon=True)
worker.start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def api(route):
            url = route.request.url
            if '/api/account/me' in url:
                data = {'user': None}
            elif '/api/site/theme' in url:
                data = {'next': None, 'notice': None}
            elif '/api/journal' in url:
                data = {'articles': []}
            elif '/api/community/posts' in url:
                data = {'posts': []}
            elif '/api/featured' in url:
                data = {'featured': [], 'ids': []}
            elif '/api/handbook' in url:
                data = {'pages': []}
            else:
                data = {'entries': [], 'posts': [], 'articles': [], 'pages': []}
            route.fulfill(status=200, json=data)

        page.route('**/api/**', api)
        page.goto(f'http://127.0.0.1:{server.server_port}/next/index.html#/home', wait_until='domcontentloaded')
        page.locator('[data-language-toggle]').wait_for(timeout=10000)
        page.wait_for_function("!document.querySelector('#nxSplash') || getComputedStyle(document.querySelector('#nxSplash')).visibility === 'hidden'", timeout=12000)
        assert page.locator('.nx-language').count() == 1, 'Language selector missing'

        languages = {
            'en': 'Home', 'de': 'Startseite', 'es': 'Inicio', 'fr': 'Accueil',
            'it': 'Home', 'ja': 'ホーム', 'ko': '홈', 'pl': 'Strona główna',
            'pt': 'Início', 'ru': 'Главная', 'tr': 'Ana sayfa', 'zh': '首页'
        }
        for code, expected in languages.items():
            page.locator('[data-language-toggle]').click()
            assert page.locator('[data-language-choose]').count() == 12
            page.locator(f'[data-language-choose="{code}"]').click()
            page.wait_for_function('(code) => document.documentElement.lang === code', arg=code)
            assert expected in page.locator('#nxNav').inner_text(), f'{code} nav not translated: {page.locator("#nxNav").inner_text()}'
            assert page.locator('[data-language-toggle]').inner_text().strip() == code.upper()
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), f'{code} overflowed 390px'

        page.reload(wait_until='domcontentloaded')
        page.locator('[data-language-toggle]').wait_for(timeout=10000)
        assert page.evaluate('document.documentElement.lang') == 'zh', 'selected language not persisted'
        page.evaluate("location.hash='#/profile'")
        page.locator('#nxLanguageSelect').wait_for(timeout=5000)
        assert page.locator('#nxLanguageSelect').input_value() == 'zh', 'Account selector not synced to header'
        page.locator('#nxLanguageSelect').select_option('de')
        assert page.evaluate('document.documentElement.lang') == 'de', 'Account locale switch failed'
        assert 'Startseite' in page.locator('#nxNav').inner_text()
        page.evaluate("location.hash='#/codex'")
        page.locator('.hb-ch').first.wait_for(timeout=5000)
        assert 'Erste Schritte' in page.locator('.hb-ch').first.inner_text(), 'Handbook chapter not translated'
        page.evaluate("location.hash='#/guides/retaliation-warrior'")
        page.locator('.gd-article').wait_for(timeout=5000)
        assert 'Vergeltungskrieger' in page.locator('.gd-article h1').inner_text()
        assert page.locator('.gd-article .nx-language-note').count() == 1, 'English guide notice missing'
        # English remains the exact original after switching away and back.
        page.locator('[data-language-toggle]').click()
        page.locator('[data-language-choose="en"]').click()
        page.evaluate("location.hash='#/guides/retaliation-warrior'")
        page.locator('.gd-article').wait_for(timeout=5000)
        english_guide = page.locator('.gd-article').inner_text()
        english_anchors = page.locator('.gd-article h2').evaluate_all('(nodes) => nodes.map(n=>n.id)')
        assert "I'm a washed-out Retaliation Warrior" in english_guide
        page.locator('[data-language-toggle]').click()
        page.locator('[data-language-choose="de"]').click()
        page.locator('[data-language-toggle]').click()
        page.locator('[data-language-choose="en"]').click()
        assert page.locator('.gd-article').inner_text() == english_guide, 'English guide changed after language roundtrip'
        assert page.locator('.gd-article h2').evaluate_all('(nodes) => nodes.map(n=>n.id)') == english_anchors
        assert page.locator('.gd-article .nx-language-note').count() == 0, 'English guide should have no translated-content notice'
        page.evaluate("location.hash='#/handbook/what-is-idlearc'")
        page.locator('.hb-page').wait_for(timeout=5000)
        english_handbook = page.locator('.hb-page').inner_text()
        page.locator('[data-language-toggle]').click()
        page.locator('[data-language-choose="fr"]').click()
        page.locator('[data-language-toggle]').click()
        page.locator('[data-language-choose="en"]').click()
        assert page.locator('.hb-page').inner_text() == english_handbook, 'English Handbook changed after language roundtrip'
        page.evaluate("location.hash='#/home'")
        page.set_viewport_size({'width': 360, 'height': 740})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), '360px overflow'
        assert errors == [], 'Unexpected JS errors: ' + repr(errors)
        browser.close()
        print('Arcana Next language selector: 12 locales, persistence, mobile widths PASS')
finally:
    server.shutdown()
    server.server_close()
