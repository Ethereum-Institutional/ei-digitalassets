# CLAUDE.md — working notes for Claude (and humans) on this repository

This repository generates Ethereum Institutional's interactive **Digital Asset Taxonomy**: a Venn diagram of
digital money, tokenized real-world assets and other crypto-assets, with single-select **regulatory lenses**.
Live page: https://ethereum-institutional.github.io/ei-digitalassets/ (published from `main`).
Read `README.md` for the file layout and editing guide; this file records conventions and decisions behind it.

## Status and versioning

- The taxonomy is a **v0.x draft that has not been reviewed by legal counsel**. Keep the amber
  "Under development" banner (`notice:` in `data/site.yaml`) until counsel review is complete; 1.0.0 follows that review.
- SemVer as described in `CHANGELOG.md`. Record every change under `## [Unreleased]`.
- Releases: tag `vX.Y.Z` on `main` and push the tag. `release.yml` builds the versioned HTML, attaches it, and
  marks `v0.x` releases as pre-releases with a warning at the top of the notes.
- Licence: CC BY-NC-ND 4.0, © Ethereum Institutional (see `LICENSE`). Do not change it without explicit instruction.

## How the build works

- `data/*.yaml` is the only place content lives. `src/template.html` holds styling and rendering code only.
- `npm run build` validates the data (unknown circle ids, missing definitions, bad statuses) and writes `dist/`.
  `npm run check` renders the page in headless Chromium, applies every lens and writes `dist/preview.png`.
  Run both before committing; CI runs them on every push and pull request.
- `dist/` and `node_modules/` are git-ignored. Never hand-edit generated HTML.
- CI runners are pinned to `ubuntu-24.04` because Playwright 1.56 cannot install Chromium on Ubuntu 26.04.
- Writing `.github/workflows/*` requires a token with the `workflow` scope; commit those from a local clone.

## Diagram conventions

- **Colour semantics (strict):** red only for negative (prohibited, banned, higher risk); amber/orange only for
  caution or hesitation; green only for positive. Otherwise use neutral hues (blues, violets, teals, greys).
- Outer set is **Digital Assets**, not "crypto-assets", because regulators use "crypto-asset"/"virtual asset" as
  legal terms that exclude CBDCs, deposits and securities.
- Digital Money = Native Cryptocurrencies + Tokenized Currencies. Tokenized Currencies are grouped **by issuer**:
  Central Bank (CBDC, split retail/wholesale), Commercial Bank, Regulated Non-Bank (incl. FMI Tokens), Other Issuers.
- **Stablecoins** cut across Commercial Bank, Regulated Non-Bank and Other Issuers; the word must never appear
  only inside Other Issuers. Licensed Stablecoins sit in bank ∩ non-bank; the hatched "Unlicensed / higher risk"
  zone and the Algorithmic circle sit only with Other Issuers.
- RWA: Commodities, Loans & Trade Finance, Real Estate, Collectibles & Luxury, IP & Royalties, Financial
  Instruments (Equities, Funds, Fixed Income, Derivatives, with hybrid overlaps for structured notes and
  trackers/warrants). Funds do not overlap Derivatives. Loans packaged into bonds (e.g. MBS) move to Fixed Income.
  Settlement/collateral tokens are treated as part of the asset they carry; there is no separate settlement-token circle.
- Keep the map lean: prefer explaining in definitions and lens notes over adding circles.

## EI house views (flag any change to these in the pull request)

- Deposit Token is a subset of Tokenized Deposits (strict interpretation for tokenized deposits; deposit token =
  wallet-held, omnibus-backed, may circulate on public chains, e.g. JPMD on Base and Ethereum mainnet). A dotted
  "look-alike" line links it to bank-issued stablecoins: similar behaviour, legally distinct.
- FMI Tokens (e.g. Fnality) are regulated non-bank money backed 1:1 by central bank reserves.
- Native cryptocurrencies count as digital money.

## Lenses

- One lens at a time; two dropdowns (global standard setters; jurisdictions). Jurisdiction `menu` labels start with
  the two-letter country code (UK, not GB) so the list sorts alphabetically.
- Each lens file has `status` per circle (`in` | `part` | `out`), optional `groups` (one dotted perimeter per group),
  `notes`, `sources` and `last_reviewed`. Add a source URL and date for every regulatory claim you change.
- Lenses currently cover FATF, FSB, Basel (standard under review), BIS/CPMI, IMF (2019 classification), IOSCO, and
  AE (ADGM, DIFC, VARA), CH, CN, EU (MiCA), HK (SFC and HKMA separately), IN, JP, KR, SG, UK, US (GENIUS Act).
- Regulatory facts were last checked October 2026 and will drift; re-verify before changing them.

## Planned / open

- Rename the "Licensed Stablecoins & Payment Tokens" circle to "Licensed Stablecoins".
- Possible "token properties" control (yield-bearing, synthetic, fungible / NFT / wrapped / soulbound).
- Market activities (DvP, repo, collateral mobility) as separate diagrams rather than on this map.
