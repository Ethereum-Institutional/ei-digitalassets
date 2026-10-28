#!/usr/bin/env node
// Builds dist/ from the YAML under data/ and the templates in src/. No external services; deterministic output.
// Each entry in PAGES is one page: a data directory with the same file layout, rendered through the one template.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const PAGES = [
  { dir: 'data/home', out: '' },                             // landing page (static: cards linking to each map)
  { dir: 'data/web3', out: 'web3' },                         // Web3: three generations of the web
  { dir: 'data/taxonomy', out: 'taxonomy' },                 // Digital Asset Taxonomy
  { dir: 'data/networks', out: 'networks' },                 // Digital Asset Networks
  { dir: 'data/scenarios', out: 'scenarios' },               // scenario index (filterable list)
  { dir: 'data/scenarios/dvp-deposit-token-tmmf', out: 'scenarios/dvp-deposit-token-tmmf' }, // first scenario
  { dir: 'data/architecture', out: 'architecture' },         // Architecture: components of a digital asset team
  { dir: 'data/decentralization', out: 'decentralization' }, // work in progress (static stub)
  { dir: 'data/privacy', out: 'privacy' },                   // work in progress (static stub)
  { dir: 'data/identity', out: 'identity' },                 // work in progress (static stub)
  { dir: 'data/quantum', out: 'quantum' },                   // work in progress (static stub with planned sections)
  { dir: 'data/quantum/algorithms', out: 'quantum/algorithms' },
  { dir: 'data/quantum/ledger', out: 'quantum/ledger' },
  { dir: 'data/quantum/roadmap', out: 'quantum/roadmap' },
  { dir: 'data/quantum/institution', out: 'quantum/institution' },
];
const NAV = parse(read('data/nav.yaml')).pages; // shared navigation; links are made relative per page
// Due diligence pages: every data/architecture/systems/<id>/system.yaml becomes a page at architecture/<id>.
// Contributors add a folder; there is no list to edit here.
const SYS_DIR = 'data/architecture/systems';
const SYSTEMS = fs.existsSync(path.join(root, SYS_DIR)) ? fs.readdirSync(path.join(root, SYS_DIR))
  .filter(d => fs.existsSync(path.join(root, SYS_DIR, d, 'system.yaml')))
  .map(d => Object.assign(parse(read(`${SYS_DIR}/${d}/system.yaml`)) || {}, { id: d, dir: `${SYS_DIR}/${d}`, out: `architecture/${d}` }))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id)) : [];
for (const s of SYSTEMS) PAGES.push({ dir: s.dir, out: s.out, sys: s });
const blurb = t => { const s = String(t).split(/(?<=\.) /)[0]; if (s.length <= 130) return s; const c = s.slice(0, 128); return c.slice(0, c.lastIndexOf(' ')).replace(/[,:;]$/, '') + '…'; };
const ARCH_SITE = (() => { let m; return () => m || (m = parse(read('data/architecture/site.yaml'))); })();
function ddqListHtml(out, except) {
  const G = ARCH_SITE().ddq?.groups || {};
  return `<div class="ei-ddq">${Object.entries(G).map(([g, label]) => { const list = SYSTEMS.filter(x => x.group === g && x.id !== except);
    return list.length ? `<section><h3>${esc(label)}</h3><ul>${list.map(x => `<li><a href="${relHref(out, x.out)}"><b>${esc(x.title)}</b><span>${esc(x.tagline || '')}</span><em>${qCount(x)}</em></a></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`;
}
const ARCH = (() => { let m; return () => m || (m = parse(read('data/architecture/architecture.yaml'))); })();
const qCount = s => (s.sections || []).reduce((n, sec) => n + (sec.questions || []).length, 0);

// ---------- load ----------
function load(dir) {
  const yml = p => parse(read(path.join(dir, p)));
  const site = yml('site.yaml');
  if (site.kind === 'static') return { dir, site, static: true };
  // index pages list scenarios with filters; scenario pages hold one scenario (actors, steps, tokens, standards)
  if (site.kind === 'index') return { dir, site, index: true };
  if (site.kind === 'architecture') return { dir, site, arch: true, map: yml('architecture.yaml'), layout: yml('layout.yaml'), overview: yml('overview.yaml') };
  if (site.kind === 'scenario') return { dir, site, scenario: true, sc: yml('scenario.yaml') };
  // radial pages: concentric rings (rings.yaml) cut into theme wedges (themes.yaml) around a hub; geometry in layout.yaml
  // gauges pages use the radial data files (rings = levels, themes = properties, lenses) with a dial per property
  if (site.kind === 'radial' || site.kind === 'gauges') {
    const lensDir = path.join(root, dir, 'lenses');
    const lenses = fs.existsSync(lensDir) ? fs.readdirSync(lensDir).filter(f => f.endsWith('.yaml')).sort().map(f => parse(fs.readFileSync(path.join(lensDir, f), 'utf8'))) : [];
    const layout = fs.existsSync(path.join(root, dir, 'layout.yaml')) ? yml('layout.yaml') : null;
    return { dir, site, radial: true, gauges: site.kind === 'gauges', rings: yml('rings.yaml'), themes: yml('themes.yaml'), layout, lenses };
  }
  const circles = yml('circles.yaml'), layout = yml('layout.yaml');
  // badges: tokens.yaml (ticker chips) or networks.yaml (named pills); either way each badge has a `ticker` key
  const badgeFile = ['tokens.yaml', 'networks.yaml', 'badges.yaml'].find(f => fs.existsSync(path.join(root, dir, f)));
  const raw = badgeFile ? yml(badgeFile) : {};
  const tokens = { tokens: (raw.tokens || raw.networks || raw.badges || []).map(t => Object.assign({ ticker: t.ticker || t.id }, t)) };
  const lensDir = path.join(root, dir, 'lenses');
  const lenses = fs.existsSync(lensDir) ? fs.readdirSync(lensDir).filter(f => f.endsWith('.yaml')).sort()
    .map(f => parse(fs.readFileSync(path.join(lensDir, f), 'utf8'))) : [];
  return { dir, circles, layout, tokens, site, lenses };
}

// ---------- validation ----------
// lens colors: red, amber and green are reserved for meaning (negative, caution, positive) and must use the exact
// tokens below; every other color must be a neutral hue. Colors within one lens must stay distinguishable.
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
    if (!NAV.some(n => n.path === c.path) && !PAGES.some(p => p.out === c.path)) errors.push(`${where('site.yaml')}: card path "${c.path}" is not a page`);
    if (!c.title || !c.text) errors.push(`${where('site.yaml')}: every card needs a title and text`);
    if (c.icon && !GLYPHS[c.icon]) errors.push(`${where('site.yaml')}: card "${c.title}" names unknown icon "${c.icon}"`);
  }
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  for (const sec of site.sections || []) { if (!sec.title) errors.push(`${where('site.yaml')}: every section needs a title`);
    for (const it of sec.items || []) { if (!it.title || !it.text) errors.push(`${where('site.yaml')}: section "${sec.title}" items need title and text`);
      if (it.more && !/^https?:\/\//.test(it.more.url || '')) errors.push(`${where('site.yaml')}: "more" on "${it.title}" needs a URL`);
      for (const x of it.sources || []) if (!x.title || !/^https?:\/\//.test(x.url || '')) errors.push(`${where('site.yaml')}: source on "${it.title}" needs a title and a URL`); } }
  return errors;
}
const LEGEND_KINDS = ['pill', 'mark', 'rings', 'expand'];
function validateRadial({ dir, site, rings, themes, layout, lenses, gauges }) {
  const errors = [], where = f => `${dir}/${f}`;
  for (const k of ['title', 'eyebrow', 'intro', 'footnote']) if (!site[k]) errors.push(`${where('site.yaml')}: missing "${k}"`);
  if (!site.heading?.text) errors.push(`${where('site.yaml')}: missing heading.text`);
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  for (const l of site.legend || []) if (!LEGEND_KINDS.includes(l.kind) || !l.text) errors.push(`${where('site.yaml')}: legend items need kind (${LEGEND_KINDS.join(' | ')}) and text`);
  const R = rings.rings || [], T = themes.themes || [];
  if (R.length < 2) errors.push(`${where('rings.yaml')}: needs at least two rings (inner to outer)`);
  if (!T.length) errors.push(`${where('themes.yaml')}: needs at least one theme`);
  const ringIds = new Set(R.map(r => r.id));
  if (ringIds.size !== R.length) errors.push(`${where('rings.yaml')}: duplicate ring ids`);
  for (const r of R) for (const k of ['id', 'label', 'sub', 'desc', 'fill', 'stroke']) if (!r[k]) errors.push(`${where('rings.yaml')}: ring "${r.id || '?'}" needs "${k}"`);
  if (!gauges) {
    for (const r of R) if (typeof layout.rings?.[r.id]?.r !== 'number') errors.push(`${where('layout.yaml')}: rings.${r.id}.r (outer radius) must be a number`);
  for (const id of Object.keys(layout.rings || {})) if (!ringIds.has(id)) errors.push(`${where('layout.yaml')}: geometry for unknown ring "${id}"`);
  const radii = R.map(r => layout.rings?.[r.id]?.r).filter(v => typeof v === 'number');
  if (radii.some((v, i) => i ? v <= radii[i - 1] : v <= (layout.hub || 0))) errors.push(`${where('layout.yaml')}: ring radii must increase from the hub outwards`);
  for (const k of ['cx', 'cy', 'hub']) if (typeof layout[k] !== 'number') errors.push(`${where('layout.yaml')}: "${k}" must be a number`);
  if (!layout.canvas?.width || !layout.canvas?.height) errors.push(`${where('layout.yaml')}: canvas needs width and height`);
  }
  if (site.default_lens && !(lenses || []).some(L => L.id === site.default_lens)) errors.push(`${where('site.yaml')}: default_lens "${site.default_lens}" is not a lens id`);
  for (const st of site.stats?.items || []) { if (!st.label || !st.value || !st.text) errors.push(`${where('site.yaml')}: every stats item needs label, value and text`);
    for (const x of st.sources || []) if (!x.title || !/^https?:\/\//.test(x.url || '')) errors.push(`${where('site.yaml')}: source on stat "${st.label}" needs a title and a URL`); }
  const themeIds = new Set(T.map(t => t.id));
  if (themeIds.size !== T.length) errors.push(`${where('themes.yaml')}: duplicate theme ids`);
  for (const t of T) {
    for (const k of ['id', 'label', 'desc']) if (!t[k]) errors.push(`${where('themes.yaml')}: theme "${t.id || '?'}" needs "${k}"`);
    if (t.weight !== undefined && !(typeof t.weight === 'number' && t.weight >= 0)) errors.push(`${where('themes.yaml')}: theme "${t.id}" weight must be a non-negative number`);
    for (const r of R) {
      const c = t.cells?.[r.id];
      if (!c) { errors.push(`${where('themes.yaml')}: theme "${t.id}" has no cell for ring "${r.id}"`); continue; }
      if (!c.name || !c.desc) errors.push(`${where('themes.yaml')}: cell ${t.id}.${r.id} needs a name and a desc`);
      for (const k of Object.keys(c)) if (!['name', 'sub', 'lines', 'sub_lines', 'desc', 'mark', 'sources'].includes(k)) errors.push(`${where('themes.yaml')}: cell ${t.id}.${r.id} has unknown key "${k}" (a comma inside an unquoted flow value?)`);
      if (c.mark && !/^[A-Z]{2,4}$/.test(c.mark)) errors.push(`${where('themes.yaml')}: cell ${t.id}.${r.id} mark must be 2 to 4 capital letters`);
    }
    for (const id of Object.keys(t.cells || {})) if (!ringIds.has(id)) errors.push(`${where('themes.yaml')}: theme "${t.id}" has a cell for unknown ring "${id}"`);
  }
  // lenses on a radial page: `cells` maps every theme to the ring where the lens lands; `notes` keyed by theme
  for (const L of lenses || []) {
    const lw = where(`lenses/${L.id || '?'}.yaml`);
    for (const k of ['id', 'name', 'color', 'intro']) if (!L[k]) errors.push(`${lw}: missing "${k}"`);
    if (L.order !== undefined && typeof L.order !== 'number') errors.push(`${lw}: order must be a number`);
    for (const [t, r] of Object.entries(L.cells || {})) {
      if (!themeIds.has(t)) errors.push(`${lw}: cells names unknown theme "${t}"`);
      if (!ringIds.has(r)) errors.push(`${lw}: cells.${t} names unknown ring "${r}"`);
    }
    for (const t of T) if (!(L.cells || {})[t.id]) errors.push(`${lw}: no cell for theme "${t.id}"`);
    for (const t of Object.keys(L.notes || {})) if (!themeIds.has(t)) errors.push(`${lw}: note for unknown theme "${t}"`);
    for (const t of Object.keys(L.readings || {})) if (!themeIds.has(t)) errors.push(`${lw}: reading for unknown theme "${t}"`);
    if (/^#[0-9a-f]{6}$/i.test(L.color || '') && isSignal(L.color) && !SEMANTIC[L.color.toLowerCase()]) errors.push(`${lw}: colour ${L.color} reads as red, amber or green; use a neutral hue`);
    for (const s of L.sources || []) if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${lw}: every source needs a title and a URL`);
  }
  for (const sec of site.sections || []) {
    if (!sec.title) errors.push(`${where('site.yaml')}: every section needs a title`);
    for (const it of sec.items || []) { if (!it.title || !it.text) errors.push(`${where('site.yaml')}: section "${sec.title}" items need title and text`);
      for (const s of it.sources || []) if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${where('site.yaml')}: source on "${it.title}" needs a title and a URL`); }
  }
  const sourced = [...R, ...T.flatMap(t => Object.entries(t.cells || {}).map(([k, c]) => Object.assign({ id: `${t.id}.${k}` }, c)))];
  for (const x of sourced) for (const s of x.sources || []) if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${where('data')}: source on "${x.id}" needs a title and a URL`);
  return errors;
}
const SRC_OK = (errors, where, owner, srcs) => { for (const x of srcs || []) if (!x.title || !/^https?:\/\//.test(x.url || '')) errors.push(`${where}: source on "${owner}" needs a title and a URL`); };
// Pictograms for scenarios: one family, ink strokes on paper, 96x56 viewBox. A disc is a token (plain = money, with a
// rising line = a yielding asset); a loop with a padlock is one atomic transaction; a box is a fund, vault or account.
const PART = {
  disc: (x, y, r, yieldLine) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/>` + (yieldLine ? `<path d="M${x - r * 0.55} ${y + r * 0.35}L${x - r * 0.1} ${y - r * 0.05}L${x + r * 0.15} ${y + r * 0.2}L${x + r * 0.55} ${y - r * 0.4}" fill="none" stroke="#14130f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M${x - r * 0.45} ${y}H${x + r * 0.45}" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`),
  lock: (x, y) => `<rect x="${x - 6}" y="${y - 3}" width="12" height="10" rx="2" fill="#14130f"/><path d="M${x - 3.5} ${y - 3}V${y - 6}a3.5 3.5 0 0 1 7 0V${y - 3}" fill="none" stroke="#14130f" stroke-width="2"/>`,
  arrow: (x1, y1, x2, y2, dashed) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#14130f" stroke-width="2" fill="none"${dashed ? ' stroke-dasharray="4 3"' : ''} marker-end="url(#ia)"/>`,
  loop: dashedBack => `<path d="M36 20C44 8 52 8 60 20" fill="none" stroke="#14130f" stroke-width="2" marker-end="url(#ia)"/><path d="M60 36C52 48 44 48 36 36" fill="none" stroke="#14130f" stroke-width="2"${dashedBack ? ' stroke-dasharray="4 3"' : ''} marker-end="url(#ia)"/>`,
};
const ICON_DEFS = '<defs><marker id="ia" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#14130f"/></marker></defs>';
const GLYPHS = {
  dvp: () => PART.disc(22, 28, 14) + PART.disc(74, 28, 14, true) + PART.loop() + PART.lock(48, 29),
  pvp: () => PART.disc(22, 28, 14) + PART.disc(74, 28, 14) + PART.loop() + PART.lock(48, 29),
  pay: () => PART.disc(22, 28, 14) + PART.arrow(40, 28, 68, 28) + `<rect x="72" y="16" width="20" height="24" rx="4" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/>`,
  treasury: () => PART.disc(22, 28, 14) + PART.arrow(40, 22, 58, 22) + PART.arrow(58, 34, 40, 34) + PART.disc(74, 28, 14, true),
  repo: () => PART.disc(22, 28, 14) + PART.disc(74, 28, 14, true) + PART.loop(true) + `<circle cx="48" cy="28" r="7" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><path d="M48 24V28H51" fill="none" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`,
  collateral: () => `<path d="M48 6L70 14V28C70 40 60 48 48 52C36 48 26 40 26 28V14Z" fill="#f8f6f2" stroke="#14130f" stroke-width="2" stroke-linejoin="round"/>` + PART.disc(48, 29, 11, true),
  lending: () => PART.disc(22, 28, 14, true) + PART.arrow(40, 22, 70, 22) + PART.arrow(70, 34, 40, 34, true) + `<rect x="74" y="16" width="18" height="24" rx="4" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/>`,
  subscribe: () => PART.disc(20, 28, 13) + PART.arrow(36, 28, 52, 28) + `<rect x="56" y="12" width="34" height="32" rx="5" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><path d="M63 20H83M63 28H83M63 36H77" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`,
  corporate: () => `<rect x="30" y="8" width="36" height="22" rx="4" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><path d="M38 15H58M38 22H52" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>` + PART.arrow(40, 32, 26, 46) + PART.arrow(48, 32, 48, 46) + PART.arrow(56, 32, 70, 46),
  // landing-page tiles
  web3: () => `<circle cx="48" cy="30" r="24" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="48" cy="33" r="16" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="48" cy="36" r="8" fill="#14130f"/>`,
  taxonomy: () => `<circle cx="36" cy="24" r="16" fill="#f8f6f2" fill-opacity=".7" stroke="#14130f" stroke-width="2"/><circle cx="60" cy="24" r="16" fill="#f8f6f2" fill-opacity=".7" stroke="#14130f" stroke-width="2"/><circle cx="48" cy="38" r="16" fill="#f8f6f2" fill-opacity=".7" stroke="#14130f" stroke-width="2"/>`,
  networks: () => `<path d="M24 40L48 14L72 40M24 40H72M48 14V40" stroke="#14130f" stroke-width="2" fill="none"/><circle cx="24" cy="40" r="7" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="72" cy="40" r="7" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="48" cy="14" r="7" fill="#14130f"/><circle cx="48" cy="40" r="7" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/>`,
  decentralization: () => `<path d="M18 44A30 30 0 0 1 78 44" fill="none" stroke="#14130f" stroke-width="6" stroke-linecap="round"/><path d="M48 44L66 22" stroke="#14130f" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="44" r="5" fill="#14130f"/>`,
  scenarios: () => PART.disc(20, 28, 12) + PART.arrow(34, 28, 50, 28) + PART.disc(64, 28, 12, true) + `<path d="M12 46H88" stroke="#14130f" stroke-width="2" stroke-dasharray="4 4"/>`,
  privacy: () => `<path d="M48 6L70 14V28C70 40 60 48 48 52C36 48 26 40 26 28V14Z" fill="#f8f6f2" stroke="#14130f" stroke-width="2" stroke-linejoin="round"/><path d="M36 29C40 23 56 23 60 29C56 35 40 35 36 29Z" fill="none" stroke="#14130f" stroke-width="2"/><circle cx="48" cy="29" r="3" fill="#14130f"/><path d="M38 38L58 20" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`,
  identity: () => `<rect x="18" y="12" width="60" height="34" rx="6" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="34" cy="26" r="6" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><path d="M26 40C28 34 40 34 42 40" fill="none" stroke="#14130f" stroke-width="2" stroke-linecap="round"/><path d="M50 22H70M50 30H70M50 38H62" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`,
  quantum: () => `<ellipse cx="48" cy="28" rx="30" ry="11" fill="none" stroke="#14130f" stroke-width="2"/><ellipse cx="48" cy="28" rx="30" ry="11" fill="none" stroke="#14130f" stroke-width="2" transform="rotate(60 48 28)"/><ellipse cx="48" cy="28" rx="30" ry="11" fill="none" stroke="#14130f" stroke-width="2" transform="rotate(-60 48 28)"/><circle cx="48" cy="28" r="5" fill="#14130f"/>`,
  key: () => `<circle cx="30" cy="28" r="12" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="30" cy="28" r="4" fill="#14130f"/><path d="M42 28H84M72 28V38M80 28V36" stroke="#14130f" stroke-width="2" stroke-linecap="round"/>`,
  milestones: () => `<path d="M12 28H78" stroke="#14130f" stroke-width="2" marker-end="url(#ia)"/><circle cx="26" cy="28" r="6" fill="#14130f"/><circle cx="48" cy="28" r="6" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="68" cy="28" r="6" fill="#f8f6f2" stroke="#14130f" stroke-width="2" stroke-dasharray="3 2"/>`,
  architecture: () => `<rect x="10" y="8" width="56" height="10" rx="3" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><rect x="10" y="23" width="56" height="10" rx="3" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><rect x="10" y="38" width="56" height="10" rx="3" fill="#14130f"/><rect x="72" y="8" width="14" height="40" rx="3" fill="#f8f6f2" stroke="#14130f" stroke-width="2" stroke-dasharray="4 3"/>`,
  agent: () => `<rect x="10" y="14" width="26" height="24" rx="5" fill="#f8f6f2" stroke="#14130f" stroke-width="2"/><circle cx="19" cy="25" r="2.5" fill="#14130f"/><circle cx="27" cy="25" r="2.5" fill="#14130f"/><path d="M23 14V8" stroke="#14130f" stroke-width="2"/>` + PART.arrow(40, 28, 58, 28) + PART.disc(74, 28, 13),
};
const iconSvg = (id, cls) => GLYPHS[id] ? `<svg class="${cls || 'ei-icon'}" viewBox="0 0 96 56" aria-hidden="true">${ICON_DEFS}${GLYPHS[id]()}</svg>` : '';
function validateIndex({ dir, site }) {
  const errors = validateStatic({ dir, site }), where = `${dir}/site.yaml`;
  const roles = new Set((site.filters?.roles || []).map(r => r.id));
  const moves = new Set([...(site.filters?.moves || []).map(m => m.id), ...(site.map?.circles || []).map(c => c.id), ...(site.bands || []).flatMap(b => b.moves || [])]);
  for (const sc of site.scenarios || []) if (sc.icon && !GLYPHS[sc.icon]) errors.push(`${where}: scenario "${sc.title}" names unknown icon "${sc.icon}"`);
  for (const sc of site.scenarios || []) {
    if (!sc.title || !sc.text) errors.push(`${where}: every scenario needs a title and text`);
    if (sc.path && !PAGES.some(p => p.out === sc.path)) errors.push(`${where}: scenario path "${sc.path}" is not a page in PAGES`);
    for (const r of sc.roles || []) if (!roles.has(r)) errors.push(`${where}: scenario "${sc.title}" names unknown role "${r}"`);
    for (const m of sc.moves || []) if (!moves.has(m)) errors.push(`${where}: scenario "${sc.title}" names unknown move "${m}"`);
  }
  return errors;
}
function validateScenario({ dir, site, sc }) {
  const errors = validateStatic({ dir, site }), where = `${dir}/scenario.yaml`;
  const ids = new Set((sc.actors || []).map(a => a.id));
  if ((sc.actors || []).length < 2) errors.push(`${where}: needs at least two actors`);
  for (const a of sc.actors || []) { if (!a.id || !a.name || !a.role) errors.push(`${where}: every actor needs id, name and role`);
    if (a.kind && !['institution', 'ledger', 'contract', 'observer'].includes(a.kind)) errors.push(`${where}: actor "${a.id}" kind must be institution, ledger, contract or observer`); }
  (sc.steps || []).forEach((st, i) => { st.n = i + 1;
    if (!st.title || !st.text) errors.push(`${where}: step ${i + 1} needs a title and text`);
    if (!['offchain', 'onchain', 'atomic'].includes(st.kind || 'offchain')) errors.push(`${where}: step ${i + 1} kind must be offchain, onchain or atomic`);
    for (const id of [st.from, st.to, ...(st.lanes || [])]) if (id && !ids.has(id)) errors.push(`${where}: step ${i + 1} names unknown actor "${id}"`);
    if (!st.lanes && (!st.from || !st.to)) errors.push(`${where}: step ${i + 1} needs from and to (or lanes)`); });
  for (const t of sc.tokens || []) { if (!t.name || !t.role) errors.push(`${where}: every token needs a name and a role`); SRC_OK(errors, where, t.name, t.sources); }
  for (const x of sc.standards || []) if (!x.id || !x.title || !x.status || !x.role || !/^https?:\/\//.test(x.url || '')) errors.push(`${where}: standard "${x.id || '?'}" needs id, title, status, role and url`);
  for (const sec of sc.sections || []) { if (!sec.title) errors.push(`${where}: every section needs a title`);
    for (const it of sec.items || []) { if (!it.title || !it.text) errors.push(`${where}: section "${sec.title}" items need title and text`); SRC_OK(errors, where, it.title, it.sources); } }
  SRC_OK(errors, where, 'scenario', sc.sources);
  return errors;
}
function validate(page) {
  if (page.system) return validateSystem(page);
  if (page.static) return validateStatic(page);
  if (page.index) return validateIndex(page);
  if (page.scenario) return validateScenario(page);
  if (page.arch) return validateArchitecture(page);
  if (page.radial) return validateRadial(page);
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
    const cols = [['lens color', L.color], ...(L.groups || []).map(G => [`group "${G.id}"`, G.color])].filter(([, c]) => /^#[0-9a-f]{6}$/i.test(c || ''));
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
    else if (!lensOnly.some(id => mentions(lensById[lid]).has(id))) errors.push(`${where('badges')}: "${t.ticker}" is licensed under "${lid}", but that lens shows no licensed or recognized circle (${lensOnly.join(', ')})`);
  }
  // bridges: waypoints that join a lens group's perimeter into one continuous outline, keyed "<lens>.<group>"
  for (const [key, paths] of Object.entries(layout.bridges || {})) {
    const [lid, gid] = key.split('.');
    if (!(lensById[lid]?.groups || []).some(G => G.id === gid)) errors.push(`${where('layout.yaml')}: bridge "${key}" names an unknown lens group`);
    for (const pts of Array.isArray(paths) ? paths : [null])
      if (!Array.isArray(pts) || pts.length < 2 || pts.some(p => !Array.isArray(p) || p.length !== 2)) errors.push(`${where('layout.yaml')}: each corridor in bridge "${key}" needs two or more [x, y] points`);
  }
  for (const k of ['title', 'eyebrow', 'intro', 'footnote', ...((site.lens_groups || []).length ? ['lens_help'] : [])]) if (!site[k]) errors.push(`${where('site.yaml')}: missing "${k}"`);
  if (!site.heading?.text) errors.push(`${where('site.yaml')}: missing heading.text`);
  if (site.badge && !['disc', 'pill'].includes(site.badge)) errors.push(`${where('site.yaml')}: badge must be disc or pill`);
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  for (const n of site.nav || []) if (!n.label) errors.push(`${where('site.yaml')}: every nav item needs a label`);
  for (const l of site.legend || []) if (!LEGEND_KINDS.includes(l.kind) || !l.text) errors.push(`${where('site.yaml')}: legend items need kind (${LEGEND_KINDS.join(' | ')}) and text`);
  for (const t of tokens.tokens) if (t.mark && !/^[A-Z]{2,4}$/.test(t.mark)) errors.push(`${where('badges')}: "${t.ticker}" mark must be 2 to 4 capital letters`);
  for (const t of tokens.tokens) if (t.kind && !['network', 'participant', 'element'].includes(t.kind)) errors.push(`${where('badges')}: "${t.ticker}" kind must be network, participant or element`);
  for (const x of [...circles.circles, ...tokens.tokens]) for (const s of x.sources || [])
    if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${where('data')}: source on "${x.id || x.ticker}" needs a title and a URL`);
  // facets (the "Focus on" sidebar): every value a badge gives must be defined; `na` and `unknown` are always allowed
  if (site.facets) {
    const F = Object.fromEntries(site.facets.map(f => [f.id, f])), groups = new Set((site.facet_groups || []).map(g => g.id));
    if (Object.keys(F).length !== site.facets.length) errors.push(`${where('site.yaml')}: duplicate facet ids`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(site.facts_as_of || '')) errors.push(`${where('site.yaml')}: facts_as_of (YYYY-MM-DD) is needed with facets`);
    for (const f of site.facets) {
      if (!f.label || !(f.values || []).length) errors.push(`${where('site.yaml')}: facet "${f.id}" needs a label and values`);
      if (!groups.has(f.group)) errors.push(`${where('site.yaml')}: facet "${f.id}" names unknown group "${f.group}"`);
      if (f.from && !['status', 'since', 'pse'].includes(f.from)) errors.push(`${where('site.yaml')}: facet "${f.id}" from must be status, since or pse`);
      if (f.filter !== undefined && typeof f.filter !== 'boolean') errors.push(`${where('site.yaml')}: facet "${f.id}" filter must be true or false`);
      if (f.neutral !== undefined && typeof f.neutral !== 'boolean') errors.push(`${where('site.yaml')}: facet "${f.id}" neutral must be true or false`);
      if (f.match && !['any', 'all'].includes(f.match)) errors.push(`${where('site.yaml')}: facet "${f.id}" match must be any or all`);
    }
    for (const pr of site.facet_presets || []) {
      if (!pr.id || !pr.label || !pr.text) errors.push(`${where('site.yaml')}: every facet preset needs id, label and text`);
      for (const r of pr.require || []) if (!(pr.picks || {})[r]) errors.push(`${where('site.yaml')}: preset "${pr.id}" requires "${r}", which it does not pick`);
      for (const [fid, vs] of Object.entries(pr.picks || {})) {
        if (!F[fid]) { errors.push(`${where('site.yaml')}: preset "${pr.id}" picks unknown facet "${fid}"`); continue; }
        for (const v of [].concat(vs)) if (!F[fid].values.some(x => String(x.id) === String(v))) errors.push(`${where('site.yaml')}: preset "${pr.id}" picks unknown value "${v}" of "${fid}"`);
      }
    }
    for (const t of tokens.tokens) {
      if (t.status && !['mainnet', 'testnet'].includes(t.status)) errors.push(`${where('badges')}: "${t.ticker}" status must be mainnet or testnet`);
      if (t.since && !/^\d{4}-\d{2}-\d{2}$/.test(String(t.since))) errors.push(`${where('badges')}: "${t.ticker}" since must be YYYY-MM-DD`);
      for (const id of [].concat(t.pse || [])) if (!/^[a-z0-9-]+$/.test(String(id))) errors.push(`${where('badges')}: "${t.ticker}" pse must be PSE evaluation ids (lower-case, hyphens)`);
      for (const [fid, raw] of Object.entries(t.facts || {})) {
        const f = F[fid], v = fact(raw);
        if (!f) { errors.push(`${where('badges')}: "${t.ticker}" gives unknown facet "${fid}"`); continue; }
        if (f.from) { errors.push(`${where('badges')}: "${t.ticker}" facet "${fid}" is filled from "${f.from}"; set that on the badge`); continue; }
        const ok = new Set([...f.values.map(x => String(x.id)), 'na', 'unknown']);
        for (const x of [...v.in, ...v.part]) if (!ok.has(x)) errors.push(`${where('badges')}: "${t.ticker}" facet "${fid}" has unknown value "${x}"`);
        for (const s of v.sources) if (!s.title || !/^https?:\/\//.test(s.url || '')) errors.push(`${where('badges')}: source on "${t.ticker}" facet "${fid}" needs a title and a URL`);
      }
    }
  }
  return errors;
}
// a badge's facet value: a string, a list, or { in, part, note, sources }
const fact = raw => { const o = typeof raw === 'string' || Array.isArray(raw) ? { in: [].concat(raw) } : (raw || {});
  return { in: [].concat(o.in ?? []).map(String), part: [].concat(o.part ?? []).map(String), note: o.note || '', sources: o.sources || [] }; };
// facets filled by the build: status (default mainnet), years since `since` (banded as the `since` facet's values), and
// `pse`: a pointer to the design's evaluations in the PSE private transfers benchmark, which measures what we do not
const PSE_EVAL = 'https://github.com/ethereum/private-transfers-benchmarks/blob/main/project-evaluations/src/data/evaluations/';
function facts(t, site) {
  if (!t.facts) return null; // a badge without facts (context only) is left out of the sidebar and its counts
  const out = Object.fromEntries(Object.entries(t.facts || {}).map(([k, v]) => [k, fact(v)]));
  for (const f of site.facets || []) {
    if (f.from === 'status') out[f.id] = { in: [t.status || 'mainnet'], part: [], note: t.status_note || '', sources: [] };
    if (f.from === 'pse' && t.pse) out[f.id] = { in: [String(f.values[0].id)], part: [], note: f.note || '',
      sources: [].concat(t.pse).map(id => ({ title: `PSE evaluation, ${id}`, url: `${PSE_EVAL}${id}.json` })) };
    if (f.from === 'since') {
      if (!t.since) { out[f.id] = { in: ['unknown'], part: [], note: '', sources: [] }; continue; }
      const y = (Date.parse(site.facts_as_of) - Date.parse(String(t.since))) / (365.25 * 864e5);
      out[f.id] = { in: [y < 1 ? 'lt1' : y < 3 ? 'y1to3' : y < 5 ? 'y3to5' : 'y5plus'], part: [], sources: [],
        note: `${t.status === 'testnet' ? 'Public testnet' : 'Live'} since ${new Date(String(t.since)).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.` };
    }
  }
  return out;
}

// ---------- version ----------
let version = process.env.TAXONOMY_VERSION || '';
if (!version) { try { version = execSync('git describe --tags --always --dirty', { cwd: root, stdio: ['ignore','pipe','ignore'] }).toString().trim(); } catch { version = 'dev'; } }
const stamp = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

// ---------- assemble ----------
const TAG = '<span class="ei-tag">in progress</span>';
const relHref = (from, to) => { const up = '../'.repeat(from ? from.split('/').length : 0); return to ? `${up}${to}/` : (up || './'); };
const navHtml = out => `<nav class="ei-nav" aria-label="Pages">${NAV.map(n => (n.path === out || (n.path && out.startsWith(n.path + '/')))
  ? `<span class="cur" aria-current="page">${esc(n.label)}${n.wip ? TAG : ''}</span>`
  : `<a href="${relHref(out, n.path)}">${esc(n.label)}${n.wip ? TAG : ''}</a>`).join('')}</nav>`;
const shared = site => ({
  heading: site.heading.italic ? esc(site.heading.text).replace(esc(site.heading.italic), `<em>${esc(site.heading.italic)}</em>`) : esc(site.heading.text),
  notice: site.notice ? `<div class="ei-notice" role="note"><b>${esc(site.notice.title)}</b> ${esc(site.notice.text)}</div>` : '',
  contribute: site.contribute ? `<div class="ei-contrib"><p><b>${esc(site.contribute.title)}</b> ${esc(site.contribute.text)}</p>`
    + `<p class="links"><a href="${site.contribute.repo}/issues/new/choose">Open an issue</a><a href="${site.contribute.repo}/pulls">Pull requests</a><a href="${site.contribute.repo}">View on GitHub</a></p></div>` : '',
});
function renderIndex({ site, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const sh = shared(site), F = site.filters || {};
  const chips = (name, items) => `<div class="ei-filter" data-filter="${name}"><span class="rl">${esc(F[name + '_label'] || name)}</span>${items.map(i => `<button type="button" data-v="${esc(i.id)}" aria-pressed="false">${esc(i.label)}</button>`).join('')}</div>`;
  const M = site.map || {}, circles = M.circles || [];
  const pillW = t => Math.round(t.length * 6.2) + 18;
  const venn = circles.length ? `<div class="ei-wrap venn"><svg viewBox="0 0 ${M.width || 700} ${M.height || 520}" role="img" aria-label="${esc(M.label || 'Map of scenarios by what moves')}">`
    + circles.map(c => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${esc(c.fill)}" fill-opacity=".55" stroke="${esc(c.stroke)}" stroke-width="2"/>`).join('')
    + circles.map(c => `<text x="${c.lx}" y="${c.ly}" text-anchor="middle" class="serif" font-size="20" font-weight="700" fill="#14130f">${esc(c.label)}</text>`).join('')
    + (site.scenarios || []).filter(sc => sc.map).map(sc => { const w = pillW(sc.short || sc.title), live = !!sc.path, x = sc.map.x - w / 2;
        const pill = `<g class="pill${live ? ' live' : ''}"><title>${esc(sc.title)}${live ? '' : ' (in progress)'}</title><rect x="${x}" y="${sc.map.y - 11}" width="${w}" height="22" rx="11" fill="${live ? '#14130f' : '#b8b3a8'}" stroke="#f8f6f2" stroke-width="1.5"/><text x="${sc.map.x}" y="${sc.map.y + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#f2efe9">${esc(sc.short || sc.title)}</text></g>`;
        return live ? `<a href="${relHref(out, sc.path)}" aria-label="${esc(sc.title)}">${pill}</a>` : pill; }).join('')
    + `</svg></div><div class="ei-legend"><span><svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="#14130f"/></svg> Written scenario (click to open)</span><span><svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="#b8b3a8"/></svg> Planned</span></div>` : '';
  const bands = site.bands || [];
  const tile = sc => { const live = !!sc.path;
    return `<${live ? `a class="ei-card tile" href="${relHref(out, sc.path)}"` : 'div class="ei-card tile planned"'} data-roles="${(sc.roles || []).join(' ')}">${iconSvg(sc.icon)}<h2>${esc(sc.title)}${live ? '' : ' ' + TAG}</h2><p>${esc(sc.text)}</p>`
      + `<p class="tags">${(sc.roles || []).map(r => `<span>${esc((F.roles || []).find(x => x.id === r)?.label || r)}</span>`).join('')}</p>` + (live ? `<span class="go">Open the scenario →</span>` : '') + `</${live ? 'a' : 'div'}>`; };
  const bandOf = sc => bands.find(b => (b.moves || []).length === (sc.moves || []).length && (b.moves || []).every(m => (sc.moves || []).includes(m)))?.id;
  const cards = bands.map(b => { const list = (site.scenarios || []).filter(sc => bandOf(sc) === b.id).sort((a, c) => (!!c.path) - (!!a.path));
    return list.length ? `<div class="ei-band" data-band="${esc(b.id)}"><div class="ei-h"><b>${esc(b.label)}</b><span>${esc(b.text || '')}</span></div><div class="ei-cards">${list.map(tile).join('')}</div></div>` : ''; }).join('');
  const body = venn + `<div class="ei-filters">${F.roles ? chips('roles', F.roles) : ''}<button type="button" class="clear" hidden>Show all</button></div><div id="ei-cards">${cards}</div>
<script>(function(){ const on={roles:null}; const cards=[...document.querySelectorAll('#ei-cards .ei-card')], clear=document.querySelector('.ei-filters .clear');
  const apply=()=>{ cards.forEach(c=>{ c.hidden=!(!on.roles||c.dataset.roles.split(' ').includes(on.roles)); }); clear.hidden=!on.roles;
    document.querySelectorAll('.ei-band').forEach(b=>{ b.hidden=![...b.querySelectorAll('.ei-card')].some(c=>!c.hidden); });
    document.querySelectorAll('.ei-filter').forEach(f=>f.querySelectorAll('button').forEach(b=>{ const a=on[f.dataset.filter]===b.dataset.v; b.classList.toggle('on',a); b.setAttribute('aria-pressed',String(a)); })); };
  document.querySelectorAll('.ei-filter').forEach(f=>f.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ on[f.dataset.filter]=on[f.dataset.filter]===b.dataset.v?null:b.dataset.v; apply(); })));
  clear.addEventListener('click',()=>{ on.roles=null; apply(); }); })();</script>`;
  return read('src/static.html')
    .replace('__STYLE__', style + `<style>
  .ei-filters{display:flex;flex-direction:column;gap:8px;padding:14px 18px;border:1px solid var(--rule);border-radius:16px;background:var(--card)}
  .ei-filter{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .ei-filter .rl{font-size:12px;color:var(--muted);min-width:150px}
  .ei-filter button,.ei-filters .clear{font:inherit;font-size:13px;padding:5px 11px;border-radius:10px;border:1px solid var(--rule);background:#fff;color:var(--ink);cursor:pointer}
  .ei-filter button:hover{border-color:var(--ink)}
  .ei-filter button.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
  .ei-filters .clear{align-self:flex-start;border:none;background:none;color:var(--muted);text-decoration:underline;text-underline-offset:3px;padding:2px 4px}
  .ei-card .tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
  .ei-card .tags span{font-size:10px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;padding:1px 7px;border-radius:8px;border:1px solid var(--rule);background:#fff;color:var(--muted)}
  .ei-card .tags span.m{border-color:#312e81;color:#312e81}
  .ei-card.planned{cursor:default;opacity:.85}
  .ei-card[hidden],.ei-band[hidden]{display:none}
  .ei-wrap.venn svg{max-width:760px;min-width:520px;margin:0 auto}
  .ei-wrap.venn svg a rect{cursor:pointer}
  .ei-wrap.venn svg a:hover rect,.ei-wrap.venn svg a:focus rect{stroke:#14130f;stroke-width:3}
  .ei-wrap.venn svg text{pointer-events:none;font-family:var(--sans)}
  .ei-wrap.venn svg text.serif{font-family:var(--serif);letter-spacing:-.02em}
  #ei-cards{display:flex;flex-direction:column;gap:22px}
  .ei-band{display:flex;flex-direction:column;gap:12px}
  .ei-h{display:flex;flex-direction:column;gap:4px}
  .ei-h b{font-family:var(--serif);font-weight:400;font-size:22px;letter-spacing:-.02em}
  .ei-h span{font-size:14px;color:var(--muted);line-height:1.5;max-width:90ch}
  .ei-card.tile svg.ei-icon{width:96px;height:56px;display:block;margin-bottom:2px}
</style>`).replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', sh.heading)
    .replace('__INTRO__', esc(site.intro)).replace('__NAV__', navHtml(out)).replace('__BODY__', body).replace('__NOTICE__', sh.notice)
    .replace('__CONTRIBUTE__', sh.contribute).replace('__FOOTNOTE__', esc(site.footnote)).replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}
const srcHtmlC = src => !(src || []).length ? '' : `<details class="src"><summary>Sources (${src.length})</summary><p class="src">${srcList(src)}</p></details>`;
const moreHtml = m => m && m.url ? `<p class="more"><a href="${m.url}" target="_blank" rel="noopener">${esc(m.title || 'Read more')} →</a></p>` : '';
const sectionsHtmlC = site => (site.sections || []).length ? `<div class="ei-sections">${site.sections.map(sec => `<div class="ei-section"><h2>${esc(sec.title)}${sec.wip ? '<span class="wip">in progress</span>' : ''}</h2>${sec.text ? `<p>${esc(sec.text)}</p>` : ''}`
  + (sec.items || []).map(it => `<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>` + moreHtml(it.more) + srcHtmlC(it.sources)).join('') + '</div>').join('')}</div>` : '';
function renderScenario({ site, sc, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const lead = (sc.sections || []).filter(x => x.lead), rest = (sc.sections || []).filter(x => !x.lead);
  const data = { actors: sc.actors, steps: sc.steps, kind: 'scenario', version,
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a step in the diagram to read what happens; click to pin it.' } };
  const tags = (sc.tags || []).length ? `<div class="ei-tags">${sc.tags.map(t => `<span class="${t.kind === 'move' ? 'm' : ''}">${esc(t.label)}</span>`).join('')}</div>` : '';
  const actorsHtml = `<div class="ei-actors">${sc.actors.map(a => `<div class="ei-actor"><h3><i class="${esc(a.kind || 'institution')}"></i>${esc(a.name)}</h3><p>${esc(a.role)}</p></div>`).join('')}</div>`;
  const tokensHtml = `<div class="ei-cards2">${(sc.tokens || []).map(t => `<div class="ei-card2"><h3>${t.circle ? `<a href="${relHref(out, 'taxonomy')}">${esc(t.name)}</a>` : esc(t.name)}</h3>${t.place ? `<p class="sub">${esc(t.place)}</p>` : ''}<p>${esc(t.role)}</p>${t.example ? `<p class="sub" style="margin-top:6px">${esc(t.example)}</p>` : ''}${srcHtmlC(t.sources)}</div>`).join('')}</div>`;
  const stdHtml = `<table class="ei-std"><thead><tr><th>Standard</th><th>Status</th><th>Role in this scenario</th></tr></thead><tbody>${(sc.standards || []).map(x => `<tr><td><a href="${x.url}" target="_blank" rel="noopener">${esc(x.id)}</a><br><span style="color:var(--muted);font-size:12px">${esc(x.title)}</span></td><td><span class="st">${esc(x.status)}</span></td><td>${esc(x.role)}</td></tr>`).join('')}</tbody></table>`;
  return fillCommon(read('src/scenario.html').replace('__STYLE__', style), { site, out, data })
    .replace('__ICON__', iconSvg(sc.icon, 'ei-icon hero')).replace('__TAGS__', tags).replace('__ACTORS__', actorsHtml).replace('__TOKENS__', tokensHtml).replace('__STANDARDS__', stdHtml).replace('__STANDARDS_HELP__', esc(sc.standards_help || ''))
    .replace('__FLOW_HELP__', esc(sc.flow_help || 'Each column is an actor; each row is a step. Dashed arrows are off-ledger, solid arrows are on the ledger, and a band across several columns is one transaction that either completes in full or not at all.'))
    .replace('__LEAD__', sectionsHtmlC({ sections: lead }))
    .replace('__SECTIONS__', sectionsHtmlC({ sections: rest }) + ((sc.sources || []).length ? `<div class="ei-sections"><div class="ei-section"><h2>Sources</h2>${srcHtmlC(sc.sources)}</div></div>` : ''));
}
function renderStatic({ site, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const sh = shared(site);
  const body = site.cards
    ? `<div class="ei-cards">${site.cards.map(c => { const n = NAV.find(x => x.path === c.path);
        return `<a class="ei-card" href="${relHref(out, c.path)}">${iconSvg(c.icon)}<h2>${esc(c.title)}${n?.wip ? ' ' + TAG : ''}</h2><p>${esc(c.text)}</p><span class="go">Open →</span></a>`; }).join('')}</div>`
    : (site.sections || []).length ? sectionsHtmlC({ sections: site.sections }) : `<div class="ei-wip">This page is being drafted and will appear here. Follow progress, or suggest what it should cover, on GitHub.</div>`;
  return read('src/static.html')
    .replace('__STYLE__', style).replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', sh.heading)
    .replace('__INTRO__', esc(site.intro)).replace('__NAV__', navHtml(out)).replace('__BODY__', body).replace('__NOTICE__', sh.notice)
    .replace('__CONTRIBUTE__', sh.contribute).replace('__FOOTNOTE__', esc(site.footnote)).replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}
const swatch = l => l.kind === 'pill'
    ? (l.hollow ? `<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="#fff" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/></svg>`
      : `<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="${esc(l.color || '#14130f')}"/></svg>`)
    : l.kind === 'expand'
    ? `<svg width="40" height="18" aria-hidden="true"><ellipse cx="17" cy="9" rx="15" ry="7" fill="#e3e7ea" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><text x="36" y="13" text-anchor="middle" font-size="12" font-weight="600" fill="#615f5a">+</text></svg>`
    : l.kind === 'mark'
    ? `<svg width="40" height="18" aria-hidden="true"><rect x="1" y="4" width="28" height="12" rx="6" fill="${esc(l.pill || '#6b6760')}"/><circle cx="30" cy="8" r="7.5" fill="${esc(l.color || '#14130f')}" stroke="#f8f6f2" stroke-width="1.5"/><text x="30" y="10" text-anchor="middle" font-size="5" font-weight="700" fill="#f2efe9">ETH</text></svg>`
    : `<svg width="22" height="18" aria-hidden="true"><ellipse cx="11" cy="9" rx="10" ry="8" fill="none" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><ellipse cx="11" cy="9" rx="6" ry="4.8" fill="none" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><circle cx="11" cy="9" r="2" fill="${esc(l.color || '#14130f')}"/></svg>`;
const legendHtml = site => (site.legend || []).length ? `<div class="ei-legend">${site.legend.map(l => `<span>${swatch(l)} ${esc(l.text)}</span>`).join('')}</div>` : '';
// placeholders common to every page that carries a diagram (map and radial templates)
function fillCommon(html, { site, out, data }) {
  const sh = shared(site);
  return html
    .replace('__DATA__', JSON.stringify(data).replace(/<\/script/gi, '<\\/script'))
    .replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', sh.heading)
    .replace('__INTRO__', esc(site.intro) + (site.intro_more ? ` <button type="button" class="ei-more" aria-expanded="false" aria-controls="ei-intro-more" data-more="${esc(site.intro_more_label || 'More')}" data-less="${esc(site.intro_less_label || 'Less')}">${esc(site.intro_more_label || 'More')}</button>` : ''))
    .replace('__INTRO_MORE__', site.intro_more ? `<p class="sub more" id="ei-intro-more" hidden>${esc(site.intro_more)}</p>` : '')
    .replace('__FOOTNOTE__', esc(site.footnote)).replace('__SVG_LABEL__', esc(site.svg_label || `Diagram: ${site.title}`))
    .replace('__PANEL_TITLE__', esc(data.panel.title)).replace('__PANEL_TEXT__', esc(data.panel.text))
    .replace('__NAV__', navHtml(out)).replace('__LEGEND__', legendHtml(site))
    .replace('__NOTICE__', sh.notice).replace('__CONTRIBUTE__', sh.contribute)
    .replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}
function render({ circles, layout, tokens, site, lenses, out }) {
  const data = {
    palette: circles.palette, containers: circles.containers || [], children: circles.children || {}, inherit_status: circles.inherit_status || {},
    circles: circles.circles.map(c => Object.assign({}, c, layout.circles[c.id])),
    tokens: site.facets ? tokens.tokens.map(t => Object.assign({}, t, { facts: facts(t, site) })) : tokens.tokens,
    lenses, version, bridges: layout.bridges || {}, annotations: layout.annotations || [], canvas: layout.canvas,
    facets: site.facets ? { title: site.facets_title || 'Focus on', help: site.facets_help || '', groups: site.facet_groups || [], list: site.facets, presets: site.facet_presets || [],
      as_of: new Date(site.facts_as_of).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) } : null,
    lens_groups: site.lens_groups || [], badge: site.badge || 'disc', pill_scale: site.pill_scale || 1,
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a circle to preview how Ethereum Institutional defines it; click to pin the definition here.' },
  };
  return fillCommon(read('src/template.html'), { site, out, data })
    .replace('__LENS_TITLE__', esc(site.lens_title || 'Regulatory lenses')).replace('__LENS_HELP__', esc(site.lens_help))
    .replace('__CANVAS_W__', layout.canvas.width).replace('__CANVAS_H__', layout.canvas.height)
    .replace('__SECTIONS__', sectionsHtmlC(site)); // narrative under the map (sources collapsed, optional `more` links)
}
// sources: inline when three or fewer, otherwise collapsed behind a "Sources (n)" toggle
const srcList = src => src.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.checked ? ` (checked ${esc(s.checked)})` : ''}`).join('; ');
const srcHtml = src => !(src || []).length ? '' : src.length <= 3 ? `<p class="src">Sources: ${srcList(src)}</p>` : `<details class="src"><summary>Sources (${src.length})</summary><p class="src">${srcList(src)}</p></details>`;
const sectionsHtml = site => (site.sections || []).length ? `<div class="ei-sections">${site.sections.map(sec => `<div class="ei-section"><h2>${esc(sec.title)}${sec.wip ? '<span class="wip">in progress</span>' : ''}</h2>${sec.text ? `<p>${esc(sec.text)}</p>` : ''}`
  + (sec.items || []).map(it => `<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>` + srcHtml(it.sources)).join('') + '</div>').join('')}</div>` : '';
const radialLensHtml = (site, lenses) => lenses.length ? `<div class="ei-lens radial" id="ei-lens"><div class="ei-lens-head"><b>${esc(site.lens_title || 'Compare')}</b><span>${esc(site.lens_help || '')}</span></div><div class="row">`
  + lenses.map(L => `<button type="button" data-lens="${esc(L.id)}" aria-pressed="false" style="--c:${esc(L.color)}"><span class="sw"></span>${esc(L.menu || L.name)}</button>`).join('') + '</div></div>' : '';
const statsHtml = site => site.stats ? `<div class="ei-stats-head"><b>${esc(site.stats.title)}</b>${site.stats.text ? `<span>${esc(site.stats.text)}</span>` : ''}</div><div class="ei-stats">${(site.stats.items || []).map(st => `<div class="ei-stat"><p class="n">${esc(st.value)}</p><p class="l">${esc(st.label)}</p><p>${esc(st.text)}</p>`
  + srcHtml(st.sources) + '</div>').join('')}</div>` : '';
function renderRadial({ site, rings, themes, layout, lenses, out, gauges }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const sorted = [...(lenses || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const data = {
    rings: rings.rings.map(r => Object.assign({ fs: 20 }, r, layout ? layout.rings[r.id] : {})), themes: themes.themes, version, kind: gauges ? 'gauges' : 'radial',
    default_lens: site.default_lens, scale: site.scale,
    lenses: sorted.map(L => ({ id: L.id, name: L.name, short: L.short, color: L.color, intro: L.intro, cells: L.cells, notes: L.notes || {}, readings: L.readings || {}, sources: L.sources || [] })),
    layout: layout ? { canvas: layout.canvas, cx: layout.cx, cy: layout.cy, hub: layout.hub, hub_label: layout.hub_label, hub_fs: layout.hub_fs, cell_fs: layout.cell_fs } : null,
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a cell to preview how Ethereum Institutional describes it; click to pin the description here.' },
  };
  return fillCommon(read(gauges ? 'src/gauges.html' : 'src/radial.html').replace('__STYLE__', style), { site, out, data })
    .replace('__LENSES__', radialLensHtml(site, sorted)).replace('__SECTIONS__', sectionsHtml(site)).replace('__STATS__', statsHtml(site)).replace('__SCORE__', site.score ? `<div class="ei-score" id="ei-score"><b class="t">${esc(site.score.title)}</b><span class="n">0</span><span class="of"></span><span class="bar"><i></i></span><button type="button" class="adjust" aria-expanded="false" aria-controls="ei-sliders">Adjust weights</button></div>` : '').replace('__SCORE_TEXT__', esc(site.score?.text || ''));
}

// ---------- architecture page ----------
// kind: architecture, a blueprint. architecture.yaml holds client_context, domains (each with components), connections
// (from, to, kind, label), flows and meta; overview.yaml groups every drawn component (one with a type) into the areas
// the page draws and lays out itself; layout.yaml lists the two rails (components without a type, listed under it).
const ARCH_STATUS = ['existing', 'extend', 'new', 'evaluate'];
const ARCH_SOURCE = ['brief', 'suggested'];
const ARCH_TYPES = ['system', 'process', 'technology', 'control', 'key'];
const ARCH_KINDS = ['instruction', 'data', 'control'];
const ARCH_FIELDS = new Set(['id', 'name', 'short', 'status', 'source', 'maps_to', 'notes', 'domain', 'type', 'sources']);
const human = k => String(k).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const refLabel = k => human(String(k).replace(/_map$/, ''));
const refAbbr = k => String(k).replace(/_map$/, '').split('_').map(w => w[0].toUpperCase()).join('');
const archComponents = map => (map.domains || []).flatMap(d => (d.components || []).map(c => Object.assign({ source: d.source || 'brief' }, c, { domain: d.id })));
const archClients = map => (map.client_context?.segments || []).map(s => ({ id: `CL.${s.id}`, name: s.name, states: s.states || [] }));
function validateArchitecture({ dir, site, map, layout, overview }) {
  const errors = validateStatic({ dir, site }), w = f => `${dir}/${f}`;
  const doms = map.domains || [], dIds = new Set(doms.map(d => d.id));
  if (dIds.size !== doms.length) errors.push(`${w('architecture.yaml')}: duplicate domain ids`);
  const comps = archComponents(map), cIds = new Set(comps.map(c => c.id));
  if (cIds.size !== comps.length) errors.push(`${w('architecture.yaml')}: duplicate component ids: ${comps.map(c => c.id).filter((x, i, a) => a.indexOf(x) !== i).join(', ')}`);
  const nodeIds = new Set([...cIds, ...archClients(map).map(c => c.id)]);
  const refs = new Set(Object.keys(map.meta?.reference_maps || {}));
  for (const k of ARCH_STATUS) if (!map.meta?.status_legend?.[k]) errors.push(`${w('architecture.yaml')}: meta.status_legend needs "${k}"`);
  for (const d of doms) {
    if (!d.id || !d.name) errors.push(`${w('architecture.yaml')}: every domain needs an id and a name`);
    if (!(d.components || []).length) errors.push(`${w('architecture.yaml')}: domain "${d.id}" has no components`);
  }
  for (const c of comps) {
    if (!c.id || !c.name) errors.push(`${w('architecture.yaml')}: every component needs an id and a name (in ${c.domain})`);
    if (c.id && !String(c.id).startsWith(c.domain + '.')) errors.push(`${w('architecture.yaml')}: component "${c.id}" should be numbered under its domain ${c.domain}`);
    if (!ARCH_STATUS.includes(c.status)) errors.push(`${w('architecture.yaml')}: component "${c.id}" status must be ${ARCH_STATUS.join(' | ')}`);
    if (!ARCH_SOURCE.includes(c.source)) errors.push(`${w('architecture.yaml')}: component "${c.id}" source must be ${ARCH_SOURCE.join(' or ')}`);
    if (c.type && !ARCH_TYPES.includes(c.type)) errors.push(`${w('architecture.yaml')}: component "${c.id}" type must be ${ARCH_TYPES.join(' | ')}`);
    for (const r of c.maps_to || []) if (!refs.has(r)) errors.push(`${w('architecture.yaml')}: component "${c.id}" maps to unknown reference map "${r}"`);
    for (const x of c.sources || []) if (!x.title || !/^https?:\/\//.test(x.url || '') || !/^\d{4}-\d{2}-\d{2}$/.test(String(x.checked || ''))) errors.push(`${w('architecture.yaml')}: source on component "${c.id}" needs a title, a URL and checked (YYYY-MM-DD)`);
  }
  // placement: a component with a type is drawn in an area (overview.yaml, checked below); one without sits in a rail
  const asRail = (layout.rails || []).flatMap(r => r.items || []);
  for (const id of asRail) { const c = comps.find(x => x.id === id); if (!c) errors.push(`${w('layout.yaml')}: rail lists unknown component "${id}"`); else if (c.type) errors.push(`${w('layout.yaml')}: "${id}" has a type, so it is drawn in an area, not listed in a rail`); }
  for (const c of comps.filter(x => !x.type)) { const n = asRail.filter(x => x === c.id).length; if (n !== 1) errors.push(`${w('layout.yaml')}: "${c.id}" (no type) is in the rails ${n} times (must be once)`); }
  for (const r of layout.rails || []) if (!r.id || !r.label || !(r.items || []).length) errors.push(`${w('layout.yaml')}: every rail needs an id, a label and items`);
  for (const e of map.connections || []) {
    for (const k of ['from', 'to']) if (!nodeIds.has(e[k])) errors.push(`${w('architecture.yaml')}: connection ${e.from} to ${e.to} names unknown "${e[k]}"`);
    for (const k of ['from', 'to']) if (asRail.includes(e[k])) errors.push(`${w('architecture.yaml')}: connection ${e.from} to ${e.to}: "${e[k]}" sits in a rail; only nodes connect`);
    if (e.kind && !ARCH_KINDS.includes(e.kind)) errors.push(`${w('architecture.yaml')}: connection ${e.from} to ${e.to} kind must be ${ARCH_KINDS.join(' | ')}`);
    if (e.sides && !(Array.isArray(e.sides) && e.sides.length === 2 && e.sides.every(x => ['t', 'b', 'l', 'r'].includes(x)))) errors.push(`${w('architecture.yaml')}: connection ${e.from} to ${e.to} sides must be [from, to], each t, b, l or r`);
  }
  for (const f of map.flows || []) {
    if (!f.id || !f.name || !(f.path || []).length) errors.push(`${w('architecture.yaml')}: every flow needs an id, a name and a path`);
    if (!(map.meta?.flow_groups || {})[f.group]) errors.push(`${w('architecture.yaml')}: flow "${f.id}" group must be one of meta.flow_groups`);
    for (const n of f.path || []) if (!nodeIds.has(n)) errors.push(`${w('architecture.yaml')}: flow "${f.id}" names unknown component "${n}"`);
    // a flow is traced in the diagram, so every step must be drawn there: a client or a component with a type, not a rail item
    for (const n of f.path || []) { const c = comps.find(x => x.id === n); if (c && !c.type) errors.push(`${w('architecture.yaml')}: flow "${f.id}" step "${n}" sits in a rail, which the diagram does not draw; a flow runs through the diagram only`); }
  }
  // overview: the simple view. Every drawn component (one with a type) sits in exactly one area, part or optional tag
  const areas = overview?.areas || [], aIds = new Set(areas.map(a => a.id)), wo = w('overview.yaml');
  if (!areas.length) errors.push(`${wo}: needs areas`);
  if (aIds.size !== areas.length) errors.push(`${wo}: duplicate area ids`);
  const inOverview = areas.flatMap(a => [...(a.components || []), ...(a.parts || []).flatMap(p => p.components || []), ...(a.optional || []).flatMap(o => o.components || [])]);
  for (const a of areas) {
    if (!a.id || !a.name || !a.text) errors.push(`${wo}: every area needs an id, a name and a text`);
    if (a.beside && !aIds.has(a.beside)) errors.push(`${wo}: area "${a.id}" is beside unknown area "${a.beside}"`);
    for (const p of a.parts || []) {
      if (!p.id || !p.name || !(p.components || []).length) errors.push(`${wo}: every part of "${a.id}" needs an id, a name and components`);
      if (p.callout && !areas.some(b => b.id === p.callout && b.beside === a.id)) errors.push(`${wo}: part "${p.id}" calls out to "${p.callout}", which must be an area beside "${a.id}"`);
    }
    for (const o of a.optional || []) if (!o.name || !(o.components || []).length) errors.push(`${wo}: every optional tag in "${a.id}" needs a name and components`);
  }
  for (const id of inOverview) { const c = comps.find(x => x.id === id); if (!c) errors.push(`${wo}: names unknown component "${id}"`); else if (!c.type) errors.push(`${wo}: "${id}" sits in a rail, not in an area`); }
  for (const c of comps.filter(x => x.type)) { const n = inOverview.filter(x => x === c.id).length; if (n !== 1) errors.push(`${wo}: "${c.id}" appears ${n} times across the areas (must be once)`); }
  for (const [k, p] of Object.entries(site.reference_links || {})) {
    if (!refs.has(k)) errors.push(`${w('site.yaml')}: reference_links names unknown reference map "${k}"`);
    if (!PAGES.some(x => x.out === p)) errors.push(`${w('site.yaml')}: reference_links.${k} "${p}" is not a page`);
  }
  for (const f of site.features || []) {
    const c = comps.find(x => x.id === f.component);
    if (!['timeline', 'matrix'].includes(f.kind)) errors.push(`${w('site.yaml')}: feature kind must be timeline or matrix`);
    if (!c) { errors.push(`${w('site.yaml')}: feature names unknown component "${f.component}"`); continue; }
    for (const k of f.kind === 'timeline' ? ['field'] : ['rows', 'cols']) if (!Array.isArray(c[f[k]])) errors.push(`${w('site.yaml')}: feature on ${c.id}: "${f[k]}" is not a list on that component`);
  }
  return errors;
}
function renderArchitecture({ site, map, layout, overview, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const comps = archComponents(map), byId = Object.fromEntries(comps.map(c => [c.id, c]));
  const doms = Object.fromEntries((map.domains || []).map(d => [d.id, d]));
  const refs = map.meta?.reference_maps || {}, legendTxt = map.meta?.status_legend || {}, flows = map.flows || [];
  const count = f => comps.filter(f).length;
  const cx = map.client_context || {};
  const clients = archClients(map);
  const sw = st => `<i class="sw st-${st}"></i>`;
  const FG = map.meta?.flow_groups || {};
  const controls = `<div class="ei-flowbar"><label for="ei-flow-sel">Trace a key flow</label><div class="sel"><select id="ei-flow-sel"><option value="">None</option>`
    + Object.entries(FG).map(([g, label]) => `<optgroup label="${esc(label)}">${flows.filter(f => f.group === g).map(f => `<option value="${esc(f.id)}">${esc(f.id)} · ${esc(f.name)}</option>`).join('')}</optgroup>`).join('')
    + `</select></div><span class="hint">Numbered steps show the path; press Esc to clear.</span></div>`;
  const shape = t => ({ system: '<svg width="26" height="18"><rect x="5" y="2" width="16" height="14" rx="1" fill="#fff" stroke="#14130f" stroke-width="1.3"/><path d="M5 5H21" stroke="#14130f" stroke-width="1.3"/><path d="M9 2V16" stroke="#14130f" stroke-width="1"/></svg>',
    process: '<svg width="26" height="18"><rect x="1" y="3" width="24" height="12" rx="6" fill="#fff" stroke="#14130f" stroke-width="1.3"/></svg>',
    technology: '<svg width="26" height="18"><rect x="1" y="3" width="24" height="12" rx="1" fill="#fff" stroke="#14130f" stroke-width="1.3"/><path d="M4 6V12" stroke="#14130f" stroke-width="2"/></svg>',
    control: '<svg width="26" height="18"><path d="M5 3H21L25 9L21 15H5L1 9Z" fill="#fff" stroke="#14130f" stroke-width="1.3"/></svg>',
    key: '<svg width="26" height="18"><rect x="1" y="2" width="24" height="14" rx="4" fill="#14130f"/><circle cx="8" cy="9" r="3" fill="none" stroke="#f8f6f2" stroke-width="1.4"/><path d="M11 9H20M17 9V12" stroke="#f8f6f2" stroke-width="1.4"/></svg>' })[t];
  const legend = `<details class="ei-legend-box"><summary>Legend</summary><div class="ei-legend bottom"><span class="lt">Shapes</span>`
    + ['system', 'process', 'technology', 'control', 'key'].map(t => `<span>${shape(t)} ${({ system: 'System of record', process: 'Process', technology: 'Technology or platform', control: 'Control, limit or gate', key: 'Key material' })[t]}</span>`).join('')
    + `<span class="lt">Lines</span><span><svg width="34" height="10"><path d="M1 5H31" stroke="#4b4740" stroke-width="2"/></svg> The flow between areas</span><span><svg width="34" height="10"><path d="M1 5H33" stroke="#0ea5e9" stroke-width="3"/></svg> A traced key flow</span>`
    + `<span class="lt">Areas</span><span><svg width="34" height="16"><rect x="1" y="1" width="32" height="14" rx="4" fill="none" stroke="#14130f" stroke-width="1.2" stroke-dasharray="4 3"/></svg> Optional</span><span><svg width="34" height="10"><path d="M1 5H33" stroke="#4338ca" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round"/></svg> Calls out to</span>`
    + `<span class="lt">Tags</span><span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="3" fill="#0369a1"/><text x="15" y="10" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="Archivo, sans-serif">DDQ</text></svg> Due diligence questions on their own page</span></div></details>`;
  const features = featuresHtml(site.features, byId);
  const D = site.ddq || {};
  const systems = SYSTEMS.length ? `<div class="ei-h ddq"><b>${esc(D.title || 'Due diligence questions')}</b>${D.text ? `<span>${esc(D.text)}</span>` : ''}</div>${ddqListHtml(out)}` : '';
  const ddq = {}; for (const sy of SYSTEMS) for (const id of sy.components || []) (ddq[id] = ddq[id] || []).push({ id: sy.id, title: sy.title, href: relHref(out, sy.out), n: qCount(sy) });
  const data = { kind: 'architecture', version, flows, status_legend: legendTxt,
    rails: (layout.rails || []).map(r => Object.assign({}, r, { items: r.items.map(id => ({ id, name: byId[id].short || byId[id].name, status: byId[id].status, source: byId[id].source, domain: byId[id].domain })) })),
    context: { lines: [['Accessing from', (cx.access_origin || []).map(human).join(' · ')], ['Nationality', (cx.nationality || []).map(human).join(' · ')]], rule: cx.routing_rule || '' },
    edges: (map.connections || []).map(e => ({ from: e.from, to: e.to, kind: e.kind || 'instruction', label: e.label || '', sides: e.sides || null })), ddq,
    clients: Object.fromEntries(clients.map(c => [c.id, Object.assign({}, c, { sub: c.states.map(human).join(' · ') })])),
    refs: Object.fromEntries(Object.keys(refs).map(r => [r, { label: refLabel(r), abbr: refAbbr(r), text: refs[r], href: site.reference_links?.[r] ? relHref(out, site.reference_links[r]) : null }])),
    domains: Object.fromEntries(Object.values(doms).map(d => [d.id, { name: d.name }])),
    components: Object.fromEntries(comps.map(c => [c.id, Object.assign({}, c, { lists: Object.entries(c).filter(([k, v]) => !ARCH_FIELDS.has(k) && Array.isArray(v)).map(([k, v]) => [human(k), v.map(x => human(x))]) })])),
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a component to see what it covers and how it connects; click to pin it.' },
    overview: overview.areas.map(a => Object.assign({}, a, { components: a.components || [], parts: a.parts || [], optional: a.optional || [] })) };
  return fillCommon(read('src/architecture.html').replace('__STYLE__', style), { site, out, data })
    .replace('__CONTROLS__', controls).replace('__ARCH_LEGEND__', legend).replace('__FEATURES__', features).replace('__SYSTEMS__', () => systems)
    .replace('__SECTIONS__', sectionsHtmlC(site));
}

// timeline and matrix panels drawn from one component's lists (screening lifecycle, tolerance matrix)
function featuresHtml(list, byId) {
  return (list || []).map(f => { const c = byId[f.component];
    const head = `<div class="ei-tier-h"><b>${esc(f.title || c.name)}</b>${f.text ? `<span>${esc(f.text)}</span>` : ''}</div>`;
    if (f.kind === 'timeline') return `<div class="ei-feature">${head}<ol class="ei-tl">${c[f.field].map((k, i) => { const L = (f.labels || {})[k] || {};
      return `<li><span class="num">${i + 1}</span><b>${esc(L.title || human(k))}</b>${L.text ? `<p>${esc(L.text)}</p>` : ''}</li>`; }).join('')}</ol><p class="from">From ${esc(c.id)}, ${esc(c.name)}</p></div>`;
    return `<div class="ei-feature">${head}<div class="ei-mx"><table class="ei-std"><thead><tr><th></th>${c[f.cols].map(x => `<th>${esc(human(x))}</th>`).join('')}</tr></thead><tbody>`
      + c[f.rows].map(r => `<tr><th>${esc(human(r))} exposure</th>${c[f.cols].map(() => `<td><span class="cell">Action per category</span></td>`).join('')}</tr>`).join('') + `</tbody></table>`
      + (f.list && c[f.list] ? `<div class="cats"><span class="rl">${esc(human(f.list))}</span>${c[f.list].map(x => `<span>${esc(x)}</span>`).join('')}</div>` : '') + `</div><p class="from">From ${esc(c.id)}, ${esc(c.name)}</p></div>`; }).join('');
}

// ---------- due diligence pages (data/architecture/systems/<id>/system.yaml) ----------
const SYS_KEYS = ['title', 'short', 'group', 'tagline', 'order', 'summary', 'components', 'last_reviewed', 'models', 'models_title', 'guidance', 'curriculum', 'features', 'sections', 'sources', 'id', 'dir', 'out'];
function validateSystem({ dir, sys }) {
  const errors = [], w = `${dir}/system.yaml`, comps = archComponents(ARCH()), byId = Object.fromEntries(comps.map(c => [c.id, c]));
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(sys.id)) errors.push(`${w}: the folder name must be lowercase letters, digits and hyphens`);
  for (const k of ['title', 'short', 'tagline', 'summary']) if (!sys[k]) errors.push(`${w}: missing "${k}"`);
  const groups = ARCH_SITE().ddq?.groups || {};
  if (!groups[sys.group]) errors.push(`${w}: group must be one of ${Object.keys(groups).join(', ')} (ddq.groups in data/architecture/site.yaml)`);
  for (const k of Object.keys(sys)) if (!SYS_KEYS.includes(k)) errors.push(`${w}: unknown key "${k}"`);
  if (typeof sys.order !== 'number') errors.push(`${w}: order must be a number`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(sys.last_reviewed || ''))) errors.push(`${w}: last_reviewed must be YYYY-MM-DD`);
  if (!(sys.components || []).length) errors.push(`${w}: components must list at least one blueprint component`);
  for (const id of sys.components || []) if (!byId[id]) errors.push(`${w}: unknown component "${id}" (see data/architecture/architecture.yaml)`);
  for (const m of sys.models || []) {
    if (!m.name || !m.text) errors.push(`${w}: every model needs a name and a text`);
    if (m.link && !SYSTEMS.some(x => x.id === m.link)) errors.push(`${w}: model "${m.name}" links to unknown system "${m.link}"`);
  }
  for (const g of [...(sys.guidance || []), ...(sys.curriculum || [])]) if (!g.title || !g.text) errors.push(`${w}: every guidance and curriculum entry needs a title and a text`);
  if (!(sys.sections || []).length) errors.push(`${w}: needs at least one section of questions`);
  for (const sec of sys.sections || []) {
    if (!sec.title || !(sec.questions || []).length) errors.push(`${w}: every section needs a title and questions`);
    for (const q of sec.questions || []) {
      if (!q.q) errors.push(`${w}: a question in "${sec.title}" has no "q"`);
      for (const k of Object.keys(q)) if (!['q', 'why', 'must'].includes(k)) errors.push(`${w}: a question in "${sec.title}" has unknown key "${k}" (a comma or colon inside an unquoted value?)`);
      if (q.must !== undefined && typeof q.must !== 'boolean') errors.push(`${w}: "must" must be true or false`);
    }
  }
  for (const f of sys.features || []) {
    const c = byId[f.component];
    if (!['timeline', 'matrix'].includes(f.kind)) errors.push(`${w}: feature kind must be timeline or matrix`);
    if (!c) { errors.push(`${w}: feature names unknown component "${f.component}"`); continue; }
    for (const k of f.kind === 'timeline' ? ['field'] : ['rows', 'cols']) if (!Array.isArray(c[f[k]])) errors.push(`${w}: feature on ${c.id}: "${f[k]}" is not a list on that component`);
  }
  SRC_OK(errors, w, sys.title, sys.sources);
  return errors;
}
function renderSystem({ sys, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const archSite = parse(read('data/architecture/site.yaml')), D = archSite.ddq || {}, repo = archSite.contribute?.repo || '';
  const comps = archComponents(ARCH()), byId = Object.fromEntries(comps.map(c => [c.id, c]));
  const archHref = relHref(out, 'architecture');
  const chips = (sys.components || []).map(id => `<a class="chip" href="${archHref}#${esc(id)}"><span class="cid">${esc(id)}</span>${esc(byId[id].short || byId[id].name)}</a>`).join('');
  const models = (sys.models || []).length ? `<div class="ei-h"><b>${esc(sys.models_title || 'Ways to buy or run it')}</b></div><div class="ei-models">${sys.models.map(m => `<div class="ei-model"><h3>${esc(m.name)}</h3><p>${esc(m.text)}</p>`
    + ((m.examples || []).length ? `<p class="ex"><span>Examples</span>${m.examples.map(x => `<i>${esc(x)}</i>`).join('')}</p>` : '')
    + (m.link ? `<p class="more"><a href="${relHref(out, `architecture/${m.link}`)}">${esc(SYSTEMS.find(x => x.id === m.link).title)} questions →</a></p>` : '') + '</div>').join('')}</div>` : '';
  const guidance = (sys.guidance || []).length ? `<div class="ei-guides">${sys.guidance.map(g => `<div class="ei-guide"><h3>${esc(g.title)}</h3><p>${esc(g.text)}</p></div>`).join('')}</div>` : '';
  const curriculum = (sys.curriculum || []).length ? `<div class="ei-h"><b>Curriculum</b><span>The minimum to cover, for everyone who handles digital assets or the clients who hold them.</span></div><ol class="ei-curr">${sys.curriculum.map(c => `<li><b>${esc(c.title)}</b><p>${esc(c.text)}</p></li>`).join('')}</ol>` : '';
  const features = (sys.features || []).length ? `<div class="ei-features">${featuresHtml(sys.features, byId)}</div>` : '';
  const questions = sys.sections.map((sec, i) => `<section class="ei-qs"><h2><span class="n">${i + 1}</span>${esc(sec.title)}</h2><ol>`
    + sec.questions.map((q, j) => `<li id="q${i + 1}-${j + 1}"><span class="qn">${i + 1}.${j + 1}</span><div><p class="q">${esc(q.q)}${q.must ? ' <span class="must">Can rule a provider out</span>' : ''}</p>${q.why ? `<p class="why">${esc(q.why)}</p>` : ''}</div></li>`).join('') + '</ol></section>').join('');
  const text = [`${sys.title}: due diligence questions`, `Source: Ethereum Institutional, ${sys.dir}/system.yaml (reviewed ${sys.last_reviewed})`, '',
    ...sys.sections.flatMap((sec, i) => [`${i + 1}. ${sec.title}`, ...sec.questions.map((q, j) => `${i + 1}.${j + 1} ${q.q}${q.must ? ' [can rule a provider out]' : ''}`), ''])].join('\n');
  // the same questions as a spreadsheet: one row per question, for a reader's own questionnaire
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '\ufeff' + [['Number', 'Section', 'Question', 'Can rule a provider out', 'What a good answer shows'],
    ...sys.sections.flatMap((sec, i) => sec.questions.map((q, j) => [`${i + 1}.${j + 1}`, sec.title, q.q, q.must ? 'Yes' : '', q.why || '']))]
    .map(r => r.map(cell).join(',')).join('\r\n');
  const csvLink = `<a class="btn" download="${esc(sys.id)}-due-diligence-questions.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(csv)}">Download CSV</a>`;
  const sources = (sys.sources || []).length ? `<div class="ei-section"><h2>Sources</h2>${srcHtmlC(sys.sources)}</div>` : '';
  const contrib = repo ? `<div class="ei-contrib"><p><b>${esc(D.contribute?.title || 'Suggest a question.')}</b> ${esc(D.contribute?.text || '')}</p><p class="links"><a href="${repo}/edit/main/${sys.dir}/system.yaml">Edit this page's YAML</a><a href="${repo}/issues/new?title=${encodeURIComponent(`DDQ: ${sys.title}`)}">Open an issue</a><a href="${repo}/tree/main/${sys.dir}">View on GitHub</a></p></div>` : '';
  const others = ddqListHtml(out, sys.id);
  const notice = D.notice ? `<div class="ei-notice" role="note"><b>${esc(D.notice.title)}</b> ${esc(D.notice.text)}</div>` : '';
  const musts = sys.sections.reduce((n, sec) => n + sec.questions.filter(q => q.must).length, 0);
  return read('src/system.html').replace('__STYLE__', () => style)
    .replace(/__TITLE__/g, () => esc(sys.title)).replace('__NAV__', () => navHtml(out)).replace('__ARCH_HREF__', () => archHref).replace('__INTRO__', () => esc(sys.summary)).replace('__NOTICE__', () => notice)
    .replace('__CHIPS__', () => chips).replace('__MODELS__', () => models).replace('__GUIDANCE__', () => guidance).replace('__CURRICULUM__', () => curriculum).replace('__FEATURES__', () => features)
    .replace('__QCOUNT__', () => `${qCount(sys)} questions in ${sys.sections.length} sections${musts ? `; ${musts} can rule a provider out` : ''}. Reviewed ${esc(String(sys.last_reviewed))}.`)
    .replace('__QUESTIONS__', () => questions).replace('__CSV__', () => csvLink).replace('__COPYTEXT__', () => JSON.stringify(text).replace(/<\//g, '<\\/'))
    .replace('__SOURCES__', () => sources).replace('__CONTRIB__', () => contrib).replace('__OTHERS__', () => others)
    .replace('__FOOTNOTE__', () => esc(archSite.footnote || '')).replace('__VERSION__', () => `Version ${esc(version)} · built ${stamp}`);
}

// the Ethereum Institutional favicon (src/icons, taken from ethereuminstitutional.org), inlined in every page's head so
// it works on nested pages, in the downloadable release HTML and in the fragment variant alike
const ICONS = (() => { const b64 = f => fs.readFileSync(path.join(root, 'src/icons', f)).toString('base64');
  return `\n<link rel="icon" href="data:image/svg+xml;base64,${b64('favicon.svg')}" type="image/svg+xml">`
    + `\n<link rel="icon" href="data:image/png;base64,${b64('favicon-32.png')}" type="image/png" sizes="32x32">`
    + `\n<link rel="apple-touch-icon" href="data:image/png;base64,${b64('apple-touch-icon.png')}" sizes="180x180">`; })();
const withIcons = html => html.replace('</title>', '</title>' + ICONS);

const pages = PAGES.filter(p => p.sys || fs.existsSync(path.join(root, p.dir, 'site.yaml'))).map(p => Object.assign(p, p.sys ? { system: true } : load(p.dir)));
const errors = pages.flatMap(validate);
if (errors.length) { console.error('Validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }

for (const p of pages) {
  const outDir = path.join(root, 'dist', p.out);
  fs.mkdirSync(outDir, { recursive: true });
  if (p.system) { fs.writeFileSync(path.join(outDir, 'index.html'), withIcons(renderSystem(p))); console.log(`Built ${path.join('dist', p.out, 'index.html')} (due diligence, ${qCount(p.sys)} questions)`); continue; }
  if (p.static) { fs.writeFileSync(path.join(outDir, 'index.html'), withIcons(renderStatic(p))); console.log(`Built ${path.join('dist', p.out, 'index.html')} (static page)`); continue; }
  if (p.index) { fs.writeFileSync(path.join(outDir, 'index.html'), withIcons(renderIndex(p))); console.log(`Built ${path.join('dist', p.out, 'index.html')} (index, ${(p.site.scenarios || []).length} scenarios)`); continue; }
  const page = withIcons(p.scenario ? renderScenario(p) : p.arch ? renderArchitecture(p) : p.radial ? renderRadial(p) : render(p)), slug = p.site.slug || 'digital-asset-taxonomy';
  fs.writeFileSync(path.join(root, 'dist', `${slug}.html`), page);
  // Artifact variant: same page without the document skeleton (for hosts that wrap the fragment themselves)
  const head = page.slice(page.indexOf('<title>'), page.indexOf('</style>') + 8);
  const body = page.slice(page.indexOf('<body>') + 6, page.lastIndexOf('</body>'));
  fs.writeFileSync(path.join(root, 'dist', `${slug}.fragment.html`), head + '\n' + body);
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(p.arch ? `Built ${path.join('dist', p.out, 'index.html')} (architecture, ${archComponents(p.map).length} components, ${(p.map.connections || []).length} connections, ${(p.map.flows || []).length} flows)` : p.scenario ? `Built ${path.join('dist', p.out, 'index.html')} (scenario, ${p.sc.actors.length} actors, ${p.sc.steps.length} steps)` : p.radial
    ? `Built ${path.join('dist', p.out, 'index.html')} (${p.rings.rings.length} ${p.gauges ? 'levels' : 'rings'}, ${p.themes.themes.length} ${p.gauges ? 'gauges' : 'themes'}, ${(p.lenses || []).length} lenses), version ${version}`
    : `Built ${path.join('dist', p.out, 'index.html')} (${p.circles.circles.length} circles, ${p.lenses.length} lenses, ${p.tokens.tokens.length} badges), version ${version}`);
}
