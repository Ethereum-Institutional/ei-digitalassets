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
  // index pages list scenarios with filters; scenario pages hold one scenario (actors, steps, tokens, standards)
  if (site.kind === 'index') return { dir, site, index: true };
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
    if (!NAV.some(n => n.path === c.path)) errors.push(`${where('site.yaml')}: card path "${c.path}" is not in data/nav.yaml`);
    if (!c.title || !c.text) errors.push(`${where('site.yaml')}: every card needs a title and text`);
  }
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
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
function validateIndex({ dir, site }) {
  const errors = validateStatic({ dir, site }), where = `${dir}/site.yaml`;
  const roles = new Set((site.filters?.roles || []).map(r => r.id)), moves = new Set((site.filters?.moves || []).map(m => m.id));
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
  if (page.static) return validateStatic(page);
  if (page.index) return validateIndex(page);
  if (page.scenario) return validateScenario(page);
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
  for (const k of ['title', 'eyebrow', 'intro', 'lens_help', 'footnote']) if (!site[k]) errors.push(`${where('site.yaml')}: missing "${k}"`);
  if (!site.heading?.text) errors.push(`${where('site.yaml')}: missing heading.text`);
  if (site.badge && !['disc', 'pill'].includes(site.badge)) errors.push(`${where('site.yaml')}: badge must be disc or pill`);
  if (site.contribute && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.contribute.repo || '')) errors.push(`${where('site.yaml')}: contribute.repo must be a https://github.com/<owner>/<repo> URL`);
  for (const n of site.nav || []) if (!n.label) errors.push(`${where('site.yaml')}: every nav item needs a label`);
  for (const l of site.legend || []) if (!LEGEND_KINDS.includes(l.kind) || !l.text) errors.push(`${where('site.yaml')}: legend items need kind (${LEGEND_KINDS.join(' | ')}) and text`);
  for (const t of tokens.tokens) if (t.mark && !/^[A-Z]{2,4}$/.test(t.mark)) errors.push(`${where('badges')}: "${t.ticker}" mark must be 2 to 4 capital letters`);
  for (const t of tokens.tokens) if (t.kind && !['network', 'participant', 'element'].includes(t.kind)) errors.push(`${where('badges')}: "${t.ticker}" kind must be network, participant or element`);
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
const relHref = (from, to) => { const up = '../'.repeat(from ? from.split('/').length : 0); return to ? `${up}${to}/` : (up || './'); };
const navHtml = out => `<nav class="ei-nav" aria-label="Pages">${NAV.map(n => n.path === out
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
  const cards = (site.scenarios || []).map(sc => { const live = !!sc.path;
    return `<${live ? `a class="ei-card" href="${relHref(out, sc.path)}"` : 'div class="ei-card planned"'} data-roles="${(sc.roles || []).join(' ')}" data-moves="${(sc.moves || []).join(' ')}"><h2>${esc(sc.title)}${live ? '' : ' ' + TAG}</h2><p>${esc(sc.text)}</p>`
      + `<p class="tags">${(sc.moves || []).map(m => `<span class="m">${esc((F.moves || []).find(x => x.id === m)?.label || m)}</span>`).join('')}${(sc.roles || []).map(r => `<span>${esc((F.roles || []).find(x => x.id === r)?.label || r)}</span>`).join('')}</p>`
      + (live ? `<span class="go">Open the scenario →</span>` : '') + `</${live ? 'a' : 'div'}>`; }).join('');
  const body = `<div class="ei-filters">${F.roles ? chips('roles', F.roles) : ''}${F.moves ? chips('moves', F.moves) : ''}<button type="button" class="clear" hidden>Show all</button></div><div class="ei-cards" id="ei-cards">${cards}</div>
<script>(function(){ const on={roles:null,moves:null}; const cards=[...document.querySelectorAll('#ei-cards .ei-card')], clear=document.querySelector('.ei-filters .clear');
  const apply=()=>{ cards.forEach(c=>{ const ok=(!on.roles||c.dataset.roles.split(' ').includes(on.roles))&&(!on.moves||c.dataset.moves.split(' ').includes(on.moves)); c.hidden=!ok; }); clear.hidden=!on.roles&&!on.moves;
    document.querySelectorAll('.ei-filter').forEach(f=>f.querySelectorAll('button').forEach(b=>{ const a=on[f.dataset.filter]===b.dataset.v; b.classList.toggle('on',a); b.setAttribute('aria-pressed',String(a)); })); };
  document.querySelectorAll('.ei-filter').forEach(f=>f.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ on[f.dataset.filter]=on[f.dataset.filter]===b.dataset.v?null:b.dataset.v; apply(); })));
  clear.addEventListener('click',()=>{ on.roles=null; on.moves=null; apply(); }); })();</script>`;
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
  .ei-card[hidden]{display:none}
</style>`).replace('__TITLE__', esc(site.title)).replace('__EYEBROW__', esc(site.eyebrow)).replace('__HEADING__', sh.heading)
    .replace('__INTRO__', esc(site.intro)).replace('__NAV__', navHtml(out)).replace('__BODY__', body).replace('__NOTICE__', sh.notice)
    .replace('__CONTRIBUTE__', sh.contribute).replace('__FOOTNOTE__', esc(site.footnote)).replace('__VERSION__', `Version ${esc(version)} · built ${stamp}`);
}
function renderScenario({ site, sc, out }) {
  const tpl = read('src/template.html'), style = tpl.slice(tpl.indexOf('<style>'), tpl.indexOf('</style>') + 8);
  const data = { actors: sc.actors, steps: sc.steps, kind: 'scenario', version,
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a step in the diagram to read what happens; click to pin it.' } };
  const tags = (sc.tags || []).length ? `<div class="ei-tags">${sc.tags.map(t => `<span class="${t.kind === 'move' ? 'm' : ''}">${esc(t.label)}</span>`).join('')}</div>` : '';
  const actorsHtml = `<div class="ei-actors">${sc.actors.map(a => `<div class="ei-actor"><h3><i class="${esc(a.kind || 'institution')}"></i>${esc(a.name)}</h3><p>${esc(a.role)}</p></div>`).join('')}</div>`;
  const tokensHtml = `<div class="ei-cards2">${(sc.tokens || []).map(t => `<div class="ei-card2"><h3>${t.circle ? `<a href="${relHref(out, 'taxonomy')}">${esc(t.name)}</a>` : esc(t.name)}</h3>${t.place ? `<p class="sub">${esc(t.place)}</p>` : ''}<p>${esc(t.role)}</p>${t.example ? `<p class="sub" style="margin-top:6px">${esc(t.example)}</p>` : ''}${srcHtml(t.sources)}</div>`).join('')}</div>`;
  const stdHtml = `<table class="ei-std"><thead><tr><th>Standard</th><th>Status</th><th>Role in this scenario</th></tr></thead><tbody>${(sc.standards || []).map(x => `<tr><td><a href="${x.url}" target="_blank" rel="noopener">${esc(x.id)}</a><br><span style="color:var(--muted);font-size:12px">${esc(x.title)}</span></td><td><span class="st">${esc(x.status)}</span></td><td>${esc(x.role)}</td></tr>`).join('')}</tbody></table>`;
  return fillCommon(read('src/scenario.html').replace('__STYLE__', style), { site, out, data })
    .replace('__TAGS__', tags).replace('__ACTORS__', actorsHtml).replace('__TOKENS__', tokensHtml).replace('__STANDARDS__', stdHtml)
    .replace('__FLOW_HELP__', esc(sc.flow_help || 'Each column is an actor; each row is a step. Dashed arrows are off-ledger, solid arrows are on the ledger, and a band across several columns is one transaction that either completes in full or not at all.'))
    .replace('__SECTIONS__', sectionsHtml({ sections: sc.sections || [] }) + ((sc.sources || []).length ? `<div class="ei-sections"><div class="ei-section"><h2>Sources</h2>${srcHtml(sc.sources)}</div></div>` : ''));
}
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
const swatch = l => l.kind === 'pill'
    ? `<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="6" fill="${esc(l.color || '#14130f')}"/></svg>`
    : l.kind === 'expand'
    ? `<svg width="40" height="18" aria-hidden="true"><ellipse cx="17" cy="9" rx="15" ry="7" fill="#e3e7ea" stroke="${esc(l.color || '#14130f')}" stroke-width="1.5"/><text x="36" y="13" text-anchor="middle" font-size="12" font-weight="600" fill="#615f5a">+</text></svg>`
    : l.kind === 'mark'
    ? `<svg width="40" height="18" aria-hidden="true"><rect x="1" y="4" width="28" height="12" rx="6" fill="#6b6760"/><circle cx="30" cy="8" r="7.5" fill="${esc(l.color || '#14130f')}" stroke="#f8f6f2" stroke-width="1.5"/><text x="30" y="10" text-anchor="middle" font-size="5" font-weight="700" fill="#f2efe9">ETH</text></svg>`
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
    tokens: tokens.tokens, lenses, version, bridges: layout.bridges || {}, annotations: layout.annotations || [],
    lens_groups: site.lens_groups || [], badge: site.badge || 'disc',
    panel: site.panel_default || { title: site.heading.text, text: 'Hover over a circle to preview how Ethereum Institutional defines it; click to pin the definition here.' },
  };
  return fillCommon(read('src/template.html'), { site, out, data })
    .replace('__LENS_TITLE__', esc(site.lens_title || 'Regulatory lenses')).replace('__LENS_HELP__', esc(site.lens_help));
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

const pages = PAGES.filter(p => fs.existsSync(path.join(root, p.dir, 'site.yaml'))).map(p => Object.assign(p, load(p.dir)));
const errors = pages.flatMap(validate);
if (errors.length) { console.error('Validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }

for (const p of pages) {
  const outDir = path.join(root, 'dist', p.out);
  fs.mkdirSync(outDir, { recursive: true });
  if (p.static) { fs.writeFileSync(path.join(outDir, 'index.html'), renderStatic(p)); console.log(`Built ${path.join('dist', p.out, 'index.html')} (static page)`); continue; }
  if (p.index) { fs.writeFileSync(path.join(outDir, 'index.html'), renderIndex(p)); console.log(`Built ${path.join('dist', p.out, 'index.html')} (index, ${(p.site.scenarios || []).length} scenarios)`); continue; }
  const page = p.scenario ? renderScenario(p) : p.radial ? renderRadial(p) : render(p), slug = p.site.slug || 'digital-asset-taxonomy';
  fs.writeFileSync(path.join(root, 'dist', `${slug}.html`), page);
  // Artifact variant: same page without the document skeleton (for hosts that wrap the fragment themselves)
  const head = page.slice(page.indexOf('<title>'), page.indexOf('</style>') + 8);
  const body = page.slice(page.indexOf('<body>') + 6, page.lastIndexOf('</body>'));
  fs.writeFileSync(path.join(root, 'dist', `${slug}.fragment.html`), head + '\n' + body);
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(p.scenario ? `Built ${path.join('dist', p.out, 'index.html')} (scenario, ${p.sc.actors.length} actors, ${p.sc.steps.length} steps)` : p.radial
    ? `Built ${path.join('dist', p.out, 'index.html')} (${p.rings.rings.length} ${p.gauges ? 'levels' : 'rings'}, ${p.themes.themes.length} ${p.gauges ? 'gauges' : 'themes'}, ${(p.lenses || []).length} lenses), version ${version}`
    : `Built ${path.join('dist', p.out, 'index.html')} (${p.circles.circles.length} circles, ${p.lenses.length} lenses, ${p.tokens.tokens.length} badges), version ${version}`);
}
