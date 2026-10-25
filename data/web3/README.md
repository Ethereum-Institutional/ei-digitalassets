# Editing the Web3 map

Live page: https://ethereum-institutional.github.io/ei-digitalassets/web3/

```
rings.yaml        content: one entry per generation, inner to outer (label, capability, definition, sources)
themes.yaml       content: one entry per theme wedge, with a cell (name, definition, sources) per ring
layout.yaml       geometry only: canvas, hub radius, ring radii, text sizes
site.yaml         page title, intro, the "Why Web3 instead of Web 3.0?" note, legend and page settings
```

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the page and attach a rendered preview to the pull request.

**Change a cell** (one theme in one generation) → edit its `name`, `desc` and `sources` under `cells:` in
`themes.yaml`. `sub` puts a smaller line of examples under a bold name (the Identity wedge does this); `lines:` and
`sub_lines:` force line breaks when the automatic wrapping is not right. Every cell is one illustrative example,
not a list.

**Add a theme** → add an entry to `themes.yaml` with a `label`, a `desc` and a cell for every ring. Wedges are drawn
clockwise in file order, after the label wedge at the top; the build fails if a ring has no cell.

**Change a generation** → edit `rings.yaml`; `sub` is the capability shown under the name (Read; Read / Write;
Read / Write / Own). Sizes and radii are in `layout.yaml`.

On the page, clicking a theme in the hub highlights its wedge across the rings; clicking a generation's name
highlights its ring. Write "Web3", never "Web 3.0", except when explaining the naming.
