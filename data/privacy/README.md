# Editing the Privacy map

Live page: https://ethereum-institutional.github.io/ei-digitalassets/privacy/

```
circles.yaml   the three circles (Confidential tokens, Anonymity, Private execution), the outer frame and the
               "Before the block" box, with definitions
layout.yaml    geometry only (canvas, circles, the note in the empty logic-only region)
badges.yaml    one badge per design: the circle it sits in, x and y inside the right overlap, status (mainnet or
               testnet), since (first live date), desc, sources, and facts (one entry per facet)
held.yaml      designs held for future review (not EVM and not Ethereum-settled, archived, or not available today);
               not read by the build
site.yaml      intro, legend, the facets (filters, and `filter: false` information-only facts) and the wish-list
               preset for the "Focus on" sidebar, and the sections under the map
```

**Scope** (owner, 26 October 2026, to review later): designs that run the EVM or settle on Ethereum mainnet. Live
designs are solid pills; designs only on a public testnet (`status: testnet`) are hollow.

**Place a design** by what it hides from the public by default, not by what it can be configured to hide: the
region decides `circle` and the x and y keep the pill inside the overlap, clear of every line. **Write its
description** in this order: what is hidden, from whom else, what you trust, what survives for the issuer, where it
runs, track record, and what it does well; every fact gets a source with the date checked. **Legal history** is
dates and holdings only.

**Before the block** designs carry no `facts`: they are context on the map, not confidential tokens, and stay out
of the sidebar and its counts.

**Give it facts** for every facet in `site.yaml` except `status` and `since` (the build fills those):
`{ in: [values], part: [values], note: '...', sources: [...] }`. `in` means it has this; `part` means partly or a
supporting part of the design; `na` does not apply; `unknown` only after a real search. Every figure (value held,
gas, anonymity set) carries its date in the note and a source. Cross-check against the PSE benchmark
(private-transfers.pse.dev; each facet's `pse:` names the matching property) and the project's own sources. Facts
only: the institutional wish list is a reader's preset, not a score. The whole page is public.

Run `npm run build` and look at the page with the wish list and a few facets before opening a pull request.
