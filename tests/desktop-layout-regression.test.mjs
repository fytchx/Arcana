import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SITE_STYLES} from '../src/css-bundle.mjs';

test('account and player profile use the bundled stylesheet before rendering',async()=>{
 const app=await readFile(new URL('../src/community-ui.js',import.meta.url),'utf8');
 assert.ok(SITE_STYLES.includes('community-archive.css'));
 assert.doesNotMatch(app,/<link\\s+rel="stylesheet"\\s+href="\\/community-archive\\.css/);
 assert.match(app,/class="arcAccountTabs"/);
 assert.match(app,/class="arcAccountQuick"/);
 const styles=await readFile(new URL('../community-archive.css',import.meta.url),'utf8');
 assert.match(styles,/\\.arcAccountTabs\\s*\\{/);
 assert.match(styles,/\\.arcAccountQuick\\s*\\{/);
 assert.ok(SITE_STYLES.indexOf('community-archive.css')<SITE_STYLES.indexOf('desktop-responsive.css'));
});

test('desktop layout expands guide and account pages without overriding mobile or homepage layout',async()=>{
 const css=await readFile(new URL('../desktop-responsive.css',import.meta.url),'utf8');
 assert.match(css,/@media\\s*\\(min-width:1024px\\)/);
 assert.match(css,/#content:not\\(\\.homeFullscreen\\)/);
 assert.match(css,/\\.wikiArticle/);
 assert.match(css,/\\.wikiCompleteGuide/);
 assert.match(css,/\\.communityPage/);
 assert.match(css,/\\.arcAccount/);
 assert.match(css,/grid-template-columns:repeat\\(3,minmax\\(0,1fr\\)\\)/);
 assert.doesNotMatch(css,/@media\\s*\\(max-width:/,'Keep small-screen rules in their existing stylesheets');
});
