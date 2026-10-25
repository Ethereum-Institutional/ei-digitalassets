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
- **Decentralization**: eleven gauges, one per property of a ledger, on a scale of 1 (one party) to 5 (open network), with
  lenses that set them to a single-operator ledger, a consortium ledger or Ethereum mainnet, each reading dated and sourced.
- **Scenarios**: what institutions do with digital assets, one page per market activity with the actors, a step-by-step
  diagram, the taxonomy tokens and the EVM standards involved; filter by your role or by what moves. One written
  (delivery versus payment), the rest planned.
- **Quantum**: an overview and four short sub-pages (the two algorithms, where it bites a ledger, the Ethereum roadmap,
  where your digital asset team fits), in progress.
- **Privacy and Identity**: planned pages, stubbed as "in progress".

**View the live site: https://ethereum-institutional.github.io/ei-digitalassets/** 
- [Web3](https://ethereum-institutional.github.io/ei-digitalassets/web3/)
- [Digital Assets Taxonomy](https://ethereum-institutional.github.io/ei-digitalassets/taxonomy/)
- [Digital Assets Networks](https://ethereum-institutional.github.io/ei-digitalassets/networks/).

> **Status: draft (v0.x).** Not yet reviewed by legal counsel. Version 1.0.0 will follow that review. The maps are
> for discussion and are not legal advice.

Every page is generated from YAML files, so every change is reviewable as a diff and every release is a versioned,
self-contained HTML file. Every placement and definition carries its sources, shown in the page's definition panel.

## Editing

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the pages and attach a rendered preview to the pull request. Each map's folder has a
`README.md` with the editing guide for that map:
[Web3](data/web3/README.md), [Digital Asset Taxonomy](data/taxonomy/README.md),
[Digital Asset Networks](data/networks/README.md), [Decentralization](data/decentralization/README.md),
[Scenarios](data/scenarios/README.md).

**Page settings** live in each `site.yaml`: `lens_groups` (one dropdown per group), `badge` (`disc` for ticker
chips, `pill` for named badges), `legend`, `panel_default` and the intro's `intro_more`. Navigation between pages is
`data/nav.yaml`. **Add a page** by adding a folder with a `site.yaml` (`kind: static` for a page without a diagram,
`kind: radial` for rings and wedges, `kind: gauges` for dials, no `kind` for a Venn map), listing it in `scripts/build.mjs` `PAGES` and in
`data/nav.yaml`.

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

## License

© 2026 Ethereum Institutional. Published under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) (see [`LICENSE`](LICENSE)): you may view and
share it unchanged, with attribution, for non-commercial purposes. Commercial use and adapted versions require
Ethereum Institutional's prior written consent. This makes the repository source-available rather than open
source in the OSI sense.

By contributing (a pull request, issue or suggested edit) you grant Ethereum Institutional a perpetual,
irrevocable, royalty-free license to use, modify and relicense your contribution; see `LICENSE`.
