#!/usr/bin/env node
// Builds dist/ from data/*.yaml + src/template.html. No external services; deterministic output.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const yml = p => parse(read(p));

const circles = yml('data/circles.yaml');
const layout  = yml('data/layout.yaml');
const tokens  = yml('data/tokens.yaml');
const site    = yml('data/site.yaml');
const lensDir = path.join(root, 'data/lenses');
const lenses  = fs.readdirSync(lensDir).filter(f => f.endsWith('.yaml')).sort()
  .map(f => parse(fs.readFileSync(path.join(lensDir, f), 'utf8')));

// ---------- validation ----------
const errors = [];
const ids = new Set(circles.circles.map(c => c.id));
for (const c of circles.circles) {
  if (!layout.circles[c.id]) errors.push(`layout.yaml: no geometry for circle "${c.id}"`);
  if (!c.desc) errors.push(`circles.yaml: "${c.id}" has no definition (desc)`);
  if (c.family && !circles.palette[c.family]) errors.push(`circles.yaml: "${c.id}" uses unknown palette family "${c.family}"`);
  if (c.clip && !ids.has(c.clip)) errors.push(`circles.yaml: "${c.id}" clips to unknown circle "${c.clip}"`);
}
for (const id of Object.keys(layout.circles)) if (!ids.has(id)) errors.push(`layout.yaml: geometry for unknown circle "${id}"`);
for (const id of circles.containers) if (!ids.has(id)) errors.push(`circles.yaml: containers lists unknown circle "${id}"`);
for (const [p, ks] of Object.entries(circles.children)) {
  if (!ids.has(p)) errors.push(`circles.yaml: children of unknown circle "${p}"`);
  for (const k of ks) if (!ids.has(k)) errors.push(`circles.yaml: "${p}" lists unknown child "${k}"`);
}
for (const t of tokens.tokens) if (!ids.has(t.circle)) errors.push(`tokens.yaml: "${t.ticker}" placed in unknown circle "${t.circle}"`);
const seen = new Set();
for (const L of lenses) {
  const where = `lenses/${L.id}.yaml`;
  if (seen.has(L.id)) errors.push(`${where}: duplicate lens id`); seen.add(L.id);
  for (const k of ['id','group','menu','name','short','color','intro']) if (!L[k]) errors.push(`${where}: missing "${k}"`);
  if (!['standard-setter','jurisdiction'].includes(L.group)) errors.push(`${where}: group must be standard-setter or jurisdiction`);
  for (const [id, st] of Object.entries(L.status || {})) {
    if (!ids.has(id)) errors.push(`${where}: status for unknown circle "${id}"`);
    if (!['in','part','out'].includes(st)) errors.push(`${where}: status "${st}" for "${id}" must be in | part | out`);
  }
  for (const id of Object.keys(L.notes || {})) if (!ids.has(id)) errors.push(`${where}: note for unknown circle "${id}"`);
  for (const G of L.groups || []) for (const id of G.circles || []) if (!ids.has(id)) errors.push(`${where}: group "${G.id}" lists unknown circle "${id}"`);
}
if (errors.length) { console.error('Validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }

// ---------- version ----------
let version = process.env.TAXONOMY_VERSION || '';
if (!version) { try { version = execSync('git describe --tags --always --dirty', { cwd: root, stdio: ['ignore','pipe','ignore'] }).toString().trim(); } catch { version = 'dev'; } }
const stamp = new Date().toISOString().slice(0, 10);

// ---------- assemble ----------
const data = {
  palette: circles.palette, containers: circles.containers, children: circles.children, inherit_status: circles.inherit_status,
  circles: circles.circles.map(c => Object.assign({}, c, layout.circles[c.id])),
  tokens: tokens.tokens, lenses, version,
};
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const heading = esc(site.heading.text).replace(esc(site.heading.italic), `<em>${esc(site.heading.italic)}</em>`);
let page = read('src/template.html')
  .replace('__DATA__', JSON.stringify(data).replace(/<\/script/gi, '<\\/script'))
  .replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', heading)
  .replace('__INTRO__', esc(site.intro)).replace('__LENS_HELP__', esc(site.lens_help)).replace('__FOOTNOTE__', esc(site.footnote))
  .replace('__NOTICE__', site.notice ? `<div class="ei-notice" role="note"><b>${esc(site.notice.title)}</b> ${esc(site.notice.text)}</div>` : '')
  .replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/digital-asset-taxonomy.html'), page);
// Artifact variant: same page without the document skeleton (for hosts that wrap the fragment themselves)
const head = page.slice(page.indexOf('<title>'), page.indexOf('</style>') + 8);
const body = page.slice(page.indexOf('<body>') + 6, page.lastIndexOf('</body>'));
fs.writeFileSync(path.join(root, 'dist/digital-asset-taxonomy.fragment.html'), head + '\n' + body);
fs.writeFileSync(path.join(root, 'dist/index.html'), page);
console.log(`Built dist/ (${circles.circles.length} circles, ${lenses.length} lenses, ${tokens.tokens.length} tokens) — version ${version}`);
