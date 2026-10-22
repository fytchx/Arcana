import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Windows native dropdown options have visible dark popup and bright text', async()=>{
 const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');
 const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(index,/<link rel="stylesheet" href="\/styles\.css">/);
 assert.match(css,/html select\s*\{\s*color-scheme:dark\s*;/);
 assert.match(css,/html select option,\s*html select optgroup\s*\{[^}]*background-color:\s*#191e2b\s*;[^}]*color:\s*#f5f5fb\s*;/s);
 assert.match(css,/@media\s*\(forced-colors:active\)[\s\S]*color:CanvasText;[\s\S]*background-color:Canvas;/);
 // Native select elements remain keyboard accessible and avoid dropdown overlays.
 const pathfinder=await readFile(new URL('../src/pathfinder-timeline-view.js',import.meta.url),'utf8');
 assert.match(pathfinder,/<select data-path-to-stage/);
 assert.match(pathfinder,/<select data-path-to-level/);
});
