# CLAUDE.md: working notes for Claude (and humans) on this repository

This repository generates Ethereum Institutional's interactive, sourced maps behind a landing page: the **Web3**
map (a radial map: three generations of the web as rings, cut into theme wedges), the **Digital Asset Taxonomy** (a
Venn diagram of digital money, tokenized real-world assets and other crypto-assets, with single-select **regulatory
lenses**) and the **Digital Asset Networks** map (network types crossed by consensus admission, with named networks,
their institutional participants and **architecture lenses**), plus a **Decentralization** page (eleven gauges, levels 1 to 5, with lenses), a **Privacy** map (in progress), with Identity and **Quantum**
pages stubbed as work in progress (Quantum carries drafted sections: Shor and Grover, where they bite a ledger, the
Ethereum roadmap now and next), with a **Scenarios** index (one written scenario, the rest planned). Live site: https://ethereum-institutional.github.io/ei-digitalassets/ (landing),
`/web3/`, `/taxonomy/`, `/networks/` and the other pages.
Read `README.md` for the layout and each map folder's `README.md` for its editing guide; this file records conventions
and decisions behind them.

## Where the source lives and how it ships

- The source of truth is the `maps/` folder of the private repository ei-platform. The public repository
  `ei-digitalassets` is a mirror written only by ei-platform's `maps-mirror.yml`; never edit it directly (a change made
  there is overwritten by the next mirror run). The ei-platform root `CLAUDE.md` says how a session works with the owner.
- Flow: a branch (in ei-platform, a worktree under `.worktrees/<topic>`), a pull request, CI (`maps.yml`), a merge to
  ei-platform `main`, then, when the owner asks to publish, `gh workflow run maps-mirror.yml --ref main`. The mirror's
  own `build.yml` and `pages.yml` then build and publish the live site from the mirror's `main`.
- Commands run from `maps/`: `cd maps && npm run build`, then `npm run check`.

## Status and versioning

- The taxonomy is a **v0.x draft that has not been reviewed by legal counsel**. Keep the amber
  "Under development" banner (`notice:` in `data/taxonomy/site.yaml`) until counsel review is complete; 1.0.0 follows that review.
- SemVer as described in `CHANGELOG.md`. Record every change under `## [Unreleased]`, and add a dated entry to the
  ei-platform root `CHANGELOG.md`.
- No release is published for now (v0.1.0 and its tag were deleted and the mirror's history squashed, 27 October
  2026). A release is a tag `vX.Y.Z` pushed to the mirror after a mirror run; the mirror's `release.yml` builds the
  versioned HTML, attaches it, and marks `v0.x` releases as pre-releases with a warning at the top of the notes.
- License: CC BY-NC-ND 4.0, © Ethereum Institutional (see `LICENSE`). Do not change it without explicit instruction.

## How the build works

- `data/taxonomy/*.yaml` (taxonomy), `data/networks/*.yaml` (networks), `data/home/site.yaml` (landing page) and the stub
  folders (`data/identity`, `kind: static`), `data/privacy/*.yaml` (a Venn map with `badges.yaml`) and `data/web3/*.yaml` and `data/adoption/*.yaml` (radial
  maps, `kind: radial`: `rings.yaml`, `themes.yaml`, `layout.yaml`, optional `lenses/`) are the only places content lives;
  `data/nav.yaml` is the shared navigation (`wip: true` adds the "in progress" tag). `src/template.html` holds the
  Venn map page's styling and rendering code only; `src/radial.html` renders radial pages and `src/static.html` the
  landing page and stubs, both with the same styles. Per-page settings (`lens_groups`, `badge`, `pill_scale`, `legend`, `panel_default`, `intro_more`, `facets`) live in each
  `site.yaml`, and drawn notes in `layout.yaml` `annotations:`; `layout.yaml` `canvas` sets each map's size. Never put page-specific content in a template. A new
  page is a folder with a `site.yaml`, an entry in `PAGES` in `scripts/build.mjs` and an entry in `data/nav.yaml`.
- `npm run build` validates the data (unknown circle ids or badges, missing definitions, bad statuses, lens colors,
  lens-only circles, `licensed_under`, `bridges`, `networks` maps; rings, themes and cells on radial pages) and
  writes `dist/` for every page. `npm run check` renders each map in headless Chromium, applies every lens and
  writes `dist/preview.png`, `dist/networks/preview.png` and `dist/web3/preview.png`. Run both before committing; CI runs them on every push and pull request.
- `dist/` and `node_modules/` are git-ignored. Never hand-edit generated HTML.
- The favicon is Ethereum Institutional's own (`src/icons/`, taken from ethereuminstitutional.org on 28 October 2026):
  the build inlines it in every page's head, so it works on nested pages and in the release HTML. Replace the three
  files if the site's mark changes.
- CI runners are pinned to `ubuntu-24.04` because Playwright 1.56 cannot install Chromium on Ubuntu 26.04.
- Writing `.github/workflows/*` (ei-platform's or `maps/.github/`) requires a token with the `workflow` scope; commit
  those from a local clone.

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
  only inside Other Issuers. The licensed circles sit in bank ∩ non-bank; the hatched "Unlicensed" zone and the
  Algorithmic circle sit only with Other Issuers.
- **Unlicensed, not "higher risk"** (owner, 29 October 2026, after a colleague's review): the label states the fact
  (no regime reviewed licenses these designs as stablecoins); how much risk a coin carries is for each institution
  and jurisdiction to judge. The red hatching stays because prudential treatment is sourced (Basel Group 2b).
  **Algorithmic** means only reflexive mint-and-burn designs (TerraUSD); crypto-collateralized stablecoins (DAI,
  USDS) are unlicensed stablecoins, not algorithmic. **Synthetic Dollars** (Ethena's USDe: crypto plus short futures,
  a basis trade) are a separate circle in Other Issuers, outside Stablecoins, joined by a look-alike line, in the
  issuer's own words; their lens status follows Algorithmic unless a note says otherwise.
- **Licensed or Recognized Stablecoins** and **Licensed or Recognized Payment Tokens** are `lens_only` circles sharing
  one position: hidden on the default map, shown only under a lens that mentions them (a lens may mention only one).
  "Payment token" is used inconsistently (CBUAE and the Swiss draft: fiat-backed tokens; FINMA 2018, Singapore
  DPT and the UK FCA's 2019 guidance: broad crypto incl. BTC), so use the Payment Tokens circle only where the regime's legal term is a payment token
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
  Re-check `licensed_under` whenever licenses change. The licensed circle stretches towards the side its badges sit
  on, so a badge left of it (HSBC RedCoin, HKMA) does not drag it over unlicensed badges. HSBC RedCoin (RCHKD) is a
  bank-issued stablecoin on HSBC's own DLT network, placed in Commercial Bank ∩ Stablecoins, and drawn only under the
  HKMA lens (`only_under` in `tokens.yaml`: a badge relevant to one regime stays off the general map).
- **Text clears the border:** the build rejects a subtitle or sub-line wider than its circle at that height (a width
  estimate of 0.52 of the font size per character, 4 units in), so shorten it or split it over `lines2`.
- RWA: Commodities, Credit & Trade Finance (private credit, loans, receivables; renamed 29 October 2026 so "credit"
  is where readers look for it), Real Estate, Collectibles & Luxury, IP & Royalties, Financial
  Instruments (Equities, Funds, Fixed Income, Derivatives, with hybrid overlaps for structured notes and
  trackers/warrants). Funds do not overlap Derivatives. Loans packaged into bonds (e.g. MBS) move to Fixed Income.
  Settlement/collateral tokens are treated as part of the asset they carry; there is no separate settlement-token circle.
  Perps are not on the Derivatives sub-label (they are almost always exchange positions, not tokens) but stay in its
  definition, because legally they are derivatives in every lens that addresses them.
- **Other Crypto-Assets** (29 October 2026): drawn as a ring, Utility & Infrastructure in the center and the other seven
  equally spaced around it (owner: no 3 by 3 grid); Community Coins sits top right so the Swiss lens corridor clears
  the title. Digital Art (subtitle NFTs), Gaming, Community Coins, Governance Tokens, Utility &
  Infrastructure (DePIN, AI compute; DeFi is a sector, its tokens land here or in Governance), Loyalty & Access
  (loyalty points, tickets and passes, merged because regulators carve out closed-loop tokens), Staking & Wrapped,
  Identity & Domains. Staking & Wrapped stays here (a claim on a native coin, not money or a real-world asset); a
  "claim on" connector to Native Cryptocurrencies shows while it is hovered or picked (`on:` in `layout.yaml`).
- **Native cryptocurrencies stay in Digital Money** (EI house view, reaffirmed 29 October 2026): they are the money of
  their own ledgers. Only the ten largest are badged; L2 tokens are governance tokens (L2s use ETH for gas), and the
  L2 networks themselves are on the Networks map.
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
  voting; BFT-style PoS and elected sets). Band labels on the map read "Quasi Permissionless / Dynamically Available / Fully Permissionless", the paper's own terms. The three
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
- **Badges** are networks, named (not tickers, because "ETH" is overloaded). `eth: true` = Ethereum blue pill
  `#627eea` (runs an Ethereum client, the EVM, or settles on Ethereum mainnet); otherwise gray `#6b6760`. The ETH
  mark disc is Ethereum gray `#3c3c3d`. These two brand colors are used only on this map (`ETH_BLUE`, `ETH_GRAY` in
  `src/template.html`; the legend's `mark` item takes `pill:` for its pill color). The set is the ten largest native
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

## Adoption page (`data/adoption/`; was Decentralization)

- **Renamed Adoption** (owner, 29 October 2026; URL `/adoption/`, the old `/decentralization/` redirects): adoption
  follows decentralization, so the page leads with that claim and measures the decentralization behind it on the same
  eleven dials. Its first section names a dated outcome from a closed-membership ledger of the same era (TradeLens,
  built on Hyperledger Fabric, closed in 2022 for want of industry-wide collaboration), as facts with sources and our
  view stated as ours; this narrows the earlier rule below that the prose never argues against a named ledger.


- A gauges page (`kind: gauges`, rendered by `src/gauges.html` from the same files as a radial page: `rings.yaml` =
  the five levels, `themes.yaml` = the ten properties with a cell per level, `lenses/`): eleven dials, one per property
  (operating history, developer base, who can stop it, security you can price, who can change the rules, property
  rights at the base layer, verifiable by anyone, open entry and exit, no single point of technical failure, neutral
  issuance, neutral inclusion), each on a scale of 1 (one party holds the property) to 5 (an open network holds it), the property named
  beneath. Each cell says what that level means; thresholds cite their standard (the 2023 US Merger Guidelines' HHI
  lines for share-based properties, ethereum.org's one-third and two-thirds client lines, Budish for cost of attack,
  securities-law disclosure thresholds for the founding share). The purpose is to show what a global shared ledger
  gives an institution that no single-party ledger can, and where Ethereum mainnet lands beside four other public
  ledgers measured the same way (Bitcoin, Canton, Solana, Stellar; owner decision, 26 October 2026). The prose of the
  page never argues against a named ledger: each named lens states its readings, its dates and its sources, and says
  inside each note what that ledger does well on the property.
- **Gauge colours** are the one semantic scale on the site: 1 red `#991b1b`, 2 orange `#ea580c`, 3 yellow `#d9a406`,
  4 yellow-green `#65a30d`, 5 green `#166534` (`scale:` in `site.yaml` may override). The numeral on every segment and
  in the dial's centre carries the value, because the yellow and yellow-green steps are close for red-green
  colour-blind readers; never use these hues elsewhere.
- **Lenses** (`lenses/*.yaml`, `cells` maps each property to a level, `notes` carries the reading, date and source):
  *Ethereum mainnet* first and default (`default_lens`), with measured readings and a short hard-number `readings`
  line under each dial, then the named public ledgers in alphabetical order (`order` 2 to 5: *Bitcoin*, *Canton*,
  *Solana*, *Stellar*), each with its own readings, notes and dated sources, then two generic architectures, *A
  typical consortium ledger* (levels 1 to 3) and *A private chain, one operator* (level 1 everywhere). A lens sets
  every needle; the panel shows the property, its five levels and the lens note for the current level. Keep the
  architectures generic; other product names belong on the networks map. Canton is read as the Global Synchronizer
  and Canton Coin run by its Super Validator nodes (one vote per ordering node, 13 nodes on 26 October 2026); Solana
  is read under Alpenglow (live since 21 October 2026: 80% of stake finalizes in one round, 60% in two, more than
  40% offline halts it); Stellar's consensus weight is Tier 1 membership (ten equal organizations, threshold 7);
  Bitcoin's is pool hashrate share.
- **Re-read every lens when a cell changes.** Whenever a dial's cell definitions in `themes.yaml` change, every
  lens file is re-read against the new cells in the same change, not only Ethereum mainnet: the named ledgers and the
  two generic designs alike, with the level, the reading and the note updated and each lens's weighted score
  recomputed. A lens left on old cells reads against definitions it no longer meets.
- **Measurement choices (house):** share-based properties are scored on the HHI (counts the whole distribution; a
  long tail of small operators counts) with the Nakamoto coefficient shown beside it, because it is tail-insensitive
  (Ovezik et al. 2025); but the HHI is count-insensitive, so on the stop dial its bands apply only to an open
  consensus set, a set that admits its own members reads at most level 3, and three or four parties able to halt
  settlement reads level 2 whatever the HHI (owner, 26 October 2026; Canton and Stellar read 2, the generic
  consortium 3). A party is whoever can switch the validators off or sign for them, so a staking pool counts by its
  node operators, not its brand; on the rules dial a closed body that votes reads level 3 only once it has amended,
  delayed or rejected something the implementer proposed, otherwise the vote is a ratification and the ledger reads
  level 2, vendor decides (owner, 26 October 2026; Canton and Stellar read 2); the developer dial is absolute, not a race: level 5 is thousands of active
  developers with no single employer or funder paying most core maintainers, level 3 is hundreds to about a thousand
  or one organization writing most of the core; the count is Electric Capital's broad measure with applications
  included, and the number of implementations is scored only on the resilience dial, never twice (owner, 26 October
  2026); open entry reads 5 when taking part in consensus needs no approval and no mandatory requirement beyond a
  modest fixed one, so proof of work at any scale through a pool qualifies; property rights read 5 with no freeze
  function and no balance changed outside the rules in the last ten years, older interventions disclosed for ever
  (Bitcoin 2010 and 2013, the 2016 DAO fork); the cost-of-control reading is the value of stake to the safety threshold
  and whether it is slashable; the resilience dial (no single point of technical failure) takes the weakest of three
  readings, as the registered scorecard does (eiplatform D52): the number of client implementations in production
  (one is level 1, five or more is level 5), the largest client's share of nodes on the lines a quarter, a third, a
  half and two thirds (above two thirds is level 1), and node spread on the HHI by provider, country and legal
  jurisdiction with the EU as one (the stop dial's lines); where a ledger publishes no node-spread figures the note
  says so and the level rests on the readings that can be measured; client share is read from the community's own
  series (clientdiversity.org, the ethereum.org snapshot) with the basis stated; years of operation count from genesis (30 July 2015) and the 2016
  DAO fork is always disclosed, with the 2018 refusal of EIP-999 beside it. The same rules apply to every named lens: stake that is neither slashed nor specific
  to the chain caps the cost dial at level 3, while chain-specific proof-of-work hardware over USD 10 billion reads
  level 4 (the attacker loses it by the market, Budish) and only protocol slashing over USD 10 billion reads 5; a
  validator-voted freeze list is "freeze by process" (level 2); a ledger with no global state reads "participants see
  their own records" on the verify dial; on issuance we count holdings an identifiable party can sell or vote, so
  unattributed coins dormant for more than ten years (Patoshi) are disclosed, not counted, and a founding share of a
  quarter or more reads level 2. These readings are a public, simplified cousin of the registered scorecard in the
  eiplatform repository; keep the two consistent and do not publish the registered method's text here.
- **"What an open ledger attracts"** (`stats:` in `site.yaml`): four figures for Ethereum mainnet (holders of
  tokenized dollars, tokenized real-world asset value, tokenized currency in circulation, active developers), each
  dated and sourced; say when a figure includes Layer 2s. **Weighted score** (`score:` in `site.yaml`, `weight` per
  theme; the default weights sum to 105 since the inclusion dial was added, and the score divides by the sum): one number from the ten dials, with sliders so a reader can set their own
  weights (kept in their browser only, keyed to the default weights so a change of defaults resets them; a "Your
  weights" tag shows while custom weights apply). The legitimate concerns about Ethereum mainnet (builder concentration and FOCIL / ePBS; clients above a
  third; node concentration by provider and jurisdiction; unattributed stake and the undisclosed 2014 pool) live
  inside the notes of the dials they belong to (inclusion, resilience, stop, issuance), each with the work addressing
  it; there is no separate concerns section. Keep them current, and write the page in direct address ("you",
  "your risk committee"), not about "an institution".

## Privacy page (`data/privacy/`, in progress)

- A Venn map (no `kind`) of what each design hides **from the public** by default, with **confidential tokens at
  the center** (owner, 26 October 2026: the conversation institutions and individuals are having, with differing
  requirements): three circles after Project Epic's dimensions, **Confidential tokens** (how much: amounts and
  balances, asset type counts here; left, read first, heavier line `sw`), **Anonymity** (who: counterparties) and
  **Private execution** (what: contract logic and state, smaller and below), inside "Privacy on a shared ledger", plus a **Before the block** box under the
  Venn for designs that hide only timing and intent until inclusion (private RPC, order flow auctions, encrypted
  mempools): it is not the page's focus. No design hides logic alone; a note in the empty region says so. The
  narrative sits under the map in `sections` (the map template's `__SECTIONS__` slot, sources collapsed). The
  canvas is smaller than the other maps and `pill_scale: 1.3` enlarges the pills, so the designs read larger than
  the circles; keep labels and pills clear of every circle line. The intro's claim is that privacy on Ethereum is
  thriving today, in many forms.
- **House view (owner, 26 October 2026):** institutions and regulators broadly agree that permissionless privacy
  (anyone may enter, no check) is a reputational risk that lets unlawful actors evade reasonable controls. What they
  want is permissioned privacy among verified participants and assets, ideally with a notary for lawful, auditable
  decryption, on any EVM ledger (private, consortium or public, any consensus), for fungible and non-fungible tokens
  (ERC-20 stablecoins and deposit tokens through ERC-3643 and ERC-7943), on open audited standards, correct by
  on-chain verification, post-quantum, with operators you choose or run yourself (no fixed operator set, no
  dependence on another network, no fee beyond gas) and flexible wallets, with no association with a permissionless
  privacy service (owner: using a service that also serves permissionless privacy can itself raise concern); fees may
  be none or a commercial license. This is the first section under the map
  and the `wishlist` preset in `facet_presets`; no design meets all of it, and the page says so without calling any
  design flawed.
- **Scope (owner, 26 October 2026; to review later):** designs that run the EVM or settle on Ethereum mainnet (so
  Aztec, an Ethereum Layer 2 with its own virtual machine, is in, read as "Its own non-EVM rollup or chain" under Where it runs; there is no separate EVM facet).
  Settling on Ethereum mainnet means Ethereum mainnet verifies the design's state; a non-EVM chain only bridged to it
  (Miden, through Agglayer) is out and not held (owner, 27 October 2026: if Ethereum does not verify it, it is not
  important enough to include). Live designs are solid pills;
  designs on a public testnet only (`status: testnet`: Bermuda, Nightfall) are hollow pills. Non-EVM ledgers
  (Canton) and designs archived or never deployed (Anonymous Zether; ERC-7945, a Final standard with no deployment)
  are held, fully written, in `data/privacy/held.yaml` (not read by the build) so the decision can be revisited.
  The PSE benchmark's protocols were reviewed on 27 October 2026: Tongo (Starknet, read like Aztec) and Merces (live
  with caps on World Chain and Monad) were added; Scroll Cloak (dormant) and Payy (rollup drained and halted 24 September
  2026) are held; Miden is excluded (above); the rest are non-EVM, prototypes, or not a privacy design on a ledger.
- **Badges** (`badges.yaml`) are designs, named, placed by what they hide from the public, `eth: true` blue. Each
  `desc` says what is hidden, from whom else, what you trust, what survives for the issuer, where it runs and its
  track record, in that order, and says what the design does well. Removed products are not drawn (Besu private
  transactions with Tessera, removed in Besu 25.6.0, are named in Pente's note as its predecessor).
- **Focus on** (the sidebar; `facets` and `facet_groups` in `site.yaml`, each badge's `status`, `since` and
  `facts`): factual facets of a confidential token in seven groups, permissioning and disclosure first (the scale
  fully permissionless, e.g. Tornado Cash / selective disclosure or screening, e.g. Railgun / permissioned by allow
  list or verified credentials, e.g. Paladin, examples in the help text only, never in the labels; a design
  capable of several has each; association with a permissionless privacy service, because the reputational risk travels
  with a shared pool or network or a named service, not with software each institution deploys for itself (owner: so
  Paladin Zeto's open variants do not taint Noto, Pente or a permissioned Zeto deployment); sanctions and compliance checks, built in or capable; and who else can see
  it, where a notary with an on-chain notice is the owner's auditable route), then technology, running it, tokens, trust and safety, track
  record, performance. Access control is a permissioning model, not a privacy technology (owner, 26 October 2026):
  designs whose data is simply kept from the public read `offchain` (data off chain, commitments or roots on chain). A reader picks values; within a facet any value matches, across facets all must, and
  `part` makes a dashed partial match; `match: all` (Tokens supported, Hidden from, Issuer controls) requires every picked value; "partly" is never its own value but a `part` of the value it partly meets (post-quantum and on-chain verification read `part: ['yes']`). Post-quantum has a third value, only salted hashes
  or roots on chain (owner, 26 October 2026: institutions want post-quantum cryptography or this): nothing on the
  public record to decrypt later, though signatures and the channels carrying the private data stay classical;
  Paladin Noto and Pente, ZKsync Prividium and Rayls read it, and the wish list accepts either. A facet with nothing
  picked never filters. A preset (the institutional wish list) applies a set of picks and stays active while the
  reader edits them: it filters only by its `require` must-haves (the wish list requires permissioned privacy and compliance checks, so a
  fully permissionless design never ranks), keeps every design that meets them highlighted (solid with every choice,
  dashed otherwise) and ranks them in the panel by choices met, a partial counting half; removing a choice re-ranks
  but never hides a design. Every value has a chip, muted when no design has it, so a preset never picks something
  the reader cannot see. Institutional use reads in production, a public pilot (named institutions, published results) or
  none found; unnamed claims do not count, and the wish list accepts production or a public pilot (owner, 26 October 2026). Without a preset, if nothing holds every pick the closest designs are dashed and ranked, with a tick or cross per choice in its
  fact sheet; facets readers value differently (permissioning, association, compliance checks, who else can see it,
  issuer controls, disclosure) carry `neutral: true` and get plain ink boxes instead, never green or red (owner: a
  cypherpunk reads a notary as a defect, a compliance officer will not consider a protocol without one). Status and years live are filled by the build from `status` and `since`
  against `facts_as_of`. The facets follow the PSE private transfers benchmark (private-transfers.pse.dev; `pse:`
  names its property) so a reading can cite it, verified against the project's own sources. The benchmark repository
  is now `github.com/ethereum/private-transfers-benchmarks`. What it measures and we do not (gas to shield and
  unshield, waits to enter or leave) is not repeated here: a badge's `pse:` (one or more evaluation ids) fills the
  "Entering and leaving" row (`from: pse`) with a link to its evaluation (owner, 27 October 2026). Facts only, no house
  requirements and no ranking: the institutional wish list is a reader's preset, not a score. Every figure (value
  held, gas, anonymity set) carries its date and source in the fact's `note` and `sources`.
- **Legal history is dates and holdings only** (designation, court holding, delisting), never intent or character;
  people are not named. Say which version a fact applies to (Privacy Pools v1 and v2).
- **The whole page is public** (owner, 26 October 2026); there is no registered or gated version for now. The earlier
  plan for a registered confidential-tokens matrix is on hold.
- **Filters and information:** 18 facets are filters in the sidebar (permissioning and compliance: permissioned or
  permissionless privacy, association, compliance checks, who else can see it, issuer controls; technology: privacy
  technology, correctness checked on chain, post-quantum; running it: where it runs, who operates it, dependence on
  another network, fees, who can change the code; tokens; track record: live since, institutional use, audited,
  license). Facets marked `filter: false` are information only, in each design's fact sheet (hidden from, how a view
  is given, where proofs are made, status, keys, wallet, finding your balance, exit, censorship, failure, value held,
  steward, incidents, gas, latency, anonymity set): they barely separate the designs or are mostly unknown.
  **Who else can see it** merges the notary and the operator's view: only the parties; a notary, with an on-chain
  notice; a notary; the operator sees everything (owner: the notary is captured once, not twice).
- **Before the block** designs (Flashbots Protect, MEV Blocker, Shutter) have no `facts`: they are context on the
  map, not confidential tokens, so the sidebar counts 28 designs. A badge's `status_note` explains its status in the
  fact sheet (Paladin: generally available software each institution deploys; no named production deployment).
- Names: Bermuda Bay (not Bermuda); 0xbow Privacy Pools (not Privacy Pools alone); Merces (TACEO's, named in its
  description; the short label keeps the pill clear of the circle lines).

## Architecture page (`data/architecture/`, in progress)

- **A covered blueprint** (owner, 27 October 2026: the full blueprint, with every line, was overwhelming): one fixed
  blueprint (`kind: architecture`, `src/architecture.html`) in the left 70% of the page, a sticky panel in the right
  30%, so the explanation sits beside what it explains. Each area is one region of the blueprint under a cover card
  (name, what it is, what it holds, its dashed optional items); covered, the page shows only the simple flow:
  Clients, Institutional systems, Identity and access management (optional: wallet verification, decentralized
  identity), Scenarios and tokens, the Custody platform (the platform, optional wallet as a service, then
  Transaction management, Approval calling out to Screening, and Signing with Key management, HSM or MPC), Screening
  and Key management below it, and the Distributed ledger as a column on the right that custody submits to. A click
  lifts a cover in place (nothing moves); the region's label covers it again. The covers pulse until the reader first
  reveals one (owner, 27 October 2026: it was not clear they could be clicked), as the Privacy wish list does. No connection lines are drawn except
  when a key flow is traced (owner, 27 October 2026: the lines were hard to follow); a picked component lights up the
  components it connects to, and outlines the covers that hold them, and the panel lists its connections. A flow
  reveals only the areas on its path and draws and numbers its steps.
- **Flows reach the ledger through the RPC nodes** (owner, 27 October 2026): a flow that changes the ledger ends with
  the signed transaction going out through the RPC nodes to the ledger networks, and every read of current state
  (deposits, confirmations, chain events, incidents, validator duties) comes in from the ledger through the RPC nodes;
  history is read through the archive node. A flow may pass a component twice, and its step numbers sit side by side.
  Every step of a flow is drawn in the diagram (a client or a component with a type); rail items cannot be traced, so
  the build rejects a flow that names one (owner, 27 October 2026: the vendor intake flow, all in the rails, showed
  nothing and was removed; the authority request now ends at investigations). On a narrow screen the panel is a sheet at the bottom and the diagram scrolls sideways.
- The page lays the blueprint out itself, fixed, from `overview.yaml` (areas, `parts`, `callout`, `beside`,
  `optional`; the order there is the order on the page; the build checks every component with a `type` sits in
  exactly one of them); `layout.yaml` holds only the two rails (governance, risk and conduct; security, third parties
  and people: components without a type, listed under the diagram because nothing connects to them). Content in
  `architecture.yaml` (`domains` with `components`, `connections`, `flows`, `meta`), page text in `site.yaml`.
- **Generic, not one firm's plan** (owner, 27 October 2026): the components come from practice at a global bank
  (`source: brief`) or are gaps worth considering (`source: suggested`). `status` says how most institutions are
  likely to meet the need (usually met by the core platform, extended, new, or a choice to assess), in that generic
  voice, never "we" or "our".
- **Boxes** differ only by shape, which shows the type (system of record, process, technology, control, key
  material); status, source and the component id sit in the detail card, not on the drawing. Connections are
  instruction (solid), data (dashed, deep sky `#0369a1`) or control (dotted, indigo `#4338ca`); a traced flow is sky
  `#0ea5e9`. A connection runs between drawn nodes only, never a rail item.
- **Sources:** a component may carry `sources` (title, URL, checked date) for the standard, regulation or guidance
  behind it; every due diligence page carries its own, dated. `maps_to` links a component to the other pages (Privacy
  for confidential tokens, Quantum for post-quantum cryptography, Networks and Decentralization for ledger selection,
  Scenarios, Taxonomy, Identity).
- **Due diligence pages** (`systems/<id>/system.yaml`, `src/system.html`): ways to buy or run it, guidance, numbered
  questions (`must: true` marks a question whose wrong answer rules a provider out), a copy button and a CSV
  download, sources and an edit link. Vendor examples are two or three named products of the kind, or none, never a
  single name (it reads as an endorsement); the page notice says names are examples, not endorsements. The confidential
  tokens page follows the Privacy page's facets.
- Quote flow-list items that contain a comma (`['Hyperledger Paladin (Noto, Zeto and Pente)']`); unquoted, YAML splits
  them into two items.

## Quantum page (`data/quantum/`, stub with drafted sections)

- An overview (`site.yaml`, short intro and four cards) with four static sub-pages under `data/quantum/<topic>/`
  (`algorithms`, `ledger`, `roadmap`, `institution`; nested `out` paths, the nav highlights the parent). Keep every
  sub-page to a few short paragraphs that link out (`more`) rather than explain in full. Their `sections:` hold: the two algorithms (Shor breaks elliptic-curve signatures and
  pairings; Grover only halves hash security, so hashes are weakened, not broken), where it bites a ledger (exposed
  account keys after a first spend; validator BLS keys; KZG commitments and pairing-based SNARKs; what is not at risk
  on a public ledger), and the Ethereum roadmap (now: hashes, STARK rollups, account abstraction via ERC-4337 and
  EIP-7702 lets an account run a post-quantum scheme today; next: EIP-8141 signature agility, EIP-7932, EIP-7864
  binary tree, Lean Ethereum with leanXMSS and leanVM aggregation, core infrastructure targeted for about 2029).
  Source of record is ethereum.org's quantum-resistance page (dated on the page); say dates are community targets.
  A fourth section, "Where your digital asset team fits", frames the institution-wide programme (the team already
  knows novel cryptography and key management; inventory first; prioritize by exposure clock; post-quantum
  requirements in procurement and vendor management; crypto-agility; the NCSC 2028 / 2031 / 2035 timeline, the EU
  roadmap and NIST IR 8547). Sections link out to the primary article (`more`) rather than explain in full; sources
  stay collapsed.
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
  the Bitcoin Law), UK, US (GENIUS Act), US SEC (`us-sec`, securities: "in" means a security; built on the Commission's
  17 March 2026 interpretation with the CFTC, Release 33-11412, which sorts tokens into digital commodities,
  collectibles, tools, stablecoins and digital securities, the 28 January 2026 staff statement on tokenized securities,
  and the 17 September 2026 Innovation Exemption for tokenized NMS stock, Release 34-106402).
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
