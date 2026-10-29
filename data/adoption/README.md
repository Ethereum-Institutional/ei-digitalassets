# Editing the Decentralization page

Live page: https://ethereum-institutional.github.io/ei-digitalassets/adoption/

```
rings.yaml        content: the five levels, 1 (one party) to 5 (open network)
themes.yaml       content: the ten properties, each with a cell per level (what that level means) and sources for thresholds
lenses/*.yaml     one file per design placed on the dials: `cells` maps each property to its level, `readings` the
                  short line under each dial, `notes` the reading with its date and source; `order` sets the menu
                  (Ethereum mainnet, then Bitcoin, Canton, Solana and Stellar alphabetically, then the two generic
                  architectures)
site.yaml         page title, intro, the "Why measure it this way?" note, lens labels, `default_lens` and the "What an open
                  ledger attracts" figures (`stats`)
```

**Change a reading** → edit that ledger's lens (`lenses/ethereum-mainnet.yaml`, `bitcoin.yaml`, `canton.yaml`,
`solana.yaml`, `stellar.yaml`): move the property's level in `cells` only when the measured value crosses a line defined
in `themes.yaml`, and update the `readings` line and the `notes` entry with the new figure, its date and its source.
Every named ledger is measured the same way (HHI on consensus weight, cost to the safety threshold and whether it is
slashable, client share, years since genesis with every halt and intervention disclosed); say inside the note what the
ledger does well on that property. **Change a level definition** → edit the cell in `themes.yaml`; thresholds should cite
the standard they come from. **Add a design** → add a lens file with a cell, a reading and a note for every property and an `order`; a named
ledger needs a dated source for every reading, and the generic architectures stay generic (no product names). **Update the figures** under "What an open ledger attracts" in `site.yaml` with the date
checked. The legitimate concerns about Ethereum mainnet live in the lens notes of the dials they belong to
(inclusion, resilience, who can stop it, neutral issuance); keep them current, because they are what make the strong
dials credible.
