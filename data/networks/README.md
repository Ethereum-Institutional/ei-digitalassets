# Editing the Digital Asset Networks map

Live page: https://ethereum-institutional.github.io/ei-digitalassets/networks/

```
circles.yaml      content: the network, consensus and expandable circles, with definitions and sources
layout.yaml       geometry only, including each expandable circle's `collapsed:` geometry
networks.yaml     the network badges (names, not tickers), their participants, and where they sit
site.yaml         page title, intro, legend and page settings
lenses/*.yaml     one file per architecture lens (Layer 1, side-chain, Layer 2 rollup)
```

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the page and attach a rendered preview to the pull request.

**Move or describe a network** → edit its entry in `networks.yaml`: `circle` is where it sits (`full`, `dyn`,
`quasi`, `pub`, `cons`, `sov`, `priv`, `canton`, or one of the network circles such as `besu`, `swift`, `partior`),
`eth: true` draws it in ink as part of the Ethereum ecosystem (runs an Ethereum client, the EVM, or settles on
Ethereum mainnet), and `sources:` lists the URL and the date checked for each claim in its `desc`. Badge names are
network names, not tickers. Write "Ethereum mainnet" for the chain, never "on Ethereum".

**Participants** of a network circle are `small: true` badges with `kind: participant`, each with its own source,
listed alphabetically. Public networks list only regulated institutions with live deployments (pilots named as
such); non-Ethereum chains such as Solana list no participants.

**Expandable circles** → a circle with `expand: collapsed` (or `expanded`) in `circles.yaml` and a `collapsed:`
geometry in `layout.yaml` opens on click to show the participant badges placed inside it. Network circles with
`pill: true` look like a badge while collapsed; this is how Ethereum mainnet, Base, Canton and the other public
networks list the institutions live on them, and how Besu, Swift, Partior and Project Agorá list their members.

**Collapsible regions** → `collapsible: true` on a region circle adds a control that hides it; the two consensus
squares (`band: true`) collapse to a slim band above the map, one at a time, and `zoom: [x0, x1]` stretches the
remaining strip across the full width without changing text size.

**Change which networks a layer covers** → edit `networks:` in `lenses/<id>.yaml` (`in` or `part`) and the matching
`notes:`. These lenses carry `scope: networks`: they highlight badges and leave the circles alone.

Add a network or participant only with primary-source documentation, and agree additions or removals with
Ethereum Institutional first. Network facts (validator counts, sequencer status, live deployments) drift quickly;
`as_of` in `networks.yaml` records when they were last checked.
