# Digital Asset Maps

Interactive, sourced maps of digital assets and the technology around them, maintained by Ethereum Institutional
and generated from plain-text data in this repository:

- **Web3**: three generations of the web as concentric rings (Web 1.0 read; Web 2.0 read and write; Web3 read,
  write and own), cut into theme wedges (use case, implementation, technology, language, identity, content
  creation) so each theme can be followed across all three.
- **Digital Asset Taxonomy**: a Venn diagram of how digital money, tokenized real-world assets and other
  crypto-assets relate, with **regulatory lenses** showing where each regime's definition reaches.
- **Digital Asset Networks**: how the networks that carry those assets differ (private, consortium, public) and how
  their consensus is admitted (permissioned, or one of three degrees of permissionless), with named networks and
  their institutional participants placed on the map and **architecture lenses** (Layer 1, side-chain, Layer 2 rollup).
- **Decentralization, Privacy and Identity**: planned maps, stubbed as "in progress".

**View the live site: https://ethereum-institutional.github.io/ei-digitalassets/** (landing page), with the
[Web3 map](https://ethereum-institutional.github.io/ei-digitalassets/web3/), the
[taxonomy](https://ethereum-institutional.github.io/ei-digitalassets/taxonomy/) and the
[networks map](https://ethereum-institutional.github.io/ei-digitalassets/networks/).

> **Status: draft (v0.x).** Not yet reviewed by legal counsel. Version 1.0.0 will follow that review. The maps are
> for discussion and are not legal advice.

Every page is generated from YAML files, so every change is reviewable as a diff and every release is a versioned,
self-contained HTML file. Every placement and definition carries its sources, shown in the page's definition panel.

## Layout

```
data/nav.yaml              the site navigation (one entry per page; `wip: true` marks a stub)
data/home/site.yaml        the landing page (cards linking to each map)
data/web3/                 the Web3 map (kind: radial)            → data/web3/README.md
data/taxonomy/             the Digital Asset Taxonomy             → data/taxonomy/README.md
data/networks/             the Digital Asset Networks map         → data/networks/README.md
data/decentralization/, data/privacy/, data/identity/   work-in-progress stubs (site.yaml only, kind: static)
src/template.html          the Venn map page: styling and rendering code (no content)
src/radial.html            the radial page (rings and theme wedges); reuses the map page's styles
src/static.html            the landing page and stubs; reuses the map page's styles
scripts/build.mjs          validates the data and generates dist/ (every page)
scripts/check.mjs          smoke-tests the generated pages in headless Chromium
```

## Editing

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the pages and attach a rendered preview to the pull request. Each map's folder has a
`README.md` with the editing guide for that map:
[Web3](data/web3/README.md), [Digital Asset Taxonomy](data/taxonomy/README.md),
[Digital Asset Networks](data/networks/README.md).

**Page settings** live in each `site.yaml`: `lens_groups` (one dropdown per group), `badge` (`disc` for ticker
chips, `pill` for named badges), `legend`, `panel_default` and the intro's `intro_more`. Navigation between pages is
`data/nav.yaml`. **Add a page** by adding a folder with a `site.yaml` (`kind: static` for a page without a diagram,
`kind: radial` for rings and wedges, no `kind` for a Venn map), listing it in `scripts/build.mjs` `PAGES` and in
`data/nav.yaml`.

Some placements are Ethereum Institutional positions rather than settled industry consensus; `CLAUDE.md` records
them. Pull requests that change one should say so explicitly.

## Building locally

```
npm ci
npm run build      # validates data and writes dist/ (every page)
npm run check      # optional: renders each map in Chromium and writes a preview.png next to it
```

`dist/web3.html`, `dist/digital-asset-taxonomy.html` and `dist/digital-asset-networks.html` are the complete map
pages for the EI platform (`dist/web3/`, `dist/taxonomy/` and `dist/networks/index.html` are the same files laid
out for GitHub Pages; `dist/index.html` is the landing page).
The `.fragment.html` variants are the same pages without the document skeleton, for hosts that wrap them themselves
(for example the claude.ai artifact).

## Releases

- Tagging a commit `vX.Y.Z` creates a GitHub Release with the built HTML attached and the version stamped in
  the page footer. `v0.x` tags are marked as pre-releases. Record what changed in `CHANGELOG.md`.
- Every merge to `main` publishes the latest build to GitHub Pages (the live site linked at the top).
- Every pull request also uploads the built pages and preview screenshots as a workflow artifact.

## Licence

© 2026 Ethereum Institutional. Published under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) (see [`LICENSE`](LICENSE)): you may view and
share it unchanged, with attribution, for non-commercial purposes. Commercial use and adapted versions require
Ethereum Institutional's prior written consent. This makes the repository source-available rather than open
source in the OSI sense.

By contributing (a pull request, issue or suggested edit) you grant Ethereum Institutional a perpetual,
irrevocable, royalty-free licence to use, modify and relicense your contribution; see `LICENSE`.
