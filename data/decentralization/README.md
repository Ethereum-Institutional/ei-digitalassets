# Editing the Decentralization page

Live page: https://ethereum-institutional.github.io/ei-digitalassets/decentralization/

```
rings.yaml        content: the five levels, 1 (one party) to 5 (open network)
themes.yaml       content: the ten properties, each with a cell per level (what that level means) and sources for thresholds
lenses/*.yaml     one file per design placed on the dials: `cells` maps each property to its level, `notes` gives the
                  reading and its source for Ethereum mainnet; the two architectures are generic
site.yaml         page title, intro, the "Why measure it this way?" note, lens labels, `default_lens` and the "What an open
                  ledger attracts" figures (`stats`)
```

**Change a reading** → edit the Ethereum mainnet lens (`lenses/ethereum-mainnet.yaml`): move the property's level in
`cells` only when the measured value crosses a line defined in `themes.yaml`, and update the `notes` entry with the new
figure, its date and its source. **Change a level definition** → edit the cell in `themes.yaml`; thresholds should cite
the standard they come from. **Add a design** → add a lens file with a cell for every property; architectures stay
generic (no product names). **Update the figures** under "What an open ledger attracts" in `site.yaml` with the date
checked. The legitimate concerns about Ethereum mainnet live in the lens notes of the dials they belong to
(inclusion, resilience, who can stop it, neutral issuance); keep them current, because they are what make the strong
dials credible.
