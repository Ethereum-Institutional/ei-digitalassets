#!/usr/bin/env node
// Builds dist/ from data/*.yaml + src/template.html. No external services; deterministic output.
// Each entry in PAGES is one page: a data directory with the same file layout, rendered through the one template.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const PAGES = [
  { dir: 'data/home', out: '' },                             // landing page (static: cards linking to each map)
  { dir: 'data/web3', out: 'web3' },                         // work in progress (static stub)
  { dir: 'data', out: 'taxonomy' },                          // Digital Asset Taxonomy
  { dir: 'data/networks', out: 'networks' },                 // Digital Asset Networks
  { dir: 'data/decentralization', out: 'decentralization' }, // work in progress (static stub)
  { dir: 'data/privacy', out: 'privacy' },                   // work in progress (static stub)
  { dir: 'data/identity', out: 'identity' },                 // work in progress (static stub)
];
const NAV = parse(read('data/nav.yaml')).pages; // shared navigation; links are made relative per page

// ---------- load ----------
function load(dir) {
  const yml = p => parse(read(path.join(dir, p)));
  const site = yml('site.yaml');
  if (site.kind === 'static') return { dir, site, static: true };
  const circles = yml('circles.yaml'), layout = yml('layout.yaml');
  // badges: tokens.yaml (ticker chips) or networks.yaml (named pills); either way each badge has a `ticker` key
  const badgeFile = ['tokens.yaml', 'networks.yaml'].find(f => fs.existsSync(path.join(root, dir, f)));
  const raw = badgeFile ? yml(badgeFile) : {};
  const tokens = { tokens: (raw.tokens || raw.networks || []).map(t => Object.assign({ ticker: t.ticker || t.id }, t)) };
  const lensDir = path.join(root, dir, 'lenses');
  const lenses = fs.existsSync(lensDir) ? fs.readdirSync(lensDir).filter(f => f.endsWith('.yaml')).sort()
    .map(f => parse(fs.readFileSync(path.join(lensDir, f), 'utf8'))) : [];
  return { dir, circles, layout, tokens, site, lenses };
}

// ---------- validation ----------
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

function validateStatic({ dir, site }) {
  const errors = [], where = f => `${dir}/${f}`;
  for (const k of ['title', 'eyebrow', 'intro', 'footnote']) if (!site[k]) errors.push(`${where('site.yaml')}: missing "${k}"`);
  if (!site.heading?.text) errors.push(`${where('site.yaml')}: missing heading.text`);
  for (const c of site.cards || []) {
    if (!NAV.some(n => n.path === c.path)) errors.push(`${where('site.yaml')}: card path "${c.path}" is not in data/nav.yaml`);
    if (!c.title || !c.text) errors.push(`${where('site.yaml')}: every card needs a title and text`);
  }
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  return errors;
}
function validate(page) {
  if (page.static) return validateStatic(page);
  const { dir, circles, layout, tokens, site, lenses } = page;
  const errors = [];
  const where = f => `${dir}/${f}`;
  const ids = new Set(circles.circles.map(c => c.id));
  for (const c of circles.circles) {
    if (!layout.circles[c.id]) errors.push(`${where('layout.yaml')}: no geometry for circle "${c.id}"`);
    if (!c.desc) errors.push(`${where('circles.yaml')}: "${c.id}" has no definition (desc)`);
    if (c.family && !circles.palette[c.family]) errors.push(`${where('circles.yaml')}: "${c.id}" uses unknown palette family "${c.family}"`);
    if (c.clip && !ids.has(c.clip)) errors.push(`${where('circles.yaml')}: "${c.id}" clips to unknown circle "${c.clip}"`);
  }
  for (const id of Object.keys(layout.circles)) if (!ids.has(id)) errors.push(`${where('layout.yaml')}: geometry for unknown circle "${id}"`);
  for (const c of circles.circles) if (c.zoom && !(Array.isArray(c.zoom) && c.zoom.length === 2 && c.zoom.every(v => typeof v === 'number'))) errors.push(`${where('circles.yaml')}: "${c.id}" zoom must be [x0, x1]`);
  for (const c of circles.circles) if (c.expand) {
    if (!['collapsed', 'expanded'].includes(c.expand)) errors.push(`${where('circles.yaml')}: "${c.id}" expand must be collapsed or expanded`);
    const g = layout.circles[c.id]?.collapsed;
    if (!g || ['cx', 'cy', 'rx', 'ry', 'lx', 'ly'].some(k => typeof g[k] !== 'number')) errors.push(`${where('layout.yaml')}: expandable circle "${c.id}" needs collapsed: {cx, cy, rx, ry, lx, ly}`);
  }
  for (const id of circles.containers || []) if (!ids.has(id)) errors.push(`${where('circles.yaml')}: containers lists unknown circle "${id}"`);
  for (const [p, ks] of Object.entries(circles.children || {})) {
    if (!ids.has(p)) errors.push(`${where('circles.yaml')}: children of unknown circle "${p}"`);
    for (const k of ks) if (!ids.has(k)) errors.push(`${where('circles.yaml')}: "${p}" lists unknown child "${k}"`);
  }
  for (const a of layout.annotations || []) {
    if (!['caption', 'connector'].includes(a.kind)) errors.push(`${where('layout.yaml')}: annotation kind "${a.kind}" must be caption or connector`);
    if (a.circle && !ids.has(a.circle)) errors.push(`${where('layout.yaml')}: annotation for unknown circle "${a.circle}"`);
  }
  const tickers = new Set(tokens.tokens.map(t => t.ticker));
  if (tickers.size !== tokens.tokens.length) errors.push(`${where('badges')}: duplicate badge ids: ${tokens.tokens.map(t => t.ticker).filter((t, i, a) => a.indexOf(t) !== i).join(', ')}`);
  for (const t of tokens.tokens) {
    if (!ids.has(t.circle)) errors.push(`${where('badges')}: "${t.ticker}" placed in unknown circle "${t.circle}"`);
    if (!t.name || !t.desc) errors.push(`${where('badges')}: "${t.ticker}" needs a name and a desc`);
  }
  const groupIds = (site.lens_groups || []).map(g => g.id);
  if (lenses.length && !groupIds.length) errors.push(`${where('site.yaml')}: lens_groups must list the dropdowns (id, label)`);
  const seen = new Set();
  for (const L of lenses) {
    const lw = where(`lenses/${L.id}.yaml`);
    if (seen.has(L.id)) errors.push(`${lw}: duplicate lens id`); seen.add(L.id);
    for (const k of ['id','group','menu','name','short','color','intro']) if (!L[k]) errors.push(`${lw}: missing "${k}"`);
    if (!groupIds.includes(L.group)) errors.push(`${lw}: group must be one of ${groupIds.join(', ')}`);
    if (L.scope && L.scope !== 'networks') errors.push(`${lw}: scope must be omitted or "networks"`);
    for (const [id, st] of Object.entries(L.status || {})) {
      if (!ids.has(id)) errors.push(`${lw}: status for unknown circle "${id}"`);
      if (!['in','part','out'].includes(st)) errors.push(`${lw}: status "${st}" for "${id}" must be in | part | out`);
    }
    for (const id of Object.keys(L.notes || {})) if (!ids.has(id) && !tickers.has(id)) errors.push(`${lw}: note for unknown circle or badge "${id}"`);
    for (const G of L.groups || []) {
      for (const id of G.circles || []) if (!ids.has(id)) errors.push(`${lw}: group "${G.id}" lists unknown circle "${id}"`);
      for (const tk of G.tokens || []) if (!tickers.has(tk)) errors.push(`${lw}: group "${G.id}" lists unknown badge "${tk}"`);
    }
    // networks-scope lenses highlight badges rather than circles: `networks` lists the badges to keep, each a known id
    const netCircles = new Set(circles.circles.filter(c => c.pill).map(c => c.id));
    for (const [tk, st] of Object.entries(L.networks || {})) {
      if (!tickers.has(tk) && !netCircles.has(tk)) errors.push(`${lw}: networks lists unknown badge or network circle "${tk}"`);
      if (!['in','part'].includes(st)) errors.push(`${lw}: networks status "${st}" for "${tk}" must be in | part`);
    }
    if (L.scope === 'networks' && !L.networks) errors.push(`${lw}: a networks-scope lens needs a "networks" map`);
    const cols = [['lens colour', L.color], ...(L.groups || []).map(G => [`group "${G.id}"`, G.color])].filter(([, c]) => /^#[0-9a-f]{6}$/i.test(c || ''));
    for (const [what, c] of cols) if (isSignal(c) && !SEMANTIC[c.toLowerCase()])
      errors.push(`${lw}: ${what} ${c} reads as red, amber or green; use a neutral hue, or ${Object.entries(SEMANTIC).map(([k, v]) => `${v} ${k}`).join(', ')} only for that meaning`);
    for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
      const d = deltaE(cols[i][1], cols[j][1]);
      if (d < MIN_DE) errors.push(`${lw}: ${cols[i][0]} ${cols[i][1]} and ${cols[j][0]} ${cols[j][1]} are too similar (ΔE ${d.toFixed(1)} < ${MIN_DE})`);
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
      if (a < b && ga && gb && ga.cx === gb.cx && ga.cy === gb.cy) errors.push(`${where(`lenses/${L.id}.yaml`)}: mentions both "${a}" and "${b}", which share a position; pick one`);
    }
  }
  // tokens licensed under a lens join the lens-only circle it shows
  for (const t of tokens.tokens) for (const lid of t.licensed_under || []) {
    if (!lensById[lid]) errors.push(`${where('badges')}: "${t.ticker}" is licensed under unknown lens "${lid}"`);
    else if (!lensOnly.some(id => mentions(lensById[lid]).has(id))) errors.push(`${where('badges')}: "${t.ticker}" is licensed under "${lid}", but that lens shows no licensed or recognised circle (${lensOnly.join(', ')})`);
  }
  // bridges: waypoints that join a lens group's perimeter into one continuous outline, keyed "<lens>.<group>"
  for (const [key, paths] of Object.entries(layout.bridges || {})) {
    const [lid, gid] = key.split('.');
    if (!(lensById[lid]?.groups || []).some(G => G.id === gid)) errors.push(`${where('layout.yaml')}: bridge "${key}" names an unknown lens group`);
    for (const pts of Array.isArray(paths) ? paths : [null])
      if (!Array.isArray(pts) || pts.length < 2 || pts.some(p => !Array.isArray(p) || p.length !== 2)) errors.push(`${where('layout.yaml')}: each corridor in bridge "${key}" needs two or more [x, y] points`);
  }
  for (const k of ['title', 'eyebrow', 'intro', 'lens_help', 'footnote']) if (!site[k]) errors.push(`${where('site.yaml')}: missing "${k}"`);
  if (!site.heading?.text) errors.push(`${where('site.yaml')}: missing heading.text`);
  if (site.badge && !['disc', 'pill'].includes(site.badge)) errors.push(`${where('site.yaml')}: badge must be disc or pill`);
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  for (const n of site.nav || []) if (!n.label) errors.push(`${where('site.yaml')}: every nav item needs a label`);
  for (const l of site.legend || []) if (!['pill', 'mark', 'rings', 'expand'].includes(l.kind) || !l.text) errors.push(`${where('site.yaml')}: legend items need kind (pill | mark | rings | expand) and text`);
  for (const t of tokens.tokens) if (t.mark && !/^[A-Z]{2,4}$/.test(t.mark)) errors.push(`${where('badges')}: "${t.ticker}" mark must be 2 to 4 capital letters`);
  for (const t of tokens.tokens) if (t.kind && !['network', 'participant'].includes(t.kind)) errors.push(`${where('badges')}: "${t.ticker}" kind must be network or participant`);
  for (const x of [...circles.circles, ...tokens.tokens]) for (const s of x.sources || [])
    if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${where('data')}: source on "${x.id || x.ticker}" needs a title and a URL`);
  return errors;
}

// ---------- version ----------
let version = process.env.TAXONOMY_VERSION || '';
if (!version) { try { version = execSync('git describe --tags --always --dirty', { cwd: root, stdio: ['ignore','pipe','ignore'] }).toString().trim(); } catch { version = 'dev'; } }
const stamp = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

// ---------- assemble ----------
const TAG = '<span class="ei-tag">in progress</span>';
const relHref = (from, to) => from === '' ? (to ? `${to}/` : './') : (to === '' ? '../' : `../${to}/`);
const navHtml = out => `<nav class="ei-nav" aria-label="Pages">${NAV.map(n => n.path === out
  ? `<span class="cur" aria-current="page">${esc(n.label)}${n.wip ? TAG : ''}</span>`
  : `<a href="${relHref(out, n.path)}">${esc(n.label)}${n.wip ? TAG : ''}</a>`).join('')}</nav>`;
const shared = site => ({
  heading: site.heading.italic ? esc(site.heading.text).replace(esc(site.heading.italic), `<em>${esc(site.heading.italic)}</em>`) : esc(site.heading.text),
  notice: site.notice ? `<div class="ei-notice" role="note"><b>${esc(site.notice.title)}</b> ${esc(site.notice.text)}</div>` : '',
  contribute: site.contribute ? `<div class="ei-contrib"><p><b>${esc(site.contribute.title)}</b> ${esc(site.contribute.text)}</p>`
    + `<p class="links"><a href="${site.contribute.repo}/issues/new/choose">Open an issue</a><a href="${site.contribute.repo}/pulls">Pull requests</a><a href="${site.contribute.repo}">View on GitHub</a></p></div>` : '',
});
function renderStatic({ site, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const sh = shared(site);
  const body = site.cards
    ? `<div class="ei-cards">${site.cards.map(c => { const n = NAV.find(x => x.path === c.path);
        return `<a class="ei-card" href="${relHref(out, c.path)}"><h2>${esc(c.title)}${n?.wip ? ' ' + TAG : ''}</h2><p>${esc(c.text)}</p><span class="go">${n?.wip ? 'See the plan' : 'Open the map'} →</span></a>`; }).join('')}</div>`
    : `<div class="ei-wip">This map is being drafted and will appear here. Follow progress, or suggest what it should cover, on GitHub.</div>`;
  return read('src/static.html')
    .replace('__STYLE__', style).replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', sh.heading)
    .replace('__INTRO__', esc(site.intro)).replace('__NAV__', navHtml(out)).replace('__BODY__', body).replace('__NOTICE__', sh.notice)
    .replace('__CONTRIBUTE__', sh.contribute).replace('__FOOTNOTE__', esc(site.footnote)).replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}
function render({ circles, layout, tokens, site, lenses, out }) {
  const data = {
    palette: circles.palette, containers: circles.containers || [], children: circles.children || {}, inherit_status: circles.inherit_status || {},
    circles: circles.circles.map(c => Object.assign({}, c, layout.circles[c.id])),
    tokens: tokens.tokens, lenses, version, bridges: layout.bridges || {}, annotations: layout.annotations || [],
    lens_groups: site.lens_groups || [], badge: site.badge || 'disc',
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a circle to preview how Ethereum Institutional defines it; click to pin the definition here.' },
  };
  const sh = shared(site), heading = sh.heading, nav = navHtml(out);
  const swatch = l => l.kind === 'pill'
    ? `<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="${esc(l.color || '#14130f')}"/></svg>`
    : l.kind === 'expand'
    ? `<svg width="40" height="18" aria-hidden="true"><ellipse cx="17" cy="9" rx="15" ry="7" fill="#e3e7ea" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><text x="36" y="13" text-anchor="middle" font-size="12" font-weight="600" fill="#615f5a">+</text></svg>`
    : l.kind === 'mark'
    ? `<svg width="40" height="18" aria-hidden="true"><rect x="1" y="4" width="28" height="12" rx="6" fill="#6b6760"/><circle cx="30" cy="8" r="7.5" fill="${esc(l.color || '#14130f')}" stroke="#f8f6f2" stroke-width="1.5"/><text x="30" y="10" text-anchor="middle" font-size="5" font-weight="700" fill="#f2efe9">ETH</text></svg>`
    : `<svg width="22" height="18" aria-hidden="true"><ellipse cx="11" cy="9" rx="10" ry="8" fill="none" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><ellipse cx="11" cy="9" rx="6" ry="4.8" fill="none" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><circle cx="11" cy="9" r="2" fill="${esc(l.color || '#14130f')}"/></svg>`;
  const legend = (site.legend || []).length ? `<div class="ei-legend">${site.legend.map(l => `<span>${swatch(l)} ${esc(l.text)}</span>`).join('')}</div>` : '';
  return read('src/template.html')
    .replace('__DATA__', JSON.stringify(data).replace(/<\/script/gi, '<\\/script'))
    .replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', heading)
    .replace('__INTRO__', esc(site.intro) + (site.intro_more ? ` <button type="button" class="ei-more" aria-expanded="false" aria-controls="ei-intro-more" data-more="${esc(site.intro_more_label || 'More')}" data-less="${esc(site.intro_less_label || 'Less')}">${esc(site.intro_more_label || 'More')}</button>` : ''))
    .replace('__INTRO_MORE__', site.intro_more ? `<p class="sub more" id="ei-intro-more" hidden>${esc(site.intro_more)}</p>` : '')
    .replace('__LENS_TITLE__', esc(site.lens_title || 'Regulatory lenses')).replace('__LENS_HELP__', esc(site.lens_help))
    .replace('__FOOTNOTE__', esc(site.footnote)).replace('__SVG_LABEL__', esc(site.svg_label || `Venn diagram: ${site.title}`))
    .replace('__PANEL_TITLE__', esc(data.panel.title)).replace('__PANEL_TEXT__', esc(data.panel.text))
    .replace('__NAV__', nav).replace('__LEGEND__', legend)
    .replace('__NOTICE__', sh.notice).replace('__CONTRIBUTE__', sh.contribute)
    .replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}

const pages = PAGES.filter(p => fs.existsSync(path.join(root, p.dir, 'site.yaml'))).map(p => Object.assign(p, load(p.dir)));
const errors = pages.flatMap(validate);
if (errors.length) { console.error('Validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }

for (const p of pages) {
  const outDir = path.join(root, 'dist', p.out);
  fs.mkdirSync(outDir, { recursive: true });
  if (p.static) { fs.writeFileSync(path.join(outDir, 'index.html'), renderStatic(p)); console.log(`Built ${path.join('dist', p.out, 'index.html')} (static page)`); continue; }
  const page = render(p), slug = p.site.slug || 'digital-asset-taxonomy';
  fs.writeFileSync(path.join(root, 'dist', `${slug}.html`), page);
  // Artifact variant: same page without the document skeleton (for hosts that wrap the fragment themselves)
  const head = page.slice(page.indexOf('<title>'), page.indexOf('</style>') + 8);
  const body = page.slice(page.indexOf('<body>') + 6, page.lastIndexOf('</body>'));
  fs.writeFileSync(path.join(root, 'dist', `${slug}.fragment.html`), head + '\n' + body);
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(`Built ${path.join('dist', p.out, 'index.html')} (${p.circles.circles.length} circles, ${p.lenses.length} lenses, ${p.tokens.tokens.length} badges), version ${version}`);
}
