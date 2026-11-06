# Editing the Identity map

Live page: https://ethereum-institutional.github.io/ei-digitalassets/identity/ (draft)

```
circles.yaml   the three circles (Verified identity, Proof of control, Permission) and the outer frame, with definitions
layout.yaml    geometry only (canvas, circles, the note in the empty control-and-permission region)
badges.yaml    one badge per mechanism: the circle it sits in, x and y inside the right overlap, whether it lives on an
               Ethereum chain (`eth`), desc, sources, and facts (one entry per facet)
site.yaml      intro, legend, the facets (filters) and the issuer preset for the "Focus on" sidebar, and the sections
held.yaml      sections held off the public page (the revenue proposal); not read by the build
               under the map
```

**The three questions.** A mechanism is placed by what it establishes, not by what it is called: who the party is
(verified identity: KYC, KYB, KYA), whether the key acting is theirs (proof of control: signatures, smart accounts,
device keys) or what the address may do (permission: blocklists, allowlists, transfer-time checks). A mechanism that
answers two questions sits in the overlap; the center holds the ones that answer all three (a permissioned token
standard, a zero-knowledge credential verified on chain, an attestation a contract gates on, know-your-agent).

**Place a mechanism** by the question it answers by itself, not by what it can be combined with: a sovereign eID
answers "who" to the relying party and nothing to the ledger, so it sits in verified identity alone; a signature
standard answers "which key" and nothing about the person. **Write its description** in this order: what it is,
what it establishes, where the trust comes from, what the public ledger learns, and where it stops; every fact
gets a source with the date checked, and vendor claims say "vendor-stated".

**Colors.** `eth: true` (Ethereum blue) marks a mechanism that lives on an Ethereum chain or is an Ethereum standard;
gray marks one that works off the ledger and feeds it. There are no testnet pills on this map; `status` is set to
`mainnet` on the blue ones only to keep the fact sheet consistent.

**Give it facts** for every facet in `site.yaml`: `{ in: [values], part: [values], note: '...' }`. `in` means it
has this; `part` partly; `na` does not apply; `unknown` only after a real search. The `reveals` facet is neutral
(a privacy cost to one reader, an audit trail to another), so its marks are plain boxes.

**Regulatory statements** on this page name the question and the primary text; the regulatory treatment of each
asset belongs to the Taxonomy's lenses. Dated facts drift: the FinCEN and OFAC proposal (April 2026), the HKMA
holder-verification default (August 2025) and the EUDI wallet deadlines (December 2026 and 2027) are the ones to
re-check first.

Run `npm run build` and look at the page with the issuer preset and a few facets before opening a pull request.

**The box under the ledger** (`schemes`, a rect in `layout.yaml`) holds the government and sector digital identity
schemes, which do not run on a shared ledger; a scheme badge sits there with `circle: schemes`, and the way it reaches
the ledger (allowlist, attestation, credential proof) is named in its description.
