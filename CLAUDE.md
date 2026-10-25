# CLAUDE.md: working notes for Claude (and humans) on this repository

This repository generates two interactive maps for Ethereum Institutional: the **Digital Asset Taxonomy** (a Venn
diagram of digital money, tokenized real-world assets and other crypto-assets, with single-select **regulatory
lenses**) and the **Digital Asset Networks** map (network types crossed by consensus admission, with named networks
and **architecture lenses**). Live pages: https://ethereum-institutional.github.io/ei-digitalassets/ and
https://ethereum-institutional.github.io/ei-digitalassets/networks/ (published from `main`).
Read `README.md` for the file layout and editing guide; this file records conventions and decisions behind it.

## Status and versioning

- The taxonomy is a **v0.x draft that has not been reviewed by legal counsel**. Keep the amber
  "Under development" banner (`notice:` in `data/site.yaml`) until counsel review is complete; 1.0.0 follows that review.
- SemVer as described in `CHANGELOG.md`. Record every change under `## [Unreleased]`.
- Releases: tag `vX.Y.Z` on `main` and push the tag. `release.yml` builds the versioned HTML, attaches it, and
  marks `v0.x` releases as pre-releases with a warning at the top of the notes.
- Licence: CC BY-NC-ND 4.0, © Ethereum Institutional (see `LICENSE`). Do not change it without explicit instruction.

## How the build works

- `data/*.yaml` (taxonomy) and `data/networks/*.yaml` (networks) are the only places content lives.
  `src/template.html` holds styling and rendering code only and renders both pages; per-page settings (`nav`,
  `lens_groups`, `badge`, `legend`, `panel_default`) live in each `site.yaml`, and drawn notes in `layout.yaml`
  `annotations:`. Never put page-specific content in the template.
- `npm run build` validates the data (unknown circle ids or badges, missing definitions, bad statuses, lens colours,
  lens-only circles, `licensed_under`, `bridges`, `networks` maps) and writes `dist/` for both pages.
  `npm run check` renders both pages in headless Chromium, applies every lens and writes `dist/preview.png` and
  `dist/networks/preview.png`. Run both before committing; CI runs them on every push and pull request.
- `dist/` and `node_modules/` are git-ignored. Never hand-edit generated HTML.
- CI runners are pinned to `ubuntu-24.04` because Playwright 1.56 cannot install Chromium on Ubuntu 26.04.
- Writing `.github/workflows/*` requires a token with the `workflow` scope; commit those from a local clone.

## Diagram conventions

- **Colour semantics (strict):** red only for negative (prohibited, banned, higher risk); amber/orange only for
  caution or hesitation; green only for positive. Otherwise use neutral hues (blues, violets, blue-teals, greys);
  avoid green-leaning teals. Use exactly red `#c81e1e`, amber `#d97706`, green `#15803d` for those meanings.
- **Lens colours:** grouped lenses use ink `#14130f` as the lens colour (it also draws "depends" dashes) and pick
  group colours from: fuchsia `#a21caf` crypto/virtual assets, sky `#0ea5e9` stablecoins/payment/fiat-referenced
  tokens, deep cyan `#155e75` securities/investment tokens, indigo `#6366f1` commercial bank money, navy `#312e81`
  central bank money. `npm run build` rejects red/amber/green-looking hues other than the three tokens and any two
  colours in one lens closer than ΔE00 20.
- "Digital" means represented on distributed ledger technology (DLT). Outer set is **Digital Assets**, not
  "crypto-assets", because regulators use "crypto-asset"/"virtual asset" as legal terms that exclude CBDCs, deposits
  and securities. **Digital Money** is any sovereign currency (tokenized) or native cryptocurrency used as money,
  represented on DLT. Assets that only meet a broad definition of money (tokenized MMFs, community coins) stay in
  Tokenized RWAs / Other Crypto-Assets: they are an investment in, or claim on, something other than money itself.
- **Other Crypto-Assets** (not "Other Digital Assets"): value comes from use, access, community or protocol rights,
  not a claim on money or an off-chain asset, whether the token is native or mirrors another record. Matches MiCA's
  "crypto-assets other than ARTs/EMTs"; "Other" = crypto-assets not counted as Digital Money. Descriptive, not legal.
- Digital Money = Native Cryptocurrencies + Tokenized Currencies. Tokenized Currencies are grouped **by issuer**:
  Central Bank (CBDC, split retail/wholesale), Commercial Bank, Regulated Non-Bank (incl. FMI Tokens), Other Issuers.
- **Stablecoins** cut across Commercial Bank, Regulated Non-Bank and Other Issuers; the word must never appear
  only inside Other Issuers. The licensed circles sit in bank ∩ non-bank; the hatched "Unlicensed / higher risk"
  zone and the Algorithmic circle sit only with Other Issuers.
- **Licensed or Recognised Stablecoins** and **Licensed or Recognised Payment Tokens** are `lens_only` circles sharing
  one position: hidden on the default map, shown only under a lens that mentions them (a lens may mention only one).
  "Payment token" is used inconsistently (CBUAE and the Swiss draft: fiat-backed tokens; FINMA 2018 and Singapore
  DPT: broad crypto incl. BTC), so use the Payment Tokens circle only where the regime's legal term is a payment token
  limited to fiat-backed tokens; otherwise the Stablecoins one.
  - **Licensed** = that regime gave the issuer a licence (never inherited from another regime). **Recognised** = its
    regulator made a token-specific decision (accepted list, verification, registration, no-objection). Tolerance
    during a transition and classification (e.g. "not a security") count as neither.
  - **Only show these circles where the regime is enacted** (even if not yet in force, e.g. UK, GENIUS); proposals
    and drafts (Switzerland, Korea, Singapore as of October 2026) go in the Stablecoins note instead.
- Token badges are pinned to their circle and never move; USDC and USDT sit side by side in Regulated Non-Bank, USDC
  nearer the licensed circle because more regimes recognise it. `licensed_under` in `tokens.yaml` makes the
  licensed circle a lens shows stretch to take the badge in; lens groups can list `tokens`; `bridges` in `layout.yaml`
  route a group's outline through empty space so it stays continuous without enclosing other circles.
  Re-check `licensed_under` whenever licences change.
- RWA: Commodities, Loans & Trade Finance, Real Estate, Collectibles & Luxury, IP & Royalties, Financial
  Instruments (Equities, Funds, Fixed Income, Derivatives, with hybrid overlaps for structured notes and
  trackers/warrants). Funds do not overlap Derivatives. Loans packaged into bonds (e.g. MBS) move to Fixed Income.
  Settlement/collateral tokens are treated as part of the asset they carry; there is no separate settlement-token circle.
- Keep the map lean: prefer explaining in definitions and lens notes over adding circles.
- **Writing style:** no em-dashes anywhere (content, notes, docs, UI text, commit messages); use commas, colons,
  semicolons, parentheses or separate sentences. En-dashes are fine in number ranges (e.g. Arts. 3–5). Quote YAML
  values that contain ": ".

## Digital Asset Networks map (`data/networks/`)

- Two classifications on one map. Network circles: **Private** (one operator), **Consortium** (several operators,
  admitted by agreement) with **Sovereign** inside it (all participants in one jurisdiction), **Public** (anyone may
  transact and run a node, whatever the consensus rule). Consensus overlay: two rounded rectangles side by side,
  **Permissioned** (over Private, Consortium and Public's left crescent) and **Permissionless** (over the rest of
  Public), the latter holding three nested bands from Lewis-Pye and Roughgarden, "Permissionless Consensus" (arXiv 2304.14701): **fully
  permissionless** (centre: the protocol knows nothing about who runs it; proof of work), **dynamically available**
  (known staked identifiers, some honest staker online; longest-chain PoS, Ethereum mainnet's fork choice),
  **quasi-permissionless** (the model assumes every honest staker online; in practice a two-thirds quorum must keep
  voting; BFT-style PoS and elected sets). Band labels on the map read "Quasi / Dynamically / Fully Permissionless". The three
  challenges (unknown players, player inactivity, sybils) are explained in the Permissionless definition, never
  drawn as circles.
- **House rule:** a network is permissioned whenever joining consensus requires review by existing participants.
  So the XRP Ledger (curated default UNL) and Stellar (quorum sets) are public but permissioned; TRON, BNB Chain,
  Hyperliquid and Avalanche are quasi-permissionless (anyone may stand or stake) with concentration caveats in their
  notes. Polygon PoS is treated as quasi-permissionless: its capped seats were designed to be won by open stake
  auction, even though entry now waits for a vacancy and a review (say so in its note).
- **Ethereum mainnet** is the chain; never write "on Ethereum" for a deployment. "Ethereum" alone is used only in
  compound terms (Ethereum ecosystem, Ethereum client, Ethereum Virtual Machine). Do not add asides such as "(press
  report)" in descriptions; the evidence level belongs in the source title. Its badge sits in dynamically available,
  with the note that Casper FFG adds quasi-permissionless finality. Slashing for double signing is accountability,
  not sybil resistance (stake is the sybil cost).
- **Canton** is drawn as a small ellipse ("Network of Networks") mostly inside Consortium, its tip in Consortium ∩
  Public, inside Permissioned: the Global Synchronizer and Canton Coin are the public part; SV-voted admission,
  sponsor plus committee approval for validators, stakeholder-only storage and no global state make the rest a
  consortium. Daml and Canton are Apache 2.0, so what is closed is its data and membership, not its code.
  Corda shares the ellipse on the consortium side (same model). Cosmos and Polkadot do not belong there: each member
  chain is a complete shared ledger. Hedera is the contrast: council-run consensus but one shared verifiable state.
- **Badges** are networks, named (not tickers, because "ETH" is overloaded). `eth: true` = ink pill (runs an
  Ethereum client, the EVM, or settles on Ethereum mainnet); otherwise grey. The set is the ten largest native
  cryptocurrencies by market cap (stablecoins and non-native tokens excluded; checked 25 October 2026) plus
  illustrative networks per region. Rollups that settle on Ethereum mainnet, and Ethereum mainnet itself, carry
  `mark: ETH` (a small disc). **Expandable circles** (`expand: collapsed | expanded` in circles.yaml, `collapsed:`
  geometry in layout.yaml) hold participants as `small` badges of `kind: participant`, each with its own source; a
  click opens the circle on top of the map, a lens closes any open one. `pill: true` network circles look like a badge
  while collapsed (ink or grey by `eth`) so the map reads the same as before: Ethereum mainnet, Base, Arbitrum One,
  OP Mainnet, Polygon PoS, Solana, Stellar, Avalanche, XRP Ledger, Hedera, BNB Chain and Canton list the regulated
  institutions with live deployments on them (G-SIBs, large asset managers, FMIs and payment firms; pilots are named
  as such). Besu private chains (Private), Swift shared ledger, Partior and Project Agorá (Consortium) list their
  participating institutions the same way. Other Private badges are Quorum (archived) and Hyperledger Fabric; name
  only Besu among Ethereum clients. Add a network or participant only with primary-source documentation (say in the
  text when a claim rests on press or an industry report), and agree additions or removals with EI first; do not
  record the reasons for leaving a network off the map here.
- **Besu house view** (in the Private definition): Apache 2.0 licence, built-in permissioned consensus and
  allowlisting, neutral foundation governance, mainnet compatibility, and Java last. Do not list other execution
  clients. Besu is now an LF Decentralized Trust project (`besu-eth/besu`); it no longer supports Clique or Ethash.
- Lenses here are architecture, not regulation: `scope: networks` lenses highlight badges via a `networks:` map
  (`in` | `part`) and leave the circles alone. Each intro defines the layer, why it exists and what it buys.
- Network facts were last checked 25 October 2026; validator counts and sequencer status drift quickly.

## EI house views (flag any change to these in the pull request)

- Deposit Token is a subset of Tokenized Deposits (strict interpretation for tokenized deposits; deposit token =
  wallet-held, omnibus-backed, may circulate on public chains, e.g. JPMD on Base and Ethereum mainnet). A dotted
  "look-alike" line links it to bank-issued stablecoins: similar behaviour, legally distinct.
- FMI Tokens (e.g. Fnality) are regulated non-bank money backed 1:1 by central bank reserves.
- Native cryptocurrencies count as digital money.

## Lenses

- One lens at a time; the taxonomy has two dropdowns (global standard setters; jurisdictions), the networks map one
  (architecture); `lens_groups` in `site.yaml` defines them. Jurisdiction `menu` labels start with the two-letter
  country code (UK, not GB) so the list sorts alphabetically.
- Each lens file has `status` per circle (`in` | `part` | `out`), optional `groups` (one dotted perimeter per group),
  `notes`, `sources` and `last_reviewed`. Add a source URL and date for every regulatory claim you change.
  Notes are keyed by circle id or by token ticker (e.g. `USDC:`), which overrides the circle's note for that badge.
- UAE: the federal securities regulator is the Capital Markets Authority (CMA), which replaced the SCA on
  1 January 2026. Dubai's VA law has no express securities carve-out; security tokens fall to the CMA.
- Lenses currently cover FATF, FSB, Basel (standard under review), BIS/CPMI, IMF (2019 classification), IOSCO, and
  AE (ADGM, CBUAE, DIFC, VARA), CH, CN, EU (MiCA), HK (SFC and HKMA separately), IN, JP, KR, SG, SV (CNAD and
  the Bitcoin Law), UK, US (GENIUS Act).
- Regulatory facts were last checked October 2026 and will drift; re-verify before changing them.

## Planned / open

- Possible "token properties" control (yield-bearing, synthetic, fungible / NFT / wrapped / soulbound).
- Market activities (DvP, repo, collateral mobility) as separate diagrams rather than on this map.
