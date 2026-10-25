# Changelog

All notable changes to the Digital Asset Taxonomy. Versions follow [SemVer](https://semver.org): **major** for structural changes to the map
(new or removed circles, relabeled categories), **minor** for new lenses or token placements, **patch** for wording and source updates.
While the version is below 1.0.0 the taxonomy is a draft: it has not yet had legal or counsel review, and placements, labels
and lens treatments may change in any release.

## [Unreleased]

- **New page: Decentralization** (`/decentralization/`, data in `data/decentralization/`). Eleven gauges, one per
  property of a ledger (operating history, developer base, who can stop it, security you can price, who can change the
  rules, property rights at the base layer, verifiable by anyone, open entry and exit, no single point of technical
  failure, neutral issuance, neutral inclusion), each on a scale of 1 (one party) to 5 (open network) with the property named beneath and
  every level defined and sourced (US Merger Guidelines HHI lines, ethereum.org client thresholds, Budish,
  securities-law disclosure levels). Three lenses set the dials: a ledger with one operator, a consortium ledger (both
  generic) and Ethereum mainnet, the default, with readings checked on 25 October 2026. Below the dials: “What an open
  ledger attracts” (holders, tokenized assets, tokenized currency, developers) and the legitimate concerns about Ethereum
  mainnet folded into the notes of the dials they belong to, with the work addressing each.
- **Navigation.** Labels shortened to Taxonomy and Networks; Decentralization listed after Networks, before the
  work-in-progress pages, in the navigation and on the landing page.
- **Engine: gauges pages, and lenses and sections on radial pages.** `kind: gauges` renders a dial per theme from the
  radial data files (`src/gauges.html`), with `default_lens`, `scale` and `stats` in `site.yaml`; `lenses/*.yaml` on a
  radial page light one cell per theme and carry notes; `sections:` render below the panel; themes may carry a short
  `hub` name. On the Web3 map, clicking a generation's name now enlarges that ring and shrinks the others to thin
  slices with each cell's name set along the arc.
- **Tokenized money market funds, from the Taurus design paper (September 2026).** The taxonomy’s Funds definition
  now explains how a tokenized MMF delivers income (more units at par for constant-price funds, a rising struck price
  for variable-price ones) and why it stays a fund share; the Tokenized Real-World Assets definition names the three
  register models (ledger as statutory register, part of the official record, secondary record). On the networks map
  Spiko joins Ethereum mainnet, Base, Arbitrum One and Polygon PoS (its prospectus keeps the share register on those
  ledgers), Circle’s entries add USYC (Ethereum mainnet, BNB Chain), and the Layer 2 and side-chain lenses cite the
  paper’s per-network cost figures and transfer-agent burn-and-mint.
- **Scenarios page stub** (`/scenarios/`): market activities (payments, DvP, repo and reverse repo, treasury
  management, collateral) as a future map, marked in progress.
- **Repository layout.** The taxonomy's data moved from `data/` to `data/taxonomy/`, matching the other maps; each
  map folder now carries its own editing guide (`README.md`) and the root README is a short overview.
- **New page: Web3** (`/web3/`, data in `data/web3/`). A radial map: three concentric rings (Web 1.0 read, Web 2.0
  read and write, Web3 read, write and own) cut into six theme wedges (use case, implementation, technology,
  language, identity, content creation), each cell a sourced example (Webpage, Yahoo! Directory, Apache, HTML, LDAP,
  platform curated; social media, Twitter, jQuery, JavaScript, federated SSO, user curated; digital assets, Circle
  USDC, the EVM, Solidity, decentralized identity, ownership retained). Clicking a theme in the hub follows it across the
  rings, clicking a generation highlights its ring, and a “Why Web3 instead of Web 3.0?” note explains the name.
  House rule: write Web3, not Web 3.0.
- **Engine: radial pages** (`kind: radial` in `site.yaml`, rendered by `src/radial.html` from `rings.yaml`,
  `themes.yaml` and `layout.yaml`), validated and smoke-tested like the Venn maps.
- **Landing page and site structure.** The site root is now a landing page with a card per map; the taxonomy moved
  from `/` to `/taxonomy/` (the `digital-asset-taxonomy.html` download is unchanged). Decentralization, Privacy and
  Identity pages are stubbed as work in progress, with their planned framing and an “in progress” tag in the shared
  navigation (`data/nav.yaml`).
- **New page: Digital Asset Networks** (`/networks/`, data in `data/networks/`). A Venn diagram of network types
  (Private, Consortium with Sovereign inside, Public) crossed by a consensus overlay: Permissioned, and Permissionless
  with the three nested degrees of Lewis-Pye and Roughgarden (“Permissionless Consensus”, arXiv 2304.14701): fully
  permissionless, dynamically available, quasi-permissionless. Named network badges (names, not tickers) for the ten
  largest native cryptocurrencies on 25 October 2026 plus illustrative networks in every region; ink badges mark
  the Ethereum ecosystem. Besu private chains, Swift’s shared ledger, Partior and Project Agorá are circles that
  expand on click to show their participating institutions; the public networks (Ethereum mainnet, Base, Arbitrum
  One, OP Mainnet, Polygon PoS, Solana, Stellar, Avalanche, XRP Ledger, Hedera, BNB Chain, Canton) expand to show
  the regulated institutions with live deployments on them. Every participant carries its own source and lists are
  alphabetical. The consensus and network regions can be hidden with a − control; the rest stretches across the width at the
  same text size, and a collapsed consensus square becomes a slim band above the map. Three architecture lenses (Layer 1, Side-chain, Layer 2 rollup) highlight badges. House
  views stated on the page: the permissionless rule (no review by existing participants), Canton as mostly a
  consortium network with a small public component and no shared ledger, and why institutions pick Besu. Rollups
  that settle on Ethereum mainnet carry an ETH mark.
- Engine: one template now renders any number of pages. `site.yaml` gains `slug`, `nav`, `lens_groups`,
  `lens_title`, `badge` (disc or pill), `legend`, `panel_default` and `svg_label`; lenses may carry `scope: networks`
  with a `networks:` map; badges may carry `eth`, `mark`, `small`, `kind` and `sources`; circles may carry `sources`,
  `expand` (with `collapsed:` geometry) and `pill`. The taxonomy’s drawn captions and the “look-alike”
  connector moved from the template into `layout.yaml` `annotations:`. `npm run check` tests both pages.

- **Structural:** the “Licensed Stablecoins & Payment Tokens” circle is split into two lens-only circles,
  **Licensed or Recognized Stablecoins** and **Licensed or Recognized Payment Tokens**, which are hidden on the default map and appear only under
  lenses whose regime defines them. A license is jurisdictional, and “payment token” means a licensed fiat-backed
  token in some regimes (UAE CBUAE, the Swiss draft) but a broad crypto class in others (FINMA 2018, Singapore DPT).
- “Licensed or Recognized”: licensed means the regime gave the issuer a license (not inherited from another regime);
  recognized means its regulator made a token-specific decision (accepted, verified, registered, no-objection).
  Tolerance during a transition or a classification does not count.
- These circles appear only where the regime is enacted. Licensed or Recognized Stablecoins no longer appears under
  lenses with no licensing regime (FATF, FSB, IOSCO, India, China) or only a proposed one (Korea, Singapore); the
  proposals are described in the Stablecoins note. The Singapore intro no longer implies the “MAS-regulated stablecoin”
  label is in use.
- Switzerland lens: “Payment tokens” is one continuous outline around Bitcoin, Ether, other Layer-1s, community coins,
  USDT and USDC, with notes that stablecoins are classified case by case and hold no Swiss license. The draft
  stable-value payment token regime is described in the Stablecoins note (not yet law, so no licensed circle).
  Unlicensed and algorithmic stablecoins and staking/wrapped tokens are now “depends” (case by case), not payment tokens.
- Lens notes can be keyed by token ticker as well as circle id.
- Stablecoin area review:
  - IMF lens: Unlicensed / higher risk is no longer e-money; it is “depends” (fiat-reserve designs are e-money in
    form, crypto-collateralized and synthetic ones are not addressed by the 2019 paper). USDC and USDT join the e-money
    group as “fiat tokens”, which the paper names as e-money. Algorithmic stays under Cryptocurrency (“managed coins”).
  - GENIUS lens: the ban on offering non-permitted stablecoins to US persons applies from July 2028, not on enactment.
  - DIFC lens: reflects the 12 January 2026 rules (fiat tokens still verified by the DFSA; other tokens self-assessed).
  - Japan, ADGM, DIFC: token notes clarify that USDC and USDT are accepted or recognized for use, not licensed issuers.
  - Sources added to the IMF, GENIUS, DIFC and Hong Kong SFC lenses.
- VARA lens: the intro no longer claims Dubai’s law excludes securities and fiat (it has no such carve-out); the line is
  drawn by the asset in the token, with security tokens under the federal CMA. The derivatives note cites VARA’s
  Exchange Services Rulebook v2.1 (virtual-asset derivatives, from 31 March 2026); CBDC and deposit notes now say they
  fall to the CBUAE. VARA and CBUAE notes use the CMA, which replaced the SCA on 1 January 2026.
- China lens: native cryptocurrencies, stablecoins, tokenized RWAs and all other crypto-assets are shown as banned
  (red). The approval route for RWA tokenization and tolerated non-tradeable digital collectibles are in the notes;
  the amber “banned unless approved” group is removed.
- Lens groups can include token badges and `bridges` corridors so a group’s outline stays continuous.
- New lens: **SV · El Salvador (CNAD)**: LEAD “digital asset”, the Bitcoin Law after the 2025 amendment, and CNAD’s
  eligible stablecoin list (USDT, USDC and others).
- New lens: **AE · UAE (CBUAE)**: the Payment Token Services Regulation, separate from the Dubai VARA lens.
- USDC and USDT sit side by side at the center of Regulated Non-Bank and never move. Under lenses that license them,
  Licensed or Recognized Stablecoins stretches to take the badge in (USDC: MiCA, Japan, ADGM, DIFC, El Salvador; USDT:
  ADGM, El Salvador). Under GENIUS both stay outside: USDC’s issuer holds state licenses but is not yet permitted under
  the Act, and USDT is tolerated during the transition, not recognized.
- Definitions: “digital” means represented on distributed ledger technology (DLT); Digital Money is any sovereign
  currency in tokenized form or native cryptocurrency used as money, represented on DLT. Assets that can meet a broad
  definition of money, such as tokenized money market funds or community coins, are categorized separately because
  they are an investment in, or a claim on, something other than money itself.
- Other Crypto-Assets: the definition explains the name (value from use, access, community or protocol rights rather
  than a claim on money or an off-chain asset; aligned with MiCA’s “other crypto-assets”) and that it is descriptive,
  not a legal classification.
- GENIUS Act lens notes that the Act takes effect on 18 January 2027; VARA lens points AED tokens to the CBUAE lens.
- Sources added to the El Salvador, CBUAE, Switzerland, VARA and GENIUS lenses.
- The page links to the GitHub repository and invites issues (to request changes) and pull requests.
- README: the link to the live page is now at the top.
- Fixed: “Clear lens” was shown even when no lens was selected.
- Style: removed em-dashes from all definitions, lens notes, menu labels and page text.
- Financial Instruments definition: the UAE securities regulator is now named as the CMA (formerly the SCA).
- Fixed: lens colors that were hard to tell apart (e.g. HKMA tokenized deposits vs licensed stablecoins; IMF b-money,
  e-money and cryptocurrency). Grouped lenses now use one neutral palette with consistent meanings and an ink lens
  color; the build rejects colors closer than ΔE00 20 within a lens and red/amber/green hues outside their meaning.
  The pinned-token outline is no longer amber.

## [0.1.0] - 2026-10-24

First versioned draft, migrated from the hand-maintained page. Pending legal and counsel review.

- The page carries an “Under development” notice: not yet reviewed by legal counsel, subject to change, not legal advice.
- Published to GitHub Pages on every merge to `main`.
- 46 circles across Digital Money, Tokenized Real-World Assets and Other Crypto-Assets, with EI house views on deposit tokens vs stablecoins and FMI tokens.
- 20 regulatory lenses: 6 global standard setters (FATF, FSB, Basel, BIS/CPMI, IMF, IOSCO) and 14 jurisdictions (AE ×3, CH, CN, EU, HK ×2, IN, JP, KR, SG, UK, US).
- Top-10 token badges as of mid-October 2026.
- Click-to-pin definitions; single-select lens dropdowns sorted alphabetically.
- Licensed under CC BY-NC-ND 4.0, © Ethereum Institutional; contributions licensed to Ethereum Institutional.
