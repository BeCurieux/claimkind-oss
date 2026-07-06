# ClaimKind — open core

**Deterministic, citation-backed compliance linting for product claims.**
Rules decide; LLMs only assist.

AI now generates product claims at industrial scale. Every generated claim needs
a compliance check *at generation time* — and a raw LLM can't be the checker: a
hallucinated compliance verdict is a liability. ClaimKind is the deterministic,
enforcement-grounded ruleset that AI content volume makes newly necessary.

```sh
npm i @claimkind/cli @claimkind/pack-au-greenwashing
claimkind check ./products.csv --pack au-greenwashing --fail-on high
```

## Packages

| Package | What |
|---|---|
| [`@claimkind/core`](packages/core) | The engine: rule schema, matchers, lint pipeline, result types. Zero runtime deps. Runs in Node, edge, CI, browser. |
| [`@claimkind/cli`](packages/cli) | `claimkind check` — lint files, output `table`/`json`/`junit`, `--fail-on`. |
| [`@claimkind/pack-au-greenwashing`](packages/pack-au-greenwashing) | The free AU greenwashing pack (ACCC/AANA) — 15 rules, each cited. *(all `draft` pending human review; see [CITATIONS.md](CITATIONS.md))* |

Proprietary jurisdiction packs (AU/TGA, US/FTC, …) and the hosted API live in the
private ClaimKind repo. The engine and the free pack are MIT and stay that way.

## How it works

- **Every rule cites enforcement.** Regulator, action, date, link. Not AI
  guesses — rules traceable to real enforcement actions.
- **Deterministic by default.** No adapter ⇒ identical input yields identical
  output. Optional `semantic` triggers require an explicit LLM adapter and are
  capped at `advisory` unless a deterministic trigger corroborates them.
- **Audit anchors.** Every result carries a `textHash` and the `packVersions`
  used — the record that makes a check defensible in a brand's compliance file.

See the [rule schema](docs/rule-schema.md) and [examples](examples/).

## Develop

```sh
npm install
npm test          # invariant + engine suites
npm run build     # emit dist for every package
```

## Legal

> **ClaimKind performs deterministic linting against citation-backed rules. It is
> not legal advice.** Findings, citations, and remediation guidance are provided
> to inform review; compliance decisions remain with the brand and its counsel.
> ClaimKind points at the regulator's own actions — it does not play one.

Engine and free pack: MIT (see [LICENSE](LICENSE)).
