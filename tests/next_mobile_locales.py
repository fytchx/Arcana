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

        auth = {'signed_in': True, 'logout_methods': []}

        def api(route):
            url = route.request.url
            if '/api/account/logout' in url:
                auth['logout_methods'].append(route.request.method)
                if route.request.method != 'POST':
                    route.fulfill(status=405, json={'error': 'Method not allowed'})
                else:
                    auth['signed_in'] = False
                    route.fulfill(status=200, json={'ok': True})
                return
            if '/api/account/me' in url:
                member = {'id': 'mock-google-member', 'displayName': 'Wrong Google account', 'roles': [], 'permissions': {'manageSite': False}} if auth['signed_in'] else None
                data = {'user': member, 'providers': {'google': True, 'discord': True}, 'enabled': True}
            elif '/api/site/theme' in url:
                data = {'next': None, 'notice': None}
            elif '/api/journal' in url:
                data = {'articles': []}
            elif '/api/community/posts' in url:
                data = {'posts': []}
            elif '/api/featured' in url:
                data = {'featured': [], 'ids': []}
            elif '/api/guidebook' in url:
                data = {'pages': [
                    {'id': 'systems-progression', 'chapter': 'systems', 'title': 'Systems & Progression', 'answer': 'The primary sources of character power and why.', 'body': 'Overview.', 'author': 'Zane', 'status': 'ready', 'order': 10},
                    {'id': 'grind-ml', 'chapter': 'systems', 'title': 'Grinding Monster Level Efficiently', 'answer': 'Keep Monster Level moving.', 'body': 'One-shot your target.', 'author': 'Zane', 'status': 'ready', 'order': 30},
                    {'id': 'pets', 'chapter': 'pets', 'title': 'Pets and Compounding', 'answer': 'Protect your future Legendaries.', 'body': 'Pets.', 'author': 'Zane', 'status': 'ready', 'order': 10},
                ]}
            elif '/api/handbook' in url:
                data = {'pages': []}
            else:
                data = {'entries': [], 'posts': [], 'articles': [], 'pages': []}
            route.fulfill(status=200, json=data)

        page.route('**/api/**', api)
        # The wrong-Google-account signout must POST and return to the Next login screen.
        page.goto(f'http://127.0.0.1:{server.server_port}/next/index.html#/profile', wait_until='domcontentloaded')
        logout = page.locator('[data-act="logout"]')
        logout.wait_for(timeout=10000)
        assert logout.get_attribute('href') is None, 'Sign out must not use a GET link'
        assert page.locator('.nx-me').is_visible(), 'Signed-in profile did not load'
        logout.click()
        page.locator('.nx-sso-google').wait_for(timeout=10000)
        assert auth['logout_methods'] == ['POST'], 'Sign out must POST exactly once'
        assert 'Continue with Google' in page.locator('.nx-sso-google').inner_text()
        assert page.locator('.nx-me').count() == 0, 'Signed-in account persisted'
        assert page.url.endswith('#/profile')
        assert errors == [], 'Sign out produced JS errors: ' + repr(errors)

        # Regression: a direct Guidebook link must render in Arcana Next,
        # not get redirected to the classic Not Found page.
        page.goto(f'http://127.0.0.1:{server.server_port}/next/index.html#/guidebook', wait_until='domcontentloaded')
        page.locator('.gb-head h1').wait_for(timeout=10000)
        assert 'Season 3 Playbook' in page.locator('.gb-head h1').inner_text()
        overview = page.locator('.gb-head').inner_text().lower()
        assert 'start here:' in page.locator('.playbook-start-link').inner_text().lower()
        assert 'keep pushing monster level' in overview
        assert page.locator('.gb-pillars').count() == 0, 'Overview philosophy should not use separate cards'
        assert page.locator('.gb-chapter').count() == 0, 'Empty draft chapters must stay hidden from readers'
        assert '/classic' not in page.url, 'Guidebook deep-link redirected to Classic'
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'Guidebook overflows phone'
        systems_group = page.locator('.playbook-outline').filter(has_text='Systems & Progression')
        assert '2 pages' in systems_group.locator('summary').inner_text(), 'Published ML article missing from chapter dropdown'
        page.locator('.playbook-outline-item[href="#/guidebook/systems-progression"]').click()
        assert page.locator('.hb-next b').inner_text() == 'Grinding Monster Level Efficiently', 'Next-page navigation skipped a published page'
        page.locator('.hb-next').click()
        assert page.locator('.gb-page h1').inner_text() == 'Grinding Monster Level Efficiently'
        assert page.locator('.hb-next b').inner_text() == 'Pets and Compounding', 'Next-page navigation did not continue across chapters'
        assert errors == [], 'Guidebook overview/navigation produced JS errors: ' + repr(errors)
        (ROOT / 'qa-output').mkdir(exist_ok=True)
        page.screenshot(path=str(ROOT / 'qa-output' / 'guidebook-mobile.png'), full_page=True)

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
        assert 'My target is 1 % bonus Strength pet, 1 flat Strength pet, and 2 Retaliation pets.' in english_guide
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
        # Directory install button: positioned beside the header, fallback help,
        # hidden after app installation, and restored when browser offers reinstall.
        page.evaluate("location.hash='#/directory'")
        install = page.locator('.nx-directory-head [data-act="install"]')
        install.wait_for(timeout=5000)
        assert install.is_visible()
        assert install.inner_text().strip() == 'Install app'
        assert page.locator('.nx-directory-head h1').inner_text() == 'Directory'
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'Directory install button overflowed phone'
        install.click()
        help_panel = page.locator('.nx-directory-install-help')
        help_panel.wait_for(timeout=5000)
        assert 'Add to Home screen' in help_panel.inner_text()
        page.locator('[data-act="installhelpclose"]').click()
        assert help_panel.count() == 0
        page.evaluate("window.dispatchEvent(new Event('appinstalled'))")
        assert page.locator('.nx-directory-install').count() == 0, 'Button should vanish on installation'
        assert page.evaluate("localStorage.getItem('arcana-next-app-installed-v1')") == '1'
        page.reload(wait_until='domcontentloaded')
        page.locator('.nx-directory-head').wait_for(timeout=5000)
        assert page.locator('.nx-directory-install').count() == 0, 'Installed state should survive reload'
        # A new install offer proves the prior installed flag is stale (for example after uninstall).
        page.evaluate("""() => {
          const event = new Event('beforeinstallprompt', {cancelable: true});
          event.prompt = () => { window.arcanaInstallPrompted = true; return Promise.resolve(); };
          event.userChoice = Promise.resolve({outcome: 'accepted'});
          window.dispatchEvent(event);
        }""")
        install.wait_for(timeout=5000)
        install.click()
        page.wait_for_function("localStorage.getItem('arcana-next-app-installed-v1') === '1'")
        assert page.evaluate('window.arcanaInstallPrompted === true'), 'Install button did not trigger browser prompt'
        assert page.locator('.nx-directory-install').count() == 0, 'Button should hide after accepted install'
        page.evaluate("location.hash='#/home'")
        page.set_viewport_size({'width': 360, 'height': 740})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), '360px overflow'
        assert errors == [], 'Unexpected JS errors: ' + repr(errors)
        browser.close()
        print('Arcana Next language selector: 12 locales, persistence, mobile widths PASS')
finally:
    server.shutdown()
    server.server_close()
