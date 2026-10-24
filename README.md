# Digital Asset Taxonomy

An interactive map of how digital money, tokenized real-world assets and other crypto-assets relate, with
**regulatory lenses** showing where each regime's definition reaches. Maintained by Ethereum Institutional.

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
circle, list it under `containers` and its contents under `children`.

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
- Every pull request and push to `main` also uploads the built page as a workflow artifact.
- GitHub Pages publishing (`pages.yml`) is manual-only for now, because Pages is not available for private
  repositories on the organisation's current GitHub plan.

## House views

Some placements are Ethereum Institutional positions rather than settled industry consensus, chiefly:
deposit tokens as a subset of tokenized deposits (and their "look-alike" relationship to bank-issued stablecoins),
FMI tokens as regulated non-bank money, and native cryptocurrencies as digital money. Pull requests that change
these should say so explicitly.

This map is for discussion and is not legal advice.
