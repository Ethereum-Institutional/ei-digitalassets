# Digital Asset Taxonomy

An interactive map of how digital money, tokenized real-world assets and other crypto-assets relate, with
**regulatory lenses** showing where each regime's definition reaches. Maintained by Ethereum Institutional.

**View the live page: https://ethereum-institutional.github.io/ei-digitalassets/**

> **Status: draft (v0.x).** Not yet reviewed by legal counsel. Version 1.0.0 will follow that review.

The map is generated from plain-text data files in this repository, so every change is reviewable as a diff
and every release is a versioned, self-contained HTML file.

```
data/
  circles.yaml      content: every circle's label, colour family and definition
  layout.yaml       geometry only: positions and sizes (rarely edited)
  tokens.yaml       the top-10 token badges and where they sit
  site.yaml         page title, intro and footnote
  lenses/*.yaml     one file per regulatory lens
src/template.html   the page: styling and rendering code (no content)
scripts/build.mjs   validates the data and generates dist/
scripts/check.mjs   smoke-tests the generated page in headless Chromium
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

## Building locally

```
npm ci
npm run build      # validates data and writes dist/digital-asset-taxonomy.html
npm run check      # optional: renders the page in Chromium and writes dist/preview.png
```

`dist/digital-asset-taxonomy.html` is the complete page for the EI platform.
`dist/digital-asset-taxonomy.fragment.html` is the same page without the document skeleton, for hosts that
wrap it themselves (for example the claude.ai artifact).

## Releases

- Tagging a commit `vX.Y.Z` creates a GitHub Release with the built HTML attached and the version stamped in
  the page footer. `v0.x` tags are marked as pre-releases. Record what changed in `CHANGELOG.md`.
- Every merge to `main` publishes the latest build to GitHub Pages (the live page linked at the top).
- Every pull request also uploads the built page and a preview screenshot as a workflow artifact.
- The "Under development" banner comes from `notice:` in `data/site.yaml`; remove it once counsel has reviewed.

## House views

Some placements are Ethereum Institutional positions rather than settled industry consensus, chiefly:
deposit tokens as a subset of tokenized deposits (and their "look-alike" relationship to bank-issued stablecoins),
FMI tokens as regulated non-bank money, and native cryptocurrencies as digital money. Pull requests that change
these should say so explicitly.

This map is for discussion and is not legal advice.

## Licence

© 2026 Ethereum Institutional. Published under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) (see [`LICENSE`](LICENSE)): you may view and
share it unchanged, with attribution, for non-commercial purposes. Commercial use and adapted versions require
Ethereum Institutional's prior written consent. This makes the repository source-available rather than open
source in the OSI sense.

By contributing (a pull request, issue or suggested edit) you grant Ethereum Institutional a perpetual,
irrevocable, royalty-free licence to use, modify and relicense your contribution; see `LICENSE`.
