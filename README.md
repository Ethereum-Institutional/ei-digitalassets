# Digital Asset Taxonomy and Digital Asset Networks

Two interactive maps maintained by Ethereum Institutional:

- **Digital Asset Taxonomy**: how digital money, tokenized real-world assets and other crypto-assets relate, with
  **regulatory lenses** showing where each regime's definition reaches.
- **Digital Asset Networks**: how the networks that carry those assets differ (private, consortium, public) and how
  their consensus is admitted (permissioned, or one of three degrees of permissionless), with named networks placed
  on the map and **architecture lenses** (Layer 1, side-chain, Layer 2 rollup).

**View the live pages: https://ethereum-institutional.github.io/ei-digitalassets/ (taxonomy) and
https://ethereum-institutional.github.io/ei-digitalassets/networks/ (networks)**

> **Status: draft (v0.x).** Not yet reviewed by legal counsel. Version 1.0.0 will follow that review.

Both maps are generated from plain-text data files in this repository, so every change is reviewable as a diff
and every release is a versioned, self-contained HTML file.

```
data/                      the Digital Asset Taxonomy
  circles.yaml             content: every circle's label, colour family and definition
  layout.yaml              geometry only: positions, sizes, bridges and annotations (rarely edited)
  tokens.yaml              the top-10 token badges and where they sit
  site.yaml                page title, intro, footnote, navigation and page settings
  lenses/*.yaml            one file per regulatory lens
data/networks/             the Digital Asset Networks map, same layout
  circles.yaml, layout.yaml, site.yaml
  networks.yaml            the network badges (names, not tickers) and where they sit
  lenses/*.yaml            one file per architecture lens
src/template.html          the page: styling and rendering code (no content), shared by both maps
scripts/build.mjs          validates the data and generates dist/ (both pages)
scripts/check.mjs          smoke-tests the generated pages in headless Chromium
```

## Editing the taxonomy

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the page and attach a rendered preview to the pull request.

**Change a definition or a lens note** → edit the `desc` in `data/circles.yaml`, or the `notes:` entry in the
relevant `data/lenses/<id>.yaml`.

**Change how a regime treats a circle** → edit `status:` in the lens file: `in`, `part` (depends, exempt or
restricted) or `out`. Lenses with `groups:` (Basel, IMF, BIS, China, Japan, Switzerland, ADGM, DIFC, FATF, Hong Kong)
list the circles each group covers instead.

**Add a lens** → copy an existing file in `data/lenses/`, give it a new `id`, and set `group` to
`standard-setter` or `jurisdiction`. Jurisdiction `menu` labels start with the two-letter country code so the
dropdown sorts alphabetically. The build fails if a lens references a circle id that does not exist.

**Add a circle** → add it to `data/circles.yaml` *and* give it geometry in `data/layout.yaml`. If it is a grouping
circle, list it under `containers` and its contents under `children`. Mark it `lens_only: true` to hide it on the
default map and show it only under lenses that mention it (Licensed or Recognised Stablecoins and Licensed or Recognised Payment Tokens work this way).

**Show a token as licensed under a lens** → in `data/tokens.yaml`, add the lens id to the token's `licensed_under`
list. Badges never move: under that lens the licensed-or-recognised circle it shows stretches to take the badge in. A lens group can
also take badges in with `tokens: [USDT, USDC]`, and `bridges:` in `data/layout.yaml` joins a group's separate
circles into one continuous outline (see the Switzerland lens).

Every regulatory claim should carry a source: add the URL and the date you checked it to the lens file's
`sources:` list and update `last_reviewed`.

### The networks map

**Move or describe a network** → edit its entry in `data/networks/networks.yaml`: `circle` is where it sits (`full`,
`dyn`, `quasi`, `pub`, `cons`, `sov`, `priv`, `canton`, or one of the network circles `besu`, `swift`, `partior`),
`eth: true` draws it in ink as part of the Ethereum ecosystem (runs an Ethereum client, the EVM, or settles on
Ethereum mainnet), and `sources:` lists the URL and the date checked for each claim in its `desc`. Badge names are
network names, not tickers. Participants of a network circle are `small: true` badges with `kind: participant`.

**Expandable circles** → a circle with `expand: collapsed` (or `expanded`) in `circles.yaml` and a `collapsed:`
geometry in `layout.yaml` opens on click to show the participant badges placed inside it. Network circles with
`pill: true` look like a badge while collapsed; this is how Ethereum mainnet, Base, Canton and the other public
networks list the institutions live on them, and how Besu, Swift, Partior and Project Agorá list their members.

**Change which networks a layer covers** → edit `networks:` in `data/networks/lenses/<id>.yaml` (`in` or `part`)
and the matching `notes:`. These lenses carry `scope: networks`: they highlight badges and leave the circles alone.

**Page settings** live in each `site.yaml`: `nav` (links between the pages), `lens_groups` (one dropdown per
group), `badge` (`disc` for ticker chips, `pill` for named badges), `legend` and `panel_default`. Small drawn notes
(leader-line captions, dotted connectors) are `annotations:` in `layout.yaml`.

## Building locally

```
npm ci
npm run build      # validates data and writes dist/ (both pages)
npm run check      # optional: renders both pages in Chromium and writes dist/preview.png and dist/networks/preview.png
```

`dist/digital-asset-taxonomy.html` and `dist/digital-asset-networks.html` are the complete pages for the EI
platform (`dist/index.html` and `dist/networks/index.html` are the same files laid out for GitHub Pages).
The `.fragment.html` variants are the same pages without the document skeleton, for hosts that wrap them themselves
(for example the claude.ai artifact).

## Releases

- Tagging a commit `vX.Y.Z` creates a GitHub Release with the built HTML attached and the version stamped in
  the page footer. `v0.x` tags are marked as pre-releases. Record what changed in `CHANGELOG.md`.
- Every merge to `main` publishes the latest build to GitHub Pages (the live page linked at the top).
- Every pull request also uploads the built page and a preview screenshot as a workflow artifact.
- The "Under development" banner comes from `notice:` in `data/site.yaml`; remove it once counsel has reviewed.

## House views

Some placements are Ethereum Institutional positions rather than settled industry consensus, chiefly:
deposit tokens as a subset of tokenized deposits (and their "look-alike" relationship to bank-issued stablecoins),
FMI tokens as regulated non-bank money, and native cryptocurrencies as digital money. On the networks map: a
network is permissioned whenever joining consensus needs review by existing participants (so the XRP Ledger and
Stellar are public but permissioned; Polygon PoS is treated as quasi-permissionless), Canton is mostly a consortium
network with a small public component, and the reasons institutions choose Besu. Pull requests that change these should say so explicitly.

This map is for discussion and is not legal advice.

## Licence

© 2026 Ethereum Institutional. Published under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) (see [`LICENSE`](LICENSE)): you may view and
share it unchanged, with attribution, for non-commercial purposes. Commercial use and adapted versions require
Ethereum Institutional's prior written consent. This makes the repository source-available rather than open
source in the OSI sense.

By contributing (a pull request, issue or suggested edit) you grant Ethereum Institutional a perpetual,
irrevocable, royalty-free licence to use, modify and relicense your contribution; see `LICENSE`.
