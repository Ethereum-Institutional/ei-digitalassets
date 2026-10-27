# Architecture page

A blueprint of what a digital asset team runs inside an institution, from the clients at the top to the private keys
at the bottom, with a due diligence page for each system an institution may procure. Rendered by
`src/architecture.html` (the blueprint) and `src/system.html` (each due diligence page).

- `architecture.yaml`: the content. `client_context` (segments and their states, access origin, nationality, the
  routing rule), `domains` (each with `components`), `connections`, `flows` and `meta` (`status_legend`,
  `reference_maps`).
- `layout.yaml`: the geometry. `lanes` (top to bottom), `main` (the lanes' x range), `column` (ledger, nodes and data),
  `rails` (domains that apply to every lane, listed as `items`; they are listed under the blueprint, not drawn in it),
  `context` (the access and nationality box) and `nodes` (`id: [x, y]` or `[x, y, width]`, centers in canvas units).
  Columns sit on a 200-unit grid (x = 124, 324, 524, 724, 924) and x = 524 is the spine the main transaction runs down; keep connected components in the same
  column or in adjacent columns so lines stay short. Every component is placed exactly once, as a node or a rail item;
  client segments are nodes named `CL.<segment id>`.
- `site.yaml`: page text, `reference_links` (reference map id to a page on this site) and `ddq` (the shared text of the
  due diligence pages).
- `systems/<id>/system.yaml`: one due diligence page per system, found by the build automatically. See
  [systems/README.md](systems/README.md) to propose a question or add a system.

**Components** need `id` (numbered under their domain, e.g. `D3.2`), `name` and `status` (`existing` | `extend` |
`new` | `evaluate`); a component drawn as a node also needs `type` (`system` for a system of record, `process`,
`technology`, `control`, or `key`). Optional: `short` (the label in the box), `source` (`brief` | `suggested`; a
domain's `source` applies to its components), `notes`, `maps_to` (keys of `meta.reference_maps`) and any list (e.g.
`examples`, `controls`, `techniques`, `topics`, `scenarios`), which the detail card shows under a heading made from
its key, and `sources` (`{ title, url, checked }`, for the standard or regulation behind it), shown at the foot of the
card. Status is generic: how most global banks and similar institutions are likely to meet the need, not one firm's
plan. Quote a list item that contains a comma, or YAML splits it. A component listed in a system's `components` gets a DDQ tag on the blueprint and a link in its card.

**Connections** are `{ from, to, kind, label, sides }` between nodes (not rail items). `kind` is `instruction` (an
order or request moves; the default, solid), `data` (records or signals; dashed) or `control` (a check, limit or rule;
dotted). `sides: [from, to]` forces the side a line leaves and enters (`t`, `b`, `l`, `r`); `[l, l]` or `[r, r]` runs
it along the margin past the boxes in between. A label is drawn only where it clears every box; it always shows in the
detail card. **Flows** are an ordered `path`; a step follows the drawn connection between two components where there
is one. `architecture/#D5.1` opens the blueprint with that component pinned.

Boxes differ only by shape, which shows the type; status, source and the component id show in the detail card, not
in the drawing. Data lines are deep
sky `#0369a1`, control lines indigo `#4338ca`, traced flows sky `#0ea5e9`, DDQ tags deep sky. The legend (shapes, lines,
DDQ tag) is collapsed under the blueprint. Flows are chosen from a dropdown grouped by `group` (keys of
`meta.flow_groups`) and numbered in journey order: client and staff journeys, then the ledger, then incidents and
oversight. Client segments include staff and administrators (through internal tools) and authorities (regulators, law
enforcement, courts, tax authorities), who reach the institution through a staff-run request handling process rather
than direct access.
