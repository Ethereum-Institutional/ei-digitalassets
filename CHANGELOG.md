# Changelog

All notable changes to the Digital Asset Taxonomy. Versions follow [SemVer](https://semver.org): **major** for structural changes to the map
(new or removed circles, relabeled categories), **minor** for new lenses or token placements, **patch** for wording and source updates.
While the version is below 1.0.0 the taxonomy is a draft: it has not yet had legal or counsel review, and placements, labels
and lens treatments may change in any release.

## [Unreleased]

- **Banner and tags:** every page's notice is now the same two lines, "Under development. For discussion only; not legal advice." (owner, 7 November 2026: simplified), and the "in progress" tag comes off Scenarios, Architecture, Privacy, Identity and Quantum in the navigation and on the landing cards; the scenarios index no longer distinguishes written from planned, since all ten are written.
- **Quantum, November 2026 update:** the community’s own threat estimate (ethereum.org: the end of the decade at the earliest, about 1,200 logical qubits; the Ethereum Foundation’s post-quantum team: early to mid 2030s, not imminent; its researchers at Devcon India: 2029 earliest, 2032 expected, three years earlier than before) beside the regulators’ deadlines on the roadmap and institution pages; coordination as the bottleneck, with 2028 the earliest on the current upgrade cadence; leanXMSS and leanVM for validators, a lean adaptation of SPHINCS+ for accounts, and the L1’s choice of hashes over lattices; seed phrases survive the migration, the emergency plan (proof of seed) and what it does not cover (MPC custody), and bunker mode for exposed keys on the ledger page; coins nobody can move as an open question; and a new algorithms item on cryptanalysis by AI, a research view hedged as such. Sources checked 6 November 2026 (ethereum.org, pq.ethereum.org, IACR ePrint 2025/1332, Decrypt and Cointelegraph as secondary, the Devcon video).
- **Scenarios, Repo and reverse repo:** the second written scenario, a tokenized bond against a bank deposit token, intraday or overnight: six actors, eight steps with the opening and closing legs as atomic bands, margin and substitution between them, the default path at the closing; tokens from the taxonomy (deposit token, fixed income, fund units as alternative collateral, stablecoin and wholesale central bank money as alternative cash legs); standards (ERC-20, ERC-3643, ERC-7943, ERC-2612, EIP-3009, EIP-712, ERC-4337, ERC-7573) with the GMRA 2011 and its Digital Assets and Digital Bonds Annexes as a legal text; sections on why a public shared ledger, where it stands today (Kinexys intraday repo since 2020 and Broadridge's USD 8.0 trillion in July 2026, both vendor-stated; no live public-ledger repo named), variants and open questions. Sources checked 6 November 2026. The index links it.
- **Scenarios, AI agent payments:** the third written scenario, an agent paying for a service in a stablecoin within a mandate its principal controls: six actors (principal, agent, ledger and account, provider, facilitator, auditor), eight steps with the settlement as the atomic band (x402’s 402 flow, the mandate checked by the principal’s policy engine, an EIP-3009 authorization signed with EIP-712, the facilitator’s verify and settle, service delivered, ERC-8004 reputation, finality and revocation); tokens (stablecoin, deposit token as alternative money); standards (x402 under the Linux Foundation since 2 April 2026, EIP-3009, EIP-712, ERC-20, ERC-4337, EIP-7702, ERC-7715, ERC-8004); sections on why a public shared ledger, where it stands today (x402 Foundation, ERC-8004 live on mainnet since January 2026, banks’ view that a prompt is not a control), variants and open questions. Sources checked 6 November 2026.
- **Scenarios, Treasury management with tokenized money market funds:** the fourth written scenario: a group treasurer, an operating subsidiary, the deposit token issuer, the ledger with the fund’s dealing contract, the transfer agent and administrator, the auditor; eight steps with the sweep and the redemption as atomic bands (at par against a teller, or request and claim at the struck price), the position read every block, intra-group concentration, payments out; tokens (deposit token, fund units, stablecoin as alternative cash); standards (ERC-20, ERC-3643, ERC-7540, ERC-2612, EIP-3009, EIP-712, ERC-4337); sections on why a public shared ledger, where it stands today, variants (sweep by rule, stablecoin, several currencies, units as collateral) and open questions, with the fund’s own dealing and liquidity terms first. Sources from the register, checked 25 October to 6 November 2026.
- **Scenarios, Payments with tokenized currency:** the fifth written scenario, a cross-border supplier payment in a deposit token or a regulated stablecoin: payer, the firm on each side, the ledger, payee, auditor; eight steps (onboarding, invoice, funding, screening and the travel rule exchanged off the ledger, the transfer as the atomic band, confirmation and reconciliation from the event, hold or off-ramp, finality); tokens (deposit token, stablecoin, wholesale central bank money for the interbank leg); standards (ERC-20, EIP-3009, ERC-2612, EIP-712, ERC-4337) with the travel rule listed as a rule, not an ERC; where it stands today (Visa’s stablecoin settlement, Stripe’s acceptance, JPMD on mainnet, tokenized deposits on Swift’s ledger, Project Agorá); variants and open questions. Sources from the register.
- **Scenarios, FX payment versus payment:** the sixth written scenario, a euro tokenized currency against a dollar tokenized currency: the two parties, the two issuers, the ledger with a PvP contract, the auditor; eight steps (onboarding on both currencies, trade agreed, liquidity confirmed with no credit, each leg authorized, payment versus payment as the atomic band, finality, books and the off-ramp); tokens (deposit token, tokenized deposits on a multi-bank network, stablecoins, FMI token, wholesale central bank money); standards (ERC-20, ERC-2612, EIP-3009, EIP-712, ERC-4337, ERC-7573); where it stands today (Partior, JPMD, Fnality sterling, mBridge’s FX PvP pilot and MVP, Agorá with eight central banks, USDC and EURC), five variants and five open questions. Sources from the register.
- **Scenarios, Securities lending:** the seventh written scenario, a tokenized bond lent against tokenized collateral: lender, agent lender or custodian, the ledger with a lending contract, borrower, registrar, auditor; eight steps (master agreement and eligibility, loan agreed, each leg authorized, the opening as an atomic band, margin, manufactured payments and substitution, recall and return as an atomic band with the default path, finality and record); tokens (fixed income as the security lent, equities as the usual one with no live program named, deposit token, fund units and stablecoin as collateral); standards (ERC-20, ERC-3643, ERC-7943, ERC-2612, EIP-3009, EIP-712, ERC-4337, ERC-7573); where it stands today (the pieces, not the program), six variants including a flash loan noted as a neighbor, six open questions. Sources from the register.
- **Scenarios, Collateral mobility and margin:** the eighth written scenario, tokenized fund units posted as margin: giver, collateral or tri-party agent, the ledger with a collateral contract, taker, the collateral token’s transfer agent, auditor; eight steps (agreement and schedule, margin call, selection, posting as an atomic band with the pledge and title-transfer forms, valuation, income, substitution and re-use, variation margin, release or enforcement as an atomic band, finality and reporting); tokens (fund units, bonds, deposit token and stablecoin as cash margin); standards (ERC-20, ERC-7943 for the lock and the enforced transfer, ERC-3643, ERC-2612, EIP-3009, EIP-712, ERC-4337, ERC-3156 for the flash-loan refinancing variant, ERC-7573); where it stands today (bank-run and market-infrastructure collateral programs, exchange collateral, no clearing house named), six variants and five open questions, with what a lock is in law first. Sources from the register plus ERC-3156 (checked 6 November 2026).
- **Scenarios, Fund subscription and redemption:** the ninth written scenario, a subscription and a redemption in a tokenized fund: investor, cash token issuer, the ledger with the fund-share and dealing contracts, transfer agent and administrator, the fund, auditor or depositary; eight steps (onboarding, the order with the cash, the cut-off and the net asset value, issue as an atomic band, holding and secondary transfers, the redemption order with the units, cancel as an atomic band, register and audit); tokens (fund units, stablecoin, deposit token); standards (ERC-7540, ERC-3643, ERC-20, ERC-2612, EIP-3009, EIP-712, ERC-4337); where it stands today, five variants (constant-price, cut-off, nominee, drawdown fund, treasury) and six open questions, with the register model first. Sources from the register.
- **Scenarios, Corporate actions and distributions:** the tenth written scenario, a distribution and a redemption on a tokenized security: issuer, registrar or paying agent, the ledger with a distribution contract, holder, cash token issuer, auditor; eight steps (announcement and record block, entitlement fixed at the record block, election as a signed message, funding, distribution to every holder as an atomic band, pass-through by nominees and on securities on loan, redemption as an atomic band, record and reporting); tokens (bonds, fund units with income as units or price, equities with no live program named, deposit token and stablecoin as the cash); standards (ERC-20, ERC-3643, EIP-712, EIP-3009, ERC-2612, ERC-4337, ERC-7573); where it stands today, six variants (income as units or price, reinvestment, splits and rights, tenders, votes, cash on another ledger) and six open questions, with who holds at the record block first. Sources from the register. All ten scenarios on the index are written.
- **Identity, live:** the in-progress tag comes off the navigation entry (owner, 6 November 2026). The revenue proposal ("From cost center to revenue") moves off the page to `data/identity/held.yaml`, held for a scenario or a brief; the page ends at providers and standards. The schemes box gains the ePassport chip standard (ICAO Doc 9303, Eighth Edition 2021; the issuing State's Document Signer and CSCA, the Public Key Directory), which the ZK passport proofs build on; the ERC-3643 badge names ONCHAINID precisely (the identity contract in the standard's reference assets, ERC-734 and ERC-735) with its sources (owner, 6 November 2026).
- **Identity map, first draft:** the Identity stub becomes a Venn map of three questions (Verified identity, Proof of control, Permission) with 27 mechanisms placed by the question each answers, six facets and an issuer preset, and narrative sections under the map (bearer assets and permissioned tokens, carrying a check onto the ledger, sovereign schemes, decentralized identity and the state, signatures, agents and devices, AML and the travel rule, a revenue proposal marked in progress, choosing providers). Every claim carries a source fetched on 6 November 2026. Wording: blocklist and allowlist, never denylist; the blocklist badge is generic, with USDC and USDT as examples (owner, 6 November 2026). Government and sector digital identity schemes (Singpass, UAE PASS, iAM Smart, the EUDI Wallet) sit in their own box under the ledger box, because they do not run on a shared ledger and are digital identity rather than decentralized identity (owner, 6 November 2026). No second-model check: the owner reviewed the built page and waived it for this first draft (owner, 6 November 2026).
- **Venn maps, labels:** the build now checks every main label line against its circle's border, as it did sub-labels; the Identity map's two big labels run on two lines, centered in each circle's own lune. `facets_noun` in `site.yaml` sets what the sidebar calls a badge (mechanism on Identity, design elsewhere).

- **Pending-changes batch 2** (`PENDING-CHANGES.md`; owner-reviewed on the built pages, no second-model check for map batches since 6 November 2026):
  - **Networks, dynamically available and Ethereum mainnet (M14):** Casper FFG finality is reached when validators with at least two-thirds of staked ETH cast the required checkpoint votes, not whenever two-thirds is online (ethereum.org, Proof-of-stake).
  - **Networks, Ethereum mainnet (M15):** absent validators lose the rewards they would have earned as missed-attestation penalties; the inactivity leak applies only after more than four epochs without finality (ethereum.org, Rewards and penalties).
  - **Networks, Ethereum mainnet (M16):** the slashable offenses are named (two blocks for one slot, double and surround votes); an isolated slashing burns about 0.008 ETH of a 32 ETH validator at once and forces exit, and the correlation penalty makes a mass event severe.
  - **Adoption, Ethereum mainnet (M17):** the intro, cost reading and note separate a stall (one third of stake withholding votes, drained by the inactivity leak, not slashed) from reverting a finalized block (at least one third committed to loss by slashing). Cost level stays at 5 (owner, 6 November 2026: the dial measures the safety threshold, and reverting finality is slashable).
  - **Taxonomy, CBDC and Retail CBDC (M22):** e-CNY is no longer the plain retail example; both descriptions state that the PBoC has booked e-CNY in commercial bank wallets as bank deposits since 1 January 2026. The retail badge stays in Retail CBDC (owner, 6 November 2026).
  - **Adoption, Canton (M25; M23 in PR #91, renumbered because #93 took M23 for the Funds node):** the history note says what a Logical Synchronizer Upgrade pauses (24 hours of topology transactions; Daml transactions delayed seconds to minutes), that the CantonBFT upgrade scheduled for 8 August 2026 ran on 9 to 10 October after a CantonBFT issue surfaced on DevNet, and that BitGo could not set up Canton wallets for about 25.5 hours while transfers continued (BitGo status page); the resilience note adds the High-severity topology-fork bug 26-004, fixed in Canton 3.5.6 (24 June 2026). Readings and levels unchanged.
  - **Adoption, Canton, history reading (M25):** "last downtime 10 Oct 2026 (upgrade freeze)" in place of "4 scheduled halts, last Dec 2025": a topology freeze counts as downtime (owner, 6 November 2026); the 10 October switch sourced to the Canton Foundation's milestone record (issue 249).
  - **Networks, quasi-permissionless (M24):** the band's sub-line and description no longer say two-thirds must stay online: the paper's definition names no fraction, and each protocol fixes its own quorum, more than two-thirds in classic BFT designs and 60% of stake (80% in one round) under Alpenglow, which tolerates 40% offline (owner, 6 November 2026); sources added (arXiv 2304.14701, SIMD-0326); `definitions/networks/quasi-permissionless` follows.
- **Taxonomy, e-CNY:** two badges drawn only under the Mainland China lens (`only_under`): the retail e-CNY in Retail CBDC, the PBoC's own retail CBDC (2021 white paper: M0, a PBoC liability, legal tender), with its description stating that since 1 January 2026 the PBoC books balances in commercial bank wallets as the bank's deposit liability (interest-bearing, deposit-insured, in the reserve base; the deputy governor's article of 29 December 2025; Xinhua on the State Council site) and naming the tension with the circle's rule; and the wholesale use of e-CNY in Wholesale CBDC, on Project mBridge, where the PBoC is the exclusive issuer and redeemer (mBridge report, October 2022; pilot figures; cumulative volume and the e-CNY share from the same article). The lens gains a note per badge and its first two sources. Whether the retail badge stays in Retail CBDC, and the CBDC and Retail CBDC descriptions that cite e-CNY as the retail example, go to the next pending-changes batch (M22) (owner, 5 November 2026).
- **Badges, `label`:** `tokens.yaml` may set `label` to the chip text when two badges must read the same (e-CNY retail and wholesale); the id (`ticker`) stays unique, and the panel shows the label.

- **Pending-changes batch 1** (`PENDING-CHANGES.md`, found by the second-model checks of the Roadmap and Network choice foundations; checked as one batch before merge):
  - **Adoption, Ethereum mainnet (M1):** the rules reading no longer counts upgrades; the note says ethereum.org counted 16 by July 2025 and names Fusaka (3 December 2025) as the latest named upgrade, followed by BPO1 and BPO2; EIP-7607 added as the source for those dates.
  - **Adoption, Ethereum mainnet, resilience and rules (M12):** the finality threshold is stated as a share of staked ETH; only stake-weighted series estimate it, since validators hold different effective balances. The rules note's upgrade block is stated in staked ETH, not nodes. Levels unchanged.
  - **Networks, dynamically available and Ethereum mainnet (M2):** block production "can continue as participation falls, with empty slots for absent proposers", in place of "at any level of participation" (ethereum.org, Blocks).
  - **Networks and Adoption, Solana (M3):** Alpenglow replaces the consensus based on Proof of History and Tower BFT (SIMD-0326); the Validator Admission Ticket is 0.8 SOL an epoch, as the Solana Foundation's mainnet page states (SIMD-0357 proposed 1.6), close to the roughly 1 SOL of vote fees it ended; voting admission needs a registered BLS key and a place in the top 2,000 by stake; the Firedancer share is marked as not yet reconciled with post-migration voting.
  - **Networks, Layer 2 lens (M4):** exit and forced transactions are designed to run through Ethereum mainnet, subject to each rollup's contracts and governance, rather than "always"; L2BEAT's Stages framework added to the lens sources.
  - **Networks, Base (M5):** since the Azul upgrade (May 2026; Base's documentation and L2BEAT give different days) Base proves state with a TEE and ZK multiproof, not the OP Stack's fault proofs; 5 days with one proof since the Beryl upgrade (7 before) and 1 day with both; Base left the Superchain in March 2026 (Base documentation; L2BEAT).
  - **Adoption, contribute (M7):** "These eleven", matching the eleven properties.
  - **Networks, private (M13):** "use clients such as Besu" in place of "overwhelmingly choose Besu", for lack of an adoption-share source, and "private Ethereum-technology networks" (D34).
- **Taxonomy and Scenarios, CBDC status:** the CBDC circle calls the digital euro planned, not a pilot, and says CBDCs are placed there whatever ledger they run on, since the map groups money by who owes it and the digital euro's platform is centralized (ECB FAQ, 17 August 2026; owner, 2 November 2026); the Retail CBDC circle says distribution through an intermediary does not by itself change who owes the balance, while a balance the intermediary books as its own deposit is a bank deposit (BIS, 2021); the Wholesale CBDC circle states EI's convention, a token outside the central bank's existing accounts, with a link to RTGS and no token as a neighbor (owner, 2 November 2026); the DvP scenario's wholesale cash leg reflects Pontes, live since 21 September 2026, with finality on its DLT platform planned for 2027. Found while building the CBDCs Definition piece and in its second-model checks (2 November 2026); applied as an owner exception to batching.
- **Networks, Spiko:** the four Spiko entries cite the prospectus's 1 September 2026 edition, which adds Solana to the shareholder-register ledgers (eight); the address is mutable and has served earlier editions. Found by the second-model check of the money market funds Market piece.
- **Taxonomy:** the Equities ∩ Derivatives (tracker) description now covers trackers in any legal form (derivative contracts, certificates, debt securities), says the holder's rights arise under the instrument rather than the share, and that the overlap shows equity-linked exposure, not a single legal classification (SEC staff statement on tokenized securities, 28 January 2026; Robinhood and Backed issuer documentation; second-model check, 1 November 2026).
- **Taxonomy, Funds:** the income sentence separates the valuation convention (a stable-value fund seeks, without guaranteeing, a constant price; LVNAV deals at a constant price only within 20 basis points of its calculated NAV, so it is no longer grouped with CNAV; a VNAV price can fall as well as rise) from the income treatment (paid out, reinvested in units or accumulated). Per-product income mechanics and "the European norm" removed; the dealing sentence no longer assumes a cut-off and forward pricing for every fund. Sources added: Regulation (EU) 2017/1131, the Spiko prospectus (1 September 2026) and the Franklin OnChain prospectus (1 August 2026). Found by the second-model checks of the money market funds Definition piece and of this change (`definitions/checks/2026-11-01-tokenized-fund.md`).
- **Scenarios:** Treasury management reads "on each fund's dealing and liquidity terms; eligible holders may transfer units outside dealing hours", in place of "without a cut-off".
- **Adoption, Ethereum mainnet, who can change the rules:** the client-team block "weakens as client shares fall, and would end when no client's refusal could stop an upgrade from finalizing", rather than disappearing below a third of nodes, because the finality threshold is measured in staked ETH, not nodes (owner, 1 November 2026). Level unchanged.
- **Adoption, Ethereum mainnet, property rights:** balances change under the protocol rules through signed transactions and protocol operations such as validator withdrawals (EIP-4895), not through signed transactions only; no role or administrator key can freeze or seize a balance at its discretion; EIP-999 described as restoring the Parity library's code so dependent wallets could regain access. Found by the second-model check of the Roadmap and upgrades page 3; the level is unchanged.
- **Taxonomy:** the Fixed Income description says "Credit & Trade Finance", the node's name since 29 October, not "Loans & Trade Finance".
- **Decentralization is now Adoption** (`/adoption/`; `/decentralization/` redirects). The page leads with adoption
  following decentralization (a flywheel of public innovation) and adds a section, "Why decentralization drives
  adoption", citing TradeLens on Hyperledger Fabric (closed 2022). The eleven dials, lenses and weights are unchanged.
- **Taxonomy review with a colleague.** "Unlicensed" replaces "Unlicensed / higher risk" (the red hatching stays,
  sourced to Basel Group 2b); Algorithmic now means only mint-and-burn designs, so DAI and USDS are no longer called
  algorithmic; a new Synthetic Dollars circle (Ethena's USDe) sits in Other Issuers outside Stablecoins with a
  look-alike line. Other Crypto-Assets: Gaming (was Gaming Points), Loyalty & Access (Loyalty Points merged with
  Tickets & Memberships, lens statuses and notes merged), Utility & Infrastructure (DePIN, AI). Staking & Wrapped
  shows a "claim on" line to Native Cryptocurrencies while picked. Loans & Trade Finance is now Credit & Trade
  Finance; perps leave the Derivatives sub-label but stay in its definition.
- **Other Crypto-Assets as a ring** (Utility & Infrastructure in the center); Digital Art has NFTs as its subtitle;
  every subtitle now clears its circle's border, and the build checks it.
- **HSBC RedCoin (RCHKD)** badge in Commercial Bank ∩ Stablecoins, shown only under the HKMA lens (`only_under`),
  licensed under it (licence FRS02); the
  HKMA lens gains its first sources (the HKMA register and HSBC). The licensed circle now stretches towards the side
  its badges sit on.
- **New lens: US SEC "security"** (`lenses/us-sec.yaml`): the Commission's March 2026 interpretation (digital
  commodities, collectibles and tools are not securities; a security stays a security on chain), the January 2026
  staff statement on tokenized securities and the September 2026 Innovation Exemption for tokenized NMS stock, with
  sec.gov sources throughout.
- **Zcash:** the badge says some regulators list privacy tokens as prohibited, without naming one.
- **UK lens re-sourced from the FCA.** The lens had no sources; it now cites the FCA cryptoassets page, the
  regime's policy statements (PS26/9 to PS26/13, 30 June 2026), the stablecoin issuance rules (PS26/10) and the
  perimeter guidance (PS26/18, PERG 18). The intro names the Financial Services and Markets Act 2000 (Cryptoassets)
  Regulations 2026 (it said a 2025 order), the full application window (30 September 2026 to 28 February 2027) and
  what applies today (money laundering registration since January 2020, financial promotions since October 2023).
  Notes now say that overseas-issued stablecoins are qualifying stablecoins too, give the UK issuance rules (full
  backing, redemption at par by the next business day, statutory trust, up to 5% excess), exclude algorithmic and
  hybrid stabilization and limited-network tokens, judge NFTs on substance, and keep tokenized fund units as
  specified investments. No circle changes status.
- **Favicon.** Every page now carries Ethereum Institutional's favicon, inlined from `src/icons/`.
- **Architecture: a covered blueprint.** The blueprint is laid out by area and each area sits under a cover, so the
  page opens on the simple flow (Clients, Institutional systems, Identity and access management, Scenarios and
  tokens, a Custody platform of transaction management, approval and signing that calls out to Screening and Key
  management, and the Distributed ledger as a column on the right), with optional wallet verification, decentralized
  identity and wallet as a service drawn dashed. The covers pulse until the first one is revealed, so they read as the thing to click. A click lifts a cover in
  place; connection lines appear only when a
  key flow is traced, and a picked component lights up the components it connects to. A panel on the right explains what is revealed or
  picked, so explanations no longer sit under the drawing. Flows reveal the areas they cross, and every flow
  that touches the ledger now passes through the RPC nodes: outbound and settlement transactions are submitted
  through them to the ledger, and deposits, confirmations, chain events, incidents and validator duties are read in
  through them (new connections: signature back to signing, ledger to RPC nodes, RPC nodes to the indexer and the
  validator client, and the incident response back to signing). The new tool or vendor intake flow (F12), whose
  steps all sit in the rails, is removed because the diagram cannot show it, and the authority request (F11) ends at
  investigations; the build now rejects a flow step that is not drawn. The page lays the
  blueprint out from the new `data/architecture/overview.yaml`; `layout.yaml` keeps only the rails.
- **Privacy: designs from the PSE benchmark.** Every protocol in the PSE private transfers benchmark was reviewed
  against the page's scope. Added: Tongo (encrypted ERC-20 balances on Starknet, an Ethereum Layer 2) and Merces
  (TACEO; amounts and counterparties hidden by MPC operators with a proof checked on chain; live with caps on World
  Chain and Monad). Held, written up in `held.yaml`: Scroll Cloak and Payy. Miden is out of scope: a non-EVM chain
  whose state Ethereum mainnet does not verify. A new "Entering and leaving" row in
  each fact sheet links the design's PSE evaluation for shield and unshield gas and waits, which the benchmark keeps
  current; links to the benchmark now use its new home, `github.com/ethereum/private-transfers-benchmarks`.
- `CLAUDE.md` says where the source lives (ei-platform `maps/`; this repository is its mirror) and how a change ships; releases are paused.
- **Architecture page (in progress), with due diligence questions.** A new `kind: architecture` page draws the
  architecture of a digital asset team inside a global bank or similar institution as a blueprint: lanes run from the
  clients at the top (retail, wholesale, staff and administrators, and authorities) to the private keys at the
  bottom, with the main transaction running down a central spine (channels, identity, scenarios, order control,
  allowlisting, screening, approval, multi-signature, custody, signing, MPC, keys), a ledger column for data, nodes
  and validator operations, and two rails (governance, risk and conduct; security, third parties and people) listed
  under the drawing. 115 components and 88 typed connections (instruction, data, control); twelve key flows (F1 to
  F12) trace numbered paths. Statuses are generic (how most institutions are likely to meet the need), and 94
  components carry dated sources for the standard or regulation behind them (MiCA, DORA, the Transfer of Funds
  Regulation, Basel SCO60, NIST, FIPS 140-3, CCSS, FATF, IOSCO, OFAC and others). A confidential tokens component
  links to the Privacy page; post-quantum cryptography links to Quantum and ledger selection to Networks and
  Decentralization. **Due diligence pages:** every `data/architecture/systems/<id>/system.yaml` becomes a page at
  `/architecture/<id>/`: 16 systems and 238 questions (45 marked as able to rule a provider out), each page with ways to
  buy or run it, guidance, a copy button, a CSV download, five or six dated sources and an edit link. Vendor examples
  are two or three named products or none. `architecture/#<id>` opens the blueprint with that component pinned.

- **Decentralization: every lens re-read against the new resilience cells.** The single points of failure dial
  takes the weakest of client count, the largest client's share and node spread on the HHI (eiplatform D52), but only
  the Ethereum mainnet lens had been re-read. Bitcoin (one code base on over 99% of nodes), Solana (Agave-based
  clients on 82.4% of stake), Stellar and Canton (one implementation each) and the generic consortium (one client)
  now read level 1 there, with node spread read where the lens has the figures (Solana and Stellar) and said to be
  unavailable where it does not. Weighted scores: Bitcoin 4.38 to 4.19, Solana 3.48 to 3.29, Stellar 2.81 to 2.71,
  Canton 2.00 to 1.90, the generic consortium 2.33 to 2.24; Ethereum mainnet (4.48) and the single operator (1.00)
  are unchanged. CLAUDE.md now states the resilience cells and that every lens is re-read whenever a cell changes.

- **Decentralization: saved weights follow the defaults.** A reader's slider weights are now stored with the default
  weights they were set against, so a change to the defaults resets them instead of being silently overridden;
  weights saved before this change are ignored once. A "Your weights" tag shows beside the score while custom
  weights apply, and moving every slider back to its default clears what is stored.

- **Privacy map (in progress).** The stub becomes a public Venn map of what each privacy design hides from the
  public, with confidential tokens at the center: **Confidential tokens** (how much), **Anonymity** (who) and
  **Private execution** (what), plus a **Before the block** box underneath for designs that hide only intent (context,
  without facts). It places 26 confidential-token designs that run the EVM or settle on Ethereum mainnet, from Zama,
  Hyperledger Paladin (Noto, Zeto, Pente), Railgun, 0xbow Privacy Pools and ZKsync Prividium to Aztec and COTI,
  cross-checked against the PSE private transfers benchmark; designs only on a public testnet (Bermuda Bay,
  Nightfall, Horizen Vela) are hollow pills. A **Focus on** sidebar replaces lenses: 18 filters (permissioning and
  compliance, including who else can see it, with a notary route that leaves an on-chain notice; technology; running
  it; tokens; track record) and 16 more facts in each design's fact sheet, all dated and sourced. **The
  institutional wish list** button applies what institutions ask for, filters only by its must-haves (permissioned
  privacy and compliance checks) and ranks the rest by choices met; no design meets it all yet. Sections under the
  map open with what institutions are asking for; the roadmap section covers the drafts that let privacy
  protocols spend without a relayer (EIP-8141, EIP-8250, EIP-8272, EIP-8369) and the Hegotá privacy testnet that runs them. Canton, Anonymous Zether, ERC-7945, TEN Protocol and Intmax are
  held for future review in `data/privacy/held.yaml`. Engine: the Venn map template honors `layout.yaml` `canvas`
  (it was fixed at 1600 by 1300), gains a sections slot, `pill_scale`, hollow testnet pills, a heavier line per
  circle (`sw`), and the facets sidebar (`facets`, `facet_groups`, `facet_presets` with `require`, `facts`,
  `match: all`, `neutral`, `filter: false`). Home tile tagline updated.

- **Decentralization: three dials re-yardsticked again (owner, 26 October 2026).** Developer base: level 5 is
  thousands of developers with no single employer or funder paying most core maintainers; the number of
  implementations is scored only on the resilience dial, so it is no longer counted twice. Open entry: level 5 is
  no approval and no mandatory requirement beyond a modest fixed one, so proof of work at any scale qualifies.
  Property rights: level 5 is no freeze function and no balance changed outside the rules in the last ten years,
  with older interventions disclosed for ever. Bitcoin moves to 5 on all three (4.14 to 4.38); Ethereum mainnet
  moves to 5 on property rights (the DAO fork passed ten years in July 2026; EIP-999 was declined in 2018), 4.57
  to 4.67. The rules dial is unchanged: Bitcoin and Ethereum mainnet both read 4, because miners or the maintainers
  of the dominant client can still block a change. Solana, Stellar, Canton and the generic designs do not move.

- **Decentralization: one method at two depths (eiplatform D52).** The dials now derive from the registered
  scorecard, and `scripts/sync-scorecard.sh` in the platform repository checks they agree. Single points of failure
  takes the weakest of client count, the largest client's share (a quarter, a third, a half, two thirds) and node
  spread on the HHI across providers, countries and legal jurisdictions (the EU as one), which moves Ethereum mainnet
  from 4 to 2 there: nodes by jurisdiction are highly concentrated, not unconcentrated as the note said. Who can stop
  it states its basis (attributed stake, a staking protocol counted by its independent operators) and shows the
  other bases. Open entry has a USD 100,000 line at a stated price and date, and the ETH price is now sourced. The
  Ethereum mainnet lens gains a `measures:` block, the figures the registered scorecard is generated from.
  Ethereum mainnet's weighted score moves from 4.67 to 4.48 (the single points of failure dial, 4 to 2).
- **Decentralization: four named ledgers to compare.** The "Compare a design" menu now reads Ethereum mainnet, then
  Bitcoin, Canton, Solana and Stellar in alphabetical order, then the two generic architectures. Each new lens
  (`data/decentralization/lenses/{bitcoin,canton,solana,stellar}.yaml`) carries a level, a hard-number reading and a
  dated, sourced note for all eleven properties, measured the same way as Ethereum mainnet (HHI on consensus weight,
  cost to the safety threshold and whether it is slashable, client share, years since genesis with every halt
  disclosed), checked 26 October 2026. Solana is read under Alpenglow (live on mainnet-beta since 21 October 2026),
  Canton as the Global Synchronizer's 13 Super Validator nodes, Stellar as its ten Tier 1 organizations, Bitcoin by
  mining-pool share. Lens help, footnote, README and CLAUDE.md updated.
- **Decentralization: two cell definitions refined (owner, 26 October 2026).** Cost of control: level 4 now also
  covers more than USD 10 billion of chain-specific proof-of-work hardware, which the attacker loses by the market
  rather than by the protocol (Budish); stake that is neither slashed nor chain-specific stays capped at 3. Neutral
  issuance: the founding share counts holdings an identifiable party can sell or vote; unattributed coins dormant for
  more than ten years are disclosed, not counted. Bitcoin moves from 4.00 to 4.14 at the default weights (cost 3 to 4,
  issuance 4 to 5); no other lens changes.
- **Decentralization: the stop dial no longer trusts the HHI alone (owner, 26 October 2026).** The index is
  count-insensitive, so a closed club of equal members scored as unconcentrated. Now the HHI bands apply only to an
  open consensus set; a set that admits its own members reads at most level 3; three or four parties able to halt
  settlement reads level 2 whatever the HHI; a party is whoever can switch validators off or sign for them (a
  staking pool counts by its node operators). Canton (three parties can halt) and Stellar (four of ten) move from
  4 to 2 on that dial; Ethereum mainnet, Bitcoin and Solana are open sets and do not move.
- **Decentralization: a vote that has never gone against the implementer is a ratification (owner, 26 October
  2026).** The rules dial's "a closed body votes" cell now requires the body to have amended, delayed or rejected
  something the implementer proposed, or more than one party writing proposals and code; otherwise "a vendor
  decides, operators follow". Canton (Digital Asset writes the code and the constitutional CIPs; never overruled in
  about 130 proposals) and Stellar (SDF writes stellar-core and the CAPs; never overruled in 29 protocols) move from
  3 to 2 on that dial.
- **Decentralization: the developer dial is absolute, not a race (owner, 26 October 2026).** "The largest open
  base" is replaced by thousands of monthly active developers with several independent production implementations
  and no single funder paying most core maintainers; level 3 is hundreds to about a thousand developers, or one
  organization writing most of the core, or one code base gated by a handful of maintainers. Bitcoin reads 4 on that dial
  (thousands active on the broad measure, one production implementation, five maintainers); Ethereum mainnet keeps
  5 on the absolute test with eleven client teams.
- **Networks: Ethereum blue.** `eth: true` pills are Ethereum blue `#627eea` instead of ink, the ETH mark disc is
  Ethereum gray `#3c3c3d`, and the legend shows the mark on a blue pill (`pill:` on the legend's `mark` item). The
  middle permissionless band is labeled "Dynamically Available", the paper's term, instead of "Dynamically
  Permissionless" (paths updated). The Solana badge now describes Alpenglow: finality at 80% of stake in one round or
  60% in two, a halt when more than 40% is offline (or 20% beside 20% adversarial), replacing the two-thirds rule of
  Tower BFT; the quasi-permissionless band note says the same.

- **Quantum: overview and four sub-pages.** The stub becomes a short overview (the risk reaches everything on the
  internet; Ethereum is among the first large systems with a dated plan) with cards to four sub-pages: the two
  algorithms, where it bites a ledger, the Ethereum roadmap, and where your digital asset team fits (inventory,
  exposure clocks, procurement and vendor management, crypto-agility, the NCSC, EU and NIST timelines). Sub-pages are
  a few paragraphs each with links to the primary material; sources are collapsed. Engine: nested static pages in
  cards and navigation, `more` links on stub sections, two more pictograms.
- **Quantum page stub** (`/quantum/`) with drafted sections (Shor and Grover, where they bite a ledger, the Ethereum
  roadmap now and next, what it means for an institution), sourced to ethereum.org, NIST and the EIPs. **Landing
  page**: every tile gets a pictogram and a one-line tagline, and the link reads “Open”. Static stubs may now carry
  `sections:`.
- **Scenarios: first scenario and a filterable index.** `/scenarios/` lists ten market activities with role and
  what-moves filters (not ranked); `/scenarios/dvp-deposit-token-tmmf/` is the first written scenario: delivery versus
  payment between a bank deposit token and a tokenized money market fund, with the actors, an eight-step swimlane
  diagram (off-ledger, on-ledger and one atomic transaction), the taxonomy tokens involved (deposit token, fund,
  stablecoin and wholesale CBDC as alternative cash legs), the EVM standards (ERC-20, ERC-3643, ERC-7540, ERC-2612,
  EIP-3009, EIP-712, ERC-4337, ERC-7573) with status and role, why a shared ledger, variants and open questions.
  The index places each scenario on a small Venn (cash, asset, credit) as a linked pill and groups the tiles below
  by what moves, each with a pictogram; the DvP scenario gains a permissioned-pool variant (Uniswap v4 hooks) and
  says the standards are to consider, not a prescription. Engine: `kind: index` and `kind: scenario` page types
  (`src/scenario.html`), a pictogram family, nested page paths.
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
