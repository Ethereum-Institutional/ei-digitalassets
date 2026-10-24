# Changelog

All notable changes to the Digital Asset Taxonomy. Versions follow [SemVer](https://semver.org): **major** for structural changes to the map
(new or removed circles, relabelled categories), **minor** for new lenses or token placements, **patch** for wording and source updates.
While the version is below 1.0.0 the taxonomy is a draft: it has not yet had legal or counsel review, and placements, labels
and lens treatments may change in any release.

## [Unreleased]

- **Structural:** the “Licensed Stablecoins & Payment Tokens” circle is split into two lens-only circles,
  **Licensed or Recognised Stablecoins** and **Licensed or Recognised Payment Tokens**, which are hidden on the default map and appear only under
  lenses whose regime defines them. A licence is jurisdictional, and “payment token” means a licensed fiat-backed
  token in some regimes (UAE CBUAE, the Swiss draft) but a broad crypto class in others (FINMA 2018, Singapore DPT).
- “Licensed or Recognised”: licensed means the regime gave the issuer a licence (not inherited from another regime);
  recognised means its regulator made a token-specific decision (accepted, verified, registered, no-objection).
  Tolerance during a transition or a classification does not count.
- These circles appear only where the regime is enacted. Licensed or Recognised Stablecoins no longer appears under
  lenses with no licensing regime (FATF, FSB, IOSCO, India, China) or only a proposed one (Korea, Singapore); the
  proposals are described in the Stablecoins note. The Singapore intro no longer implies the “MAS-regulated stablecoin”
  label is in use.
- Switzerland lens: “Payment tokens” is one continuous outline around Bitcoin, Ether, other Layer-1s, community coins,
  USDT and USDC, with notes that stablecoins are classified case by case and hold no Swiss licence. The draft
  stable-value payment token regime is described in the Stablecoins note (not yet law, so no licensed circle).
  Unlicensed and algorithmic stablecoins and staking/wrapped tokens are now “depends” (case by case), not payment tokens.
- Lens notes can be keyed by token ticker as well as circle id.
- Stablecoin area review:
  - IMF lens: Unlicensed / higher risk is no longer e-money; it is “depends” (fiat-reserve designs are e-money in
    form, crypto-collateralised and synthetic ones are not addressed by the 2019 paper). USDC and USDT join the e-money
    group as “fiat tokens”, which the paper names as e-money. Algorithmic stays under Cryptocurrency (“managed coins”).
  - GENIUS lens: the ban on offering non-permitted stablecoins to US persons applies from July 2028, not on enactment.
  - DIFC lens: reflects the 12 January 2026 rules (fiat tokens still verified by the DFSA; other tokens self-assessed).
  - Japan, ADGM, DIFC: token notes clarify that USDC and USDT are accepted or recognised for use, not licensed issuers.
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
- USDC and USDT sit side by side at the centre of Regulated Non-Bank and never move. Under lenses that license them,
  Licensed or Recognised Stablecoins stretches to take the badge in (USDC: MiCA, Japan, ADGM, DIFC, El Salvador; USDT:
  ADGM, El Salvador). Under GENIUS both stay outside: USDC’s issuer holds state licences but is not yet permitted under
  the Act, and USDT is tolerated during the transition, not recognised.
- Definitions: “digital” means represented on distributed ledger technology (DLT); Digital Money is any sovereign
  currency in tokenized form or native cryptocurrency used as money, represented on DLT. Assets that can meet a broad
  definition of money, such as tokenized money market funds or community coins, are categorised separately because
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
- Fixed: lens colours that were hard to tell apart (e.g. HKMA tokenized deposits vs licensed stablecoins; IMF b-money,
  e-money and cryptocurrency). Grouped lenses now use one neutral palette with consistent meanings and an ink lens
  colour; the build rejects colours closer than ΔE00 20 within a lens and red/amber/green hues outside their meaning.
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
