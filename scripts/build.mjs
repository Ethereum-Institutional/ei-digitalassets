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
  for (const id of Object.keys(L.notes || {})) if (!ids.has(id) && !tokens.tokens.some(t => t.ticker === id)) errors.push(`${where}: note for unknown circle or token "${id}"`);
  for (const G of L.groups || []) for (const id of G.circles || []) if (!ids.has(id)) errors.push(`${where}: group "${G.id}" lists unknown circle "${id}"`);
}
// lens colours: red, amber and green are reserved for meaning (negative, caution, positive) and must use the exact
// tokens below; every other colour must be a neutral hue. Colours within one lens must stay distinguishable.
const SEMANTIC = { '#c81e1e': 'red', '#d97706': 'amber', '#15803d': 'green' };
const MIN_DE = 20;
const hsl = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const hue = d === 0 ? 0 : mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return [(hue + 360) % 360, d === 0 ? 0 : d / (1 - Math.abs(mx + mn - 1))]; };
const isSignal = h => { const [hue, sat] = hsl(h); return sat > 0.25 && (hue < 65 || hue > 330 || (hue >= 65 && hue < 178)); };
const lab = h => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const [x, y, z] = [(r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, r * 0.2126 + g * 0.7152 + b * 0.0722, (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883].map(f);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const deltaE = (h1, h2) => { // CIEDE2000
  const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2), rad = Math.PI / 180;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2, G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const A1 = a1 * (1 + G), A2 = a2 * (1 + G), C1 = Math.hypot(A1, b1), C2 = Math.hypot(A2, b2);
  const H1 = (Math.atan2(b1, A1) / rad + 360) % 360, H2 = (Math.atan2(b2, A2) / rad + 360) % 360;
  let dh = H2 - H1; if (Math.abs(dh) > 180) dh -= Math.sign(dh) * 360;
  const dH = 2 * Math.sqrt(C1 * C2) * Math.sin(dh * rad / 2), Lb = (L1 + L2) / 2, Cp = (C1 + C2) / 2;
  let hb = (H1 + H2) / 2; if (Math.abs(H1 - H2) > 180) hb += 180;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  const SL = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cp, SH = 1 + 0.015 * Cp * T;
  const RT = -2 * Math.sqrt(Cp ** 7 / (Cp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hb - 275) / 25) ** 2)) * rad);
  return Math.sqrt(((L2 - L1) / SL) ** 2 + ((C2 - C1) / SC) ** 2 + (dH / SH) ** 2 + RT * ((C2 - C1) / SC) * (dH / SH));
};
for (const L of lenses) {
  const cols = [['lens colour', L.color], ...(L.groups || []).map(G => [`group "${G.id}"`, G.color])].filter(([, c]) => /^#[0-9a-f]{6}$/i.test(c || ''));
  for (const [what, c] of cols) if (isSignal(c) && !SEMANTIC[c.toLowerCase()])
    errors.push(`lenses/${L.id}.yaml: ${what} ${c} reads as red, amber or green; use a neutral hue, or ${Object.entries(SEMANTIC).map(([k, v]) => `${v} ${k}`).join(', ')} only for that meaning`);
  for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
    const d = deltaE(cols[i][1], cols[j][1]);
    if (d < MIN_DE) errors.push(`lenses/${L.id}.yaml: ${cols[i][0]} ${cols[i][1]} and ${cols[j][0]} ${cols[j][1]} are too similar (ΔE ${d.toFixed(1)} < ${MIN_DE})`);
  }
}
// lens-only circles: a lens may mention (status, notes or groups) at most one of those that share a position
const lensOnly = circles.circles.filter(c => c.lens_only).map(c => c.id);
const mentions = L => new Set([...Object.keys(L.status || {}), ...Object.keys(L.notes || {}), ...(L.groups || []).flatMap(G => G.circles || [])]);
const lensById = Object.fromEntries(lenses.map(L => [L.id, L]));
for (const L of lenses) {
  const shown = lensOnly.filter(id => mentions(L).has(id));
  for (const a of shown) for (const b of shown) {
    const ga = layout.circles[a], gb = layout.circles[b];
    if (a < b && ga && gb && ga.cx === gb.cx && ga.cy === gb.cy) errors.push(`lenses/${L.id}.yaml: mentions both "${a}" and "${b}", which share a position; pick one`);
  }
}
// tokens licensed under a lens join the lens-only circle it shows; lens groups may also list token badges
const tickers = new Set(tokens.tokens.map(t => t.ticker));
for (const t of tokens.tokens) for (const lid of t.licensed_under || []) {
  if (!lensById[lid]) errors.push(`tokens.yaml: "${t.ticker}" is licensed under unknown lens "${lid}"`);
  else if (!lensOnly.some(id => mentions(lensById[lid]).has(id))) errors.push(`tokens.yaml: "${t.ticker}" is licensed under "${lid}", but that lens shows no licensed or recognised circle (${lensOnly.join(', ')})`);
}
for (const L of lenses) for (const G of L.groups || []) for (const tk of G.tokens || [])
  if (!tickers.has(tk)) errors.push(`lenses/${L.id}.yaml: group "${G.id}" lists unknown token "${tk}"`);
// bridges: waypoints that join a lens group's perimeter into one continuous outline, keyed "<lens>.<group>"
for (const [key, paths] of Object.entries(layout.bridges || {})) {
  const [lid, gid] = key.split('.');
  if (!(lensById[lid]?.groups || []).some(G => G.id === gid)) errors.push(`layout.yaml: bridge "${key}" names an unknown lens group`);
  for (const pts of Array.isArray(paths) ? paths : [null])
    if (!Array.isArray(pts) || pts.length < 2 || pts.some(p => !Array.isArray(p) || p.length !== 2)) errors.push(`layout.yaml: each corridor in bridge "${key}" needs two or more [x, y] points`);
}
if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push('site.yaml: contribute.repo must be a https://github.com/<owner>/<repo> URL');
if (errors.length) { console.error('Validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }

// ---------- version ----------
let version = process.env.TAXONOMY_VERSION || '';
if (!version) { try { version = execSync('git describe --tags --always --dirty', { cwd: root, stdio: ['ignore','pipe','ignore'] }).toString().trim(); } catch { version = 'dev'; } }
const stamp = new Date().toISOString().slice(0, 10);

// ---------- assemble ----------
const data = {
  palette: circles.palette, containers: circles.containers, children: circles.children, inherit_status: circles.inherit_status,
  circles: circles.circles.map(c => Object.assign({}, c, layout.circles[c.id])),
  tokens: tokens.tokens, lenses, version, bridges: layout.bridges || {},
};
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const heading = esc(site.heading.text).replace(esc(site.heading.italic), `<em>${esc(site.heading.italic)}</em>`);
let page = read('src/template.html')
  .replace('__DATA__', JSON.stringify(data).replace(/<\/script/gi, '<\\/script'))
  .replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', heading)
  .replace('__INTRO__', esc(site.intro)).replace('__LENS_HELP__', esc(site.lens_help)).replace('__FOOTNOTE__', esc(site.footnote))
  .replace('__NOTICE__', site.notice ? `<div class="ei-notice" role="note"><b>${esc(site.notice.title)}</b> ${esc(site.notice.text)}</div>` : '')
  .replace('__CONTRIBUTE__', site.contribute ? `<div class="ei-contrib"><p><b>${esc(site.contribute.title)}</b> ${esc(site.contribute.text)}</p>`
    + `<p class="links"><a href="${site.contribute.repo}/issues/new/choose">Open an issue</a><a href="${site.contribute.repo}/pulls">Pull requests</a><a href="${site.contribute.repo}">View on GitHub</a></p></div>` : '')
  .replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/digital-asset-taxonomy.html'), page);
// Artifact variant: same page without the document skeleton (for hosts that wrap the fragment themselves)
const head = page.slice(page.indexOf('<title>'), page.indexOf('</style>') + 8);
const body = page.slice(page.indexOf('<body>') + 6, page.lastIndexOf('</body>'));
fs.writeFileSync(path.join(root, 'dist/digital-asset-taxonomy.fragment.html'), head + '\n' + body);
fs.writeFileSync(path.join(root, 'dist/index.html'), page);
console.log(`Built dist/ (${circles.circles.length} circles, ${lenses.length} lenses, ${tokens.tokens.length} tokens), version ${version}`);
