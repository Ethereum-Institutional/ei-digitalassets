#!/usr/bin/env node
// Smoke test: opens each built page in headless Chromium, checks for JS errors, that every circle rendered,
// and that every lens applies without error. Also writes a preview PNG per page for pull-request review.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PAGES = [['dist/digital-asset-taxonomy.html', 'dist/preview.png'], ['dist/digital-asset-networks.html', 'dist/networks/preview.png'], ['dist/web3.html', 'dist/web3/preview.png']];
const browser = await chromium.launch();
const errors = [];
for (const [html, png] of PAGES) {
  if (!fs.existsSync(path.join(root, html))) continue;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });
  page.on('pageerror', e => errors.push(`${html}: ${e}`));
  await page.goto('file://' + path.join(root, html)); await page.waitForTimeout(400);
  const nodes = await page.locator('svg .node').count();
  const d = JSON.parse(fs.readFileSync(path.join(root, html), 'utf8').match(/const DATA = (\{.*?\});\n/s)[1]);
  // map pages: one node per circle; radial pages: one per ring handle, one per cell and one per hub wedge
  const expected = d.circles ? d.circles.length : d.rings.length * (d.themes.length + 1) + d.themes.length;
  if (nodes !== expected) errors.push(`${html}: rendered ${nodes} circles, expected ${expected}`);
  const sels = await page.locator('#ei-lens select').evaluateAll(ss => ss.map(s => s.id));
  for (const id of sels) {
    const values = await page.locator('#' + id + ' option').evaluateAll(os => os.map(o => o.value).filter(Boolean));
    for (const v of values) { await page.selectOption('#' + id, v); await page.waitForTimeout(60); }
    await page.selectOption('#' + id, '');
  }
  await page.screenshot({ path: path.join(root, png), fullPage: true });
  await page.close();
  console.log(`${html}: ${nodes} circles rendered, ${sels.length} lens menus applied, ${png} written`);
}
await browser.close();
if (errors.length) { console.error('Check failed:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('Check passed');
