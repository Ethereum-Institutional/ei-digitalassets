# CLAUDE.md: working notes for Claude (and humans) on this repository

This repository generates Ethereum Institutional's interactive, sourced maps behind a landing page: the **Web3**
map (a radial map: three generations of the web as rings, cut into theme wedges), the **Digital Asset Taxonomy** (a
Venn diagram of digital money, tokenized real-world assets and other crypto-assets, with single-select **regulatory
lenses**) and the **Digital Asset Networks** map (network types crossed by consensus admission, with named networks,
their institutional participants and **architecture lenses**), plus a **Decentralization** page (eleven gauges, levels 1 to 5, with lenses), with Privacy, Identity and **Quantum**
pages stubbed as work in progress (Quantum carries drafted sections: Shor and Grover, where they bite a ledger, the
Ethereum roadmap now and next), with a **Scenarios** index (one written scenario, the rest planned). Live site: https://ethereum-institutional.github.io/ei-digitalassets/ (landing),
`/web3/`, `/taxonomy/`, `/networks/` (published from `main`).
Read `README.md` for the layout and each map folder's `README.md` for its editing guide; this file records conventions
and decisions behind them.

## Status and versioning

- The taxonomy is a **v0.x draft that has not been reviewed by legal counsel**. Keep the amber
  "Under development" banner (`notice:` in `data/taxonomy/site.yaml`) until counsel review is complete; 1.0.0 follows that review.
- SemVer as described in `CHANGELOG.md`. Record every change under `## [Unreleased]`.
- Releases: tag `vX.Y.Z` on `main` and push the tag. `release.yml` builds the versioned HTML, attaches it, and
  marks `v0.x` releases as pre-releases with a warning at the top of the notes.
- License: CC BY-NC-ND 4.0, © Ethereum Institutional (see `LICENSE`). Do not change it without explicit instruction.

## How the build works

- `data/taxonomy/*.yaml` (taxonomy), `data/networks/*.yaml` (networks), `data/home/site.yaml` (landing page) and the stub
  folders (`data/decentralization`, `data/privacy`, `data/identity`, `kind: static`) and `data/web3/*.yaml` and `data/decentralization/*.yaml` (radial
  maps, `kind: radial`: `rings.yaml`, `themes.yaml`, `layout.yaml`, optional `lenses/`) are the only places content lives;
  `data/nav.yaml` is the shared navigation (`wip: true` adds the "in progress" tag). `src/template.html` holds the
  Venn map page's styling and rendering code only; `src/radial.html` renders radial pages and `src/static.html` the
  landing page and stubs, both with the same styles. Per-page settings (`lens_groups`, `badge`, `legend`, `panel_default`, `intro_more`) live in each
  `site.yaml`, and drawn notes in `layout.yaml` `annotations:`. Never put page-specific content in a template. A new
  page is a folder with a `site.yaml`, an entry in `PAGES` in `scripts/build.mjs` and an entry in `data/nav.yaml`.
- `npm run build` validates the data (unknown circle ids or badges, missing definitions, bad statuses, lens colors,
  lens-only circles, `licensed_under`, `bridges`, `networks` maps; rings, themes and cells on radial pages) and
  writes `dist/` for every page. `npm run check` renders each map in headless Chromium, applies every lens and
  writes `dist/preview.png`, `dist/networks/preview.png` and `dist/web3/preview.png`. Run both before committing; CI runs them on every push and pull request.
- `dist/` and `node_modules/` are git-ignored. Never hand-edit generated HTML.
- CI runners are pinned to `ubuntu-24.04` because Playwright 1.56 cannot install Chromium on Ubuntu 26.04.
- Writing `.github/workflows/*` requires a token with the `workflow` scope; commit those from a local clone.

## Diagram conventions

- **Color semantics (strict):** red only for negative (prohibited, banned, higher risk); amber/orange only for
  caution or hesitation; green only for positive. Otherwise use neutral hues (blues, violets, blue-teals, grays);
  avoid green-leaning teals. Use exactly red `#c81e1e`, amber `#d97706`, green `#15803d` for those meanings.
- **Lens colors:** grouped lenses use ink `#14130f` as the lens color (it also draws "depends" dashes) and pick
  group colors from: fuchsia `#a21caf` crypto/virtual assets, sky `#0ea5e9` stablecoins/payment/fiat-referenced
  tokens, deep cyan `#155e75` securities/investment tokens, indigo `#6366f1` commercial bank money, navy `#312e81`
  central bank money. `npm run build` rejects red/amber/green-looking hues other than the three tokens and any two
  colors in one lens closer than ΔE00 20.
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
- **Licensed or Recognized Stablecoins** and **Licensed or Recognized Payment Tokens** are `lens_only` circles sharing
  one position: hidden on the default map, shown only under a lens that mentions them (a lens may mention only one).
  "Payment token" is used inconsistently (CBUAE and the Swiss draft: fiat-backed tokens; FINMA 2018 and Singapore
  DPT: broad crypto incl. BTC), so use the Payment Tokens circle only where the regime's legal term is a payment token
  limited to fiat-backed tokens; otherwise the Stablecoins one.
  - **Licensed** = that regime gave the issuer a license (never inherited from another regime). **Recognized** = its
    regulator made a token-specific decision (accepted list, verification, registration, no-objection). Tolerance
    during a transition and classification (e.g. "not a security") count as neither.
  - **Only show these circles where the regime is enacted** (even if not yet in force, e.g. UK, GENIUS); proposals
    and drafts (Switzerland, Korea, Singapore as of October 2026) go in the Stablecoins note instead.
- Token badges are pinned to their circle and never move; USDC and USDT sit side by side in Regulated Non-Bank, USDC
  nearer the licensed circle because more regimes recognize it. `licensed_under` in `tokens.yaml` makes the
  licensed circle a lens shows stretch to take the badge in; lens groups can list `tokens`; `bridges` in `layout.yaml`
  route a group's outline through empty space so it stays continuous without enclosing other circles.
  Re-check `licensed_under` whenever licenses change.
- RWA: Commodities, Loans & Trade Finance, Real Estate, Collectibles & Luxury, IP & Royalties, Financial
  Instruments (Equities, Funds, Fixed Income, Derivatives, with hybrid overlaps for structured notes and
  trackers/warrants). Funds do not overlap Derivatives. Loans packaged into bonds (e.g. MBS) move to Fixed Income.
  Settlement/collateral tokens are treated as part of the asset they carry; there is no separate settlement-token circle.
- **Tokenized money market funds** stay in Funds (sourced to the Taurus design paper, September 2026, and the ECB
  Macroprudential Bulletin, April 2026): even a constant-price fund is a share with a dealing cut-off; income arrives
  as more units (BUIDL, BENJI) or a rising price (Spiko, uMINT, USYC). Ondo USDY is a note from a bankruptcy-remote
  vehicle, not a fund: if ever named it goes in Fixed Income. The RWA definition states the three **register models**
  (ledger as statutory register: Spiko; part of the official record: BENJI; secondary record with clawback:
  WisdomTree) because "represented on DLT" spans all three.
- Keep the map lean: prefer explaining in definitions and lens notes over adding circles.
- **Writing style:** American (US) spelling everywhere (tokenized, recognized, decentralized, color, license, center);
  quoted source titles keep the spelling of the document they name. No em-dashes anywhere (content, notes, docs, UI text, commit messages); use commas, colons,
  semicolons, parentheses or separate sentences. En-dashes are fine in number ranges (e.g. Arts. 3–5). Quote YAML
  values that contain ": ".

## Digital Asset Networks map (`data/networks/`)

- Two classifications on one map. Network circles: **Private** (one operator), **Consortium** (several operators,
  admitted by agreement) with **Sovereign** inside it (all participants in one jurisdiction), **Public** (anyone may
  transact and run a node, whatever the consensus rule). Consensus overlay: two rounded rectangles side by side,
  **Permissioned** (over Private, Consortium and Public's left crescent) and **Permissionless** (over the rest of
  Public), the latter holding three nested bands from Lewis-Pye and Roughgarden, "Permissionless Consensus" (arXiv 2304.14701): **fully
  permissionless** (center: the protocol knows nothing about who runs it; proof of work), **dynamically available**
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
  Ethereum client, the EVM, or settles on Ethereum mainnet); otherwise gray. The set is the ten largest native
  cryptocurrencies by market cap (stablecoins and non-native tokens excluded; checked 25 October 2026) plus
  illustrative networks per region. Rollups that settle on Ethereum mainnet, and Ethereum mainnet itself, carry
  `mark: ETH` (a small disc). **Expandable circles** (`expand: collapsed | expanded` in circles.yaml, `collapsed:`
  geometry in layout.yaml) hold participants as `small` badges of `kind: participant`, each with its own source; a
  click opens the circle on top of the map, a lens closes any open one. `pill: true` network circles look like a badge
  while collapsed (ink or gray by `eth`) so the map reads the same as before: Ethereum mainnet, Base, Arbitrum One,
  OP Mainnet, Polygon PoS, Solana, Stellar, Avalanche, XRP Ledger, Hedera, BNB Chain and Canton list the regulated
  institutions with live deployments on them (G-SIBs, large asset managers, FMIs and payment firms; pilots are named
  as such). Besu private chains (Private), Swift shared ledger, Partior and Project Agorá (Consortium) list their
  participating institutions the same way. Other Private badges are Quorum (archived) and Hyperledger Fabric; name
  only Besu among Ethereum clients. Add a network or participant only with primary-source documentation (say in the
  text when a claim rests on press or an industry report), and agree additions or removals with EI first; do not
  record the reasons for leaving a network off the map here.
- **Besu house view** (in the Private definition): Apache 2.0 license, built-in permissioned consensus and
  allowlisting, neutral foundation governance, mainnet compatibility, and Java last. Do not list other execution
  clients. Besu is now an LF Decentralized Trust project (`besu-eth/besu`); it no longer supports Clique or Ethash.
- Lenses here are architecture, not regulation: `scope: networks` lenses highlight badges via a `networks:` map
  (`in` | `part`) and leave the circles alone. Each intro defines the layer, why it exists and what it buys.
- Network facts were last checked 25 October 2026; validator counts and sequencer status drift quickly.

## Web3 page (`data/web3/`)

- A radial map (`kind: radial`): an ink hub, then one ring per generation from the center outwards (Web 1.0 read;
  Web 2.0 read / write; Web3 read / write / own), each keeping the previous capability and adding one. The rings
  are cut into wedges: a label wedge at the top holds the ring names, and each other wedge is one **theme** from
  `themes.yaml`, clockwise: Use case (Webpage; Social media; Digital assets), Implementation (Yahoo! Directory;
  Twitter; Circle USDC), Technology (Apache, LAMP; jQuery; Ethereum VM), Language (HTML; JavaScript;
  Solidity), Identity (a bold name with smaller examples: Local, LDAP; Federated, SSO and SAML; Decentralized, Verifiable
  Credentials and Allowlist) and
  Content creation (Platform curated; User curated; Ownership retained). Every cell is one illustrative, sourced
  example, not a list. No ETH disc or ink badge on this page: that marking belongs to the networks map. The hub names
  the themes: clicking one highlights its wedge across the rings; clicking a ring's name enlarges that ring and the
  hub (the other rings shrink to thin slices showing each cell's name along the arc); Esc or a click outside
  restores it. There is no lens dropdown on this page. Yahoo! Directory, not Wikipedia, is the Web 1.0 implementation: Wikipedia is
  written by its users and is O'Reilly's own example of the Web 1.0 to Web 2.0 shift (Britannica Online to Wikipedia).
  The Implementation row names products, not networks (Yahoo!, Twitter, USDC), so Ethereum mainnet is not a cell:
  USDC was chosen over the larger USDT because it is mostly on Ethereum mainnet and recognized by more regimes.
- **Naming (house rule):** write "Web3", never "Web 3.0", except when explaining the naming. "Web 3.0" has meant two
  things (Berners-Lee's Semantic Web, and Gavin Wood's April 2014 "ĐApps: What Web 3.0 Looks Like"); most explainers
  distinguish them, and "Web3" now means only the decentralized web, which is what ethereum.org, Wikipedia's article
  title and Chris Dixon's Read Write Own use. Do not claim the two terms are identical; say the short form reflects a
  community-formed definition.
- The house narrative: in every generation open-source technology plus a common standard built the new paradigm
  (Apache and HTML over TCP/IP; Ajax and jQuery with SAML 2.0 and OAuth; the EVM and Solidity with ERC-20 and
  ERC-721), and identity moved from one provider's directory (LDAP) to federated providers to self-custodied keys.

## Decentralization page (`data/decentralization/`)

- A gauges page (`kind: gauges`, rendered by `src/gauges.html` from the same files as a radial page: `rings.yaml` =
  the five levels, `themes.yaml` = the ten properties with a cell per level, `lenses/`): eleven dials, one per property
  (operating history, developer base, who can stop it, security you can price, who can change the rules, property
  rights at the base layer, verifiable by anyone, open entry and exit, no single point of technical failure, neutral
  issuance, neutral inclusion), each on a scale of 1 (one party holds the property) to 5 (an open network holds it), the property named
  beneath. Each cell says what that level means; thresholds cite their standard (the 2023 US Merger Guidelines' HHI
  lines for share-based properties, ethereum.org's one-third and two-thirds client lines, Budish for cost of attack,
  securities-law disclosure thresholds for the founding share). The purpose is to show what a global shared ledger
  gives an institution that no single-party ledger can, and where Ethereum mainnet lands; it never names a competitor.
- **Gauge colours** are the one semantic scale on the site: 1 red `#991b1b`, 2 orange `#ea580c`, 3 yellow `#d9a406`,
  4 yellow-green `#65a30d`, 5 green `#166534` (`scale:` in `site.yaml` may override). The numeral on every segment and
  in the dial's centre carries the value, because the yellow and yellow-green steps are close for red-green
  colour-blind readers; never use these hues elsewhere.
- **Lenses** (`lenses/*.yaml`, `cells` maps each property to a level, `notes` carries the reading, date and source):
  *Ethereum mainnet* first and default (`default_lens`), with measured readings and a short hard-number `readings`
  line under each dial, then two generic architectures, *A typical consortium ledger* (levels 2 and 3) and *A
  private chain, one operator* (level 1 everywhere). A lens sets every needle; the panel shows the property, its
  five levels and the lens note for the current level. Keep the architectures generic;
  product names belong on the networks map.
- **Measurement choices (house):** share-based properties are scored on the HHI (counts the whole distribution; a
  long tail of small operators counts) with the Nakamoto coefficient shown beside it, not scored, because it is
  tail-insensitive (Ovezik et al. 2025); the cost-of-control reading is the value of stake to the safety threshold
  and whether it is slashable; client share is read from the community's own series (clientdiversity.org, the
  ethereum.org snapshot) with the basis stated; years of operation count from genesis (30 July 2015) and the 2016
  DAO fork is always disclosed. These readings are a public, simplified cousin of the registered scorecard in the
  eiplatform repository; keep the two consistent and do not publish the registered method's text here.
- **"What an open ledger attracts"** (`stats:` in `site.yaml`): four figures for Ethereum mainnet (holders of
  tokenized dollars, tokenized real-world asset value, tokenized currency in circulation, active developers), each
  dated and sourced; say when a figure includes Layer 2s. **Weighted score** (`score:` in `site.yaml`, `weight` per
  theme, default weights summing to 100): one number from the ten dials, with sliders so a reader can set their own
  weights (kept in their browser only). The legitimate concerns about Ethereum mainnet (builder concentration and FOCIL / ePBS; clients above a
  third; node concentration by provider and jurisdiction; unattributed stake and the undisclosed 2014 pool) live
  inside the notes of the dials they belong to (inclusion, resilience, stop, issuance), each with the work addressing
  it; there is no separate concerns section. Keep them current, and write the page in direct address ("you",
  "your risk committee"), not about "an institution".

## Quantum page (`data/quantum/`, stub with drafted sections)

- A static stub whose `sections:` hold first drafts: the two algorithms (Shor breaks elliptic-curve signatures and
  pairings; Grover only halves hash security, so hashes are weakened, not broken), where it bites a ledger (exposed
  account keys after a first spend; validator BLS keys; KZG commitments and pairing-based SNARKs; what is not at risk
  on a public ledger), and the Ethereum roadmap (now: hashes, STARK rollups, account abstraction via ERC-4337 and
  EIP-7702 lets an account run a post-quantum scheme today; next: EIP-8141 signature agility, EIP-7932, EIP-7864
  binary tree, Lean Ethereum with leanXMSS and leanVM aggregation, core infrastructure targeted for about 2029).
  Source of record is ethereum.org's quantum-resistance page (dated on the page); say dates are community targets.
  Landing-page tiles carry an `icon` from the pictogram library and a one-line tagline; the link text is "Open".

## EI house views (flag any change to these in the pull request)

- Deposit Token is a subset of Tokenized Deposits (strict interpretation for tokenized deposits; deposit token =
  wallet-held, omnibus-backed, may circulate on public chains, e.g. JPMD on Base and Ethereum mainnet). A dotted
  "look-alike" line links it to bank-issued stablecoins: similar behavior, legally distinct.
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
- **Scenarios** (`data/scenarios/`): the index is `kind: index`. `site.yaml` lists every scenario with `moves`,
  `roles`, an `icon` (one of the pictogram family in `scripts/build.mjs`: a disc is a token, a rising line a
  yielding asset, a loop with a padlock one atomic transaction) and a `map` position on a small Venn (Cash moves,
  Asset moves, Credit is extended), because position carries meaning and scenarios are never ranked or
  alphabetized. Tiles below the map are grouped into `bands` by what moves and filtered by the reader's role.
  Written scenarios are ink pills and link out; planned ones are grey with the in-progress tag.
  Each written scenario is a folder with `site.yaml` (`kind: scenario`) and `scenario.yaml`: `actors` (columns of the
  swimlane diagram; `kind: ledger | contract | observer` for non-institutions), `steps` (rows; `kind: offchain |
  onchain | atomic`, an atomic step names `lanes`), `tokens` (linked to taxonomy circle ids), `standards` (EIP id,
  status, role, URL), `sections` (why a shared ledger, variants, open questions) and `sources`. Written so far: DvP,
  deposit token against a tokenized money market fund (with a permissioned-pool variant on Uniswap v4 hooks; the
  EI reference build is mentioned, never a URL for it: readers are told to contact Ethereum Institutional for the
  quickstart). Planned: payments, treasury management, FX PvP, repo,
  collateral and margin, securities lending, fund dealing, corporate actions, AI agent payments (x402, ERC-8004,
  EIP-3009). The Taurus TMMF paper's Section 7.4 is source material for the collateral scenarios.
