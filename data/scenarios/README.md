# Editing the Scenarios

Live index: https://ethereum-institutional.github.io/ei-digitalassets/scenarios/

```
site.yaml                 the index: `filters` (roles, moves) and `scenarios` (title, text, tags; `path` once a page exists)
<slug>/site.yaml          one scenario's page settings (kind: scenario, title, intro, notice)
<slug>/scenario.yaml      the scenario: actors, steps, tokens, standards, sections, sources
```

**Write a scenario** → copy `dvp-deposit-token-tmmf/`, give it a slug, add the folder to `PAGES` in
`scripts/build.mjs` (`out: scenarios/<slug>`), and set `path` on its entry in the index. In `scenario.yaml`:
`actors` are the columns of the diagram (give a `kind` of `ledger`, `contract` or `observer` to anything that is not an
institution); `steps` are the rows, in order, each `from` one actor `to` another with `kind: offchain` (dashed),
`onchain` (solid) or `atomic` (a band across the `lanes` it names, for a single transaction); `tokens` name the
taxonomy circle (`circle:` id from `data/taxonomy/circles.yaml`) and the live examples; `standards` list each EIP with
its status, its role in the scenario and its eips.ethereum.org URL. Quote any value that contains ": " or a comma
inside a `{ }` mapping.

Scenarios are not ranked. The index is filtered by the reader's role and by what moves (cash, asset, credit), so give
every scenario both tags honestly. Write in direct address where it helps ("your deployment").
