#!/usr/bin/env node
// Trims a copy of maps/ for the public mirror (owner, 16 November 2026): ei-digitalassets carries only the high level of
// the Architecture and Scenarios maps, and every click on them goes to ethereuminstitutional.org. The full maps stay in
// ei-platform. Run by maps-mirror.yml on the mirror's working copy, and by ei-platform's CI on a scratch copy:
//
//   node maps/scripts/public-trim.mjs <copy of maps/>
//
// What it does, from data/public.yaml in the copy:
//   Architecture  writes a site.yaml of kind architecture-overview (the areas, their one-line text and the custody steps),
//                 and removes architecture.yaml, layout.yaml, overview.yaml and the due diligence pages (systems/)
//   Scenarios     keeps the index (Venn, bands, role filter, one line per scenario) with a public_link, and removes every
//                 scenario folder
//   Docs          replaces the two folders' READMEs and their sections of CLAUDE.md and README.md with a short note
// Then it fails if any scenario step, component note, flow or due diligence question survives anywhere in the copy
// (CHANGELOG.md aside: the record of past releases stays as it was).
import fs from 'node:fs';
import path from 'node:path';
import { parse, parseDocument, stringify } from 'yaml';

const target = process.argv[2];
if (!target) { console.error('usage: node scripts/public-trim.mjs <copy of maps/>'); process.exit(2); }
const T = path.resolve(target), own = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// never trim the source itself
if (fs.realpathSync(T) === fs.realpathSync(own)) { console.error('public-trim: refusing to trim the source maps/ folder; pass a copy'); process.exit(2); }
const P = (...p) => path.join(T, ...p);
const readY = p => parse(fs.readFileSync(P(p), 'utf8'));
const fail = m => { console.error('public-trim: ' + m); process.exit(1); };
const PUB = readY('data/public.yaml');
if (!/^https:\/\//.test(PUB.link || '')) fail('data/public.yaml: link must be an https URL');

// ---------- collect what must not survive ----------
const sentinels = new Set();
const keep = s => { if (typeof s === 'string' && s.trim().length >= 40) sentinels.add(s.trim()); };
const walkStrings = (v, f) => { if (typeof v === 'string') f(v); else if (Array.isArray(v)) v.forEach(x => walkStrings(x, f)); else if (v && typeof v === 'object') Object.values(v).forEach(x => walkStrings(x, f)); };
const scDir = P('data/scenarios');
const scFolders = fs.readdirSync(scDir).filter(d => fs.existsSync(path.join(scDir, d, 'scenario.yaml')));
for (const d of scFolders) {
  const sc = readY(`data/scenarios/${d}/scenario.yaml`);
  for (const s of sc.steps || []) keep(s.text);
  for (const a of sc.actors || []) keep(a.role);
  for (const sec of sc.sections || []) for (const it of sec.items || []) keep(it.text);
}
const arch = readY('data/architecture/architecture.yaml');
for (const d of arch.domains || []) for (const c of d.components || []) { keep(c.notes); keep(c.desc); }
for (const f of arch.flows || []) { keep(f.text); keep(f.desc); }
const sysDir = P('data/architecture/systems');
if (fs.existsSync(sysDir)) for (const d of fs.readdirSync(sysDir)) {
  const f = path.join(sysDir, d, 'system.yaml'); if (!fs.existsSync(f)) continue;
  const sy = parse(fs.readFileSync(f, 'utf8'));
  for (const sec of sy.sections || []) for (const q of sec.questions || []) { keep(q.q); keep(q.why); }
  keep(sy.summary); for (const m of sy.models || []) keep(m.text);
}
const archSiteFull = readY('data/architecture/site.yaml');
keep(archSiteFull.intro_more);

// ---------- Architecture: the areas only ----------
const ov = readY('data/architecture/overview.yaml');
const callFrom = {}; for (const a of ov.areas) for (const p of a.parts || []) if (p.callout) callFrom[p.callout] = `Called by ${p.name.toLowerCase()} in the ${a.name.toLowerCase()}.`;
const areas = ov.areas.map(a => Object.assign({ id: a.id, name: a.name }, a.sub ? { sub: a.sub } : {}, { text: a.text },
  (a.parts || []).length ? { parts: a.parts.map(p => p.name) } : {}, a.beside ? { beside: a.beside } : {}, callFrom[a.id] ? { from: callFrom[a.id] } : {},
  a.id === 'ledger' ? { column: true } : {}));
const archSite = Object.assign({ kind: 'architecture-overview', title: archSiteFull.title, slug: archSiteFull.slug, eyebrow: archSiteFull.eyebrow, heading: archSiteFull.heading,
  intro: PUB.architecture.intro, public_link: PUB.link, legend: PUB.architecture.legend, public_cta: PUB.architecture.cta, column_label: 'submits to',
  areas }, archSiteFull.related ? { related: archSiteFull.related } : {}, { footnote: archSiteFull.footnote });
fs.writeFileSync(P('data/architecture/site.yaml'), '# Architecture, public mirror: the areas only, each linking to ethereuminstitutional.org (written by ei-platform\'s\n# scripts/public-trim.mjs; the full Architecture map is maintained by Ethereum Institutional and is not mirrored).\n\n' + stringify(archSite, { lineWidth: 0 }));
for (const f of ['architecture.yaml', 'layout.yaml', 'overview.yaml']) fs.rmSync(P('data/architecture', f), { force: true });
fs.rmSync(sysDir, { recursive: true, force: true });
fs.writeFileSync(P('data/architecture/README.md'), `# Architecture page

The public mirror carries only the high level of this page: the areas a digital asset team runs, from its clients to the
ledger, each linking to ethereuminstitutional.org (\`site.yaml\`, \`kind: architecture-overview\`). The components behind each
area, the key flows and the due diligence questions are maintained by Ethereum Institutional at
${PUB.link} and are not part of this repository.
`);

// ---------- Scenarios: the index only ----------
for (const d of scFolders) fs.rmSync(path.join(scDir, d), { recursive: true, force: true });
const idx = parseDocument(fs.readFileSync(P('data/scenarios/site.yaml'), 'utf8'));
idx.set('intro', PUB.scenarios.intro);
idx.set('public_link', PUB.link);
idx.set('public_cta', PUB.scenarios.cta);
fs.writeFileSync(P('data/scenarios/site.yaml'), String(idx));
fs.writeFileSync(P('data/scenarios/README.md'), `# Scenarios

The public mirror carries only the Scenarios index: the map of scenarios by what moves on the ledger, the bands and the
role filter, with one line per scenario (\`site.yaml\`). Each scenario opens on ethereuminstitutional.org; the scenario
pages (actors, steps, tokens, standards and sources) are maintained by Ethereum Institutional at ${PUB.link}
and are not part of this repository.
`);

// ---------- docs: CLAUDE.md and README.md ----------
const replaceBlock = (file, start, endRe, text) => {
  const s = fs.readFileSync(P(file), 'utf8'), i = s.indexOf(start);
  if (i < 0) fail(`${file}: could not find "${start}"; update scripts/public-trim.mjs`);
  const rest = s.slice(i + start.length), m = rest.match(endRe), j = m ? i + start.length + m.index : s.length;
  fs.writeFileSync(P(file), s.slice(0, i) + text + s.slice(j));
};
replaceBlock('CLAUDE.md', '## Architecture page (`data/architecture/`)\n', /\n## /, `## Architecture page (\`data/architecture/\`)

- **Public mirror (owner, 16 November 2026):** this repository carries only the high level of the Architecture page, the
  areas from the clients to the ledger with their one-line text, each linking to ethereuminstitutional.org
  (\`kind: architecture-overview\`, written by ei-platform's \`scripts/public-trim.mjs\` from \`data/public.yaml\`). The
  components, key flows and due diligence questions are maintained by Ethereum Institutional and are not mirrored.
`);
replaceBlock('CLAUDE.md', '- **Scenarios** (`data/scenarios/`):', /\n(- |## )|$/, `- **Scenarios** (\`data/scenarios/\`): this repository carries only the index (owner, 16 November 2026): the Venn of
  scenarios by what moves on the ledger, the bands, the role filter and one line per scenario, each opening on
  ethereuminstitutional.org (\`public_link\` in \`site.yaml\`). The scenario pages are maintained by Ethereum Institutional
  and are not mirrored.
`);
replaceBlock('README.md', '- **Scenarios**:', /\n- \*\*/, `- **Scenarios**: what institutions do with digital assets, placed on a map by what moves on the ledger and filtered by
  your role; each scenario opens on ethereuminstitutional.org.`);

// ---------- guard: nothing of the full maps survives ----------
for (const p of ['data/architecture/architecture.yaml', 'data/architecture/overview.yaml', 'data/architecture/systems'])
  if (fs.existsSync(P(p))) fail(`${p} survived the trim`);
const leftover = fs.readdirSync(scDir).filter(d => fs.statSync(path.join(scDir, d)).isDirectory());
if (leftover.length) fail(`scenario folders survived the trim: ${leftover.join(', ')}`);
const SKIP = new Set(['.git', 'node_modules', 'dist', 'CHANGELOG.md']);
const files = []; const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (SKIP.has(e.name)) continue;
  const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(ya?ml|md|mjs|js|html|json|txt|csv)$/.test(e.name)) files.push(f); } };
walk(T);
const found = [];
for (const f of files) { const s = fs.readFileSync(f, 'utf8'); for (const x of sentinels) if (s.includes(x)) found.push(`${path.relative(T, f)}: "${x.slice(0, 70)}…"`); }
if (found.length) fail(`full-map text survived the trim:\n  ${found.join('\n  ')}`);
console.log(`public-trim: Architecture reduced to ${areas.length} areas, ${scFolders.length} scenario pages removed, ${sentinels.size} passages checked absent; every click goes to ${PUB.link}`);
