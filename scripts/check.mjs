#!/usr/bin/env node
// Smoke test: opens the built page in headless Chromium, checks for JS errors, that every circle rendered,
// and that every lens applies without error. Also writes dist/preview.png for pull-request review.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const file = 'file://' + path.join(root, 'dist/digital-asset-taxonomy.html');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(file); await page.waitForTimeout(400);
const nodes = await page.locator('svg .node').count();
const expected = JSON.parse(fs.readFileSync(path.join(root, 'dist/digital-asset-taxonomy.html'), 'utf8').match(/const DATA = (\{.*?\});\n/s)[1]).circles.length;
if (nodes !== expected) errors.push(`rendered ${nodes} circles, expected ${expected}`);
for (const sel of ['#ei-lens-global', '#ei-lens-jur']) {
  const values = await page.locator(sel + ' option').evaluateAll(os => os.map(o => o.value).filter(Boolean));
  for (const v of values) { await page.selectOption(sel, v); await page.waitForTimeout(60); }
  await page.selectOption(sel, '');
}
await page.screenshot({ path: path.join(root, 'dist/preview.png'), fullPage: true });
await browser.close();
if (errors.length) { console.error('Check failed:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`Check passed: ${nodes} circles rendered, all lenses applied, dist/preview.png written`);
