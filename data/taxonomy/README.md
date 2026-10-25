# Editing the Digital Asset Taxonomy

Live page: https://ethereum-institutional.github.io/ei-digitalassets/taxonomy/

```
circles.yaml      content: every circle's label, colour family and definition (desc), with sources
layout.yaml       geometry only: positions, sizes, bridges and annotations (rarely edited)
tokens.yaml       the top-10 token badges and where they sit
site.yaml         page title, intro, footnote, legend and page settings
lenses/*.yaml     one file per regulatory lens
```

You do not need to run anything locally. Edit a file on GitHub, open a pull request, and the CI check will
validate your change, build the page and attach a rendered preview to the pull request.

**Change a definition or a lens note** → edit the `desc` in `circles.yaml`, or the `notes:` entry in the relevant
`lenses/<id>.yaml`.

**Change how a regime treats a circle** → edit `status:` in the lens file: `in`, `part` (depends, exempt or
restricted) or `out`. Lenses with `groups:` (Basel, IMF, BIS, China, Japan, Switzerland, ADGM, DIFC, FATF, Hong Kong)
list the circles each group covers instead.

**Add a lens** → copy an existing file in `lenses/`, give it a new `id`, and set `group` to `standard-setter` or
`jurisdiction`. Jurisdiction `menu` labels start with the two-letter country code so the dropdown sorts
alphabetically. The build fails if a lens references a circle id that does not exist.

**Add a circle** → add it to `circles.yaml` *and* give it geometry in `layout.yaml`. If it is a grouping circle,
list it under `containers` and its contents under `children`. Mark it `lens_only: true` to hide it on the default
map and show it only under lenses that mention it (Licensed or Recognised Stablecoins and Licensed or Recognised
Payment Tokens work this way).

**Show a token as licensed under a lens** → in `tokens.yaml`, add the lens id to the token's `licensed_under` list.
Badges never move: under that lens the licensed-or-recognised circle it shows stretches to take the badge in. A lens
group can also take badges in with `tokens: [USDT, USDC]`, and `bridges:` in `layout.yaml` joins a group's separate
circles into one continuous outline (see the Switzerland lens).

Small drawn notes (leader-line captions, dotted connectors) are `annotations:` in `layout.yaml`. The "Under
development" banner is `notice:` in `site.yaml`; remove it once counsel has reviewed.

Every regulatory claim should carry a source: add the URL and the date you checked it to the lens file's `sources:`
list and update `last_reviewed`. Regulatory facts drift; re-verify before changing them.
