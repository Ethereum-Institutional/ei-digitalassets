# Due diligence questions, one folder per system

Each folder here is a system or service an institution may procure for its digital asset architecture: a custody
platform, a screening tool, a node operator, an audit firm. The build turns every `<id>/system.yaml` into a page at
`/architecture/<id>/`, lists it on the Architecture page, and links it from the components it covers on the blueprint
(they carry a DDQ tag). No build changes are needed to add a folder.

## Propose a question

Open the system's `system.yaml` on GitHub, choose **Edit**, and add an entry under the right section:

```yaml
  - q: 'The question, as you would send it to the vendor?'
    why: What a good answer shows, or why the question matters. Optional.
    must: true   # optional: the answer can rule a provider out
```

Then open a pull request. If you are not sure where it belongs, open an issue instead.

## Add a system

Create `systems/<id>/system.yaml` (lowercase, hyphens) with:

| Key | Required | What it is |
| --- | --- | --- |
| `title` | yes | Page title |
| `short` | yes | Short label |
| `group` | yes | Heading it is listed under: one of `ddq.groups` in `../site.yaml` |
| `tagline` | yes | One line, under about 80 characters, shown in the list on the Architecture page |
| `order` | yes | Position in the list (numbers need not be consecutive) |
| `summary` | yes | One paragraph: what the system is and what choosing it involves |
| `components` | yes | Blueprint component ids this system covers (see `../architecture.yaml`) |
| `last_reviewed` | yes | `YYYY-MM-DD` |
| `models` | no | Ways to buy or run it: `name`, `text`, optional `examples` and `link` (another system id) |
| `models_title` | no | Heading for the models, if not "Ways to buy or run it" |
| `guidance` | no | Short decision notes before the questions: `title`, `text` |
| `curriculum` | no | Topics to cover, for training-style pages: `title`, `text` |
| `features` | no | A `timeline` or `matrix` drawn from a component's lists (see `screening`) |
| `sections` | yes | `title` and `questions` (each `q`, optional `why` and `must`) |
| `sources` | no | `title` and `url` for each reference |

House style applies: US spelling, no em-dashes, quote any value that contains `: `. Vendor names are examples for
orientation, never endorsements; add one only with a public source, and agree additions with Ethereum Institutional.
