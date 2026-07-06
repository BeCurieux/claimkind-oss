# Getting started

```sh
npm i @claimkind/cli @claimkind/pack-au-greenwashing
claimkind check ./products.csv --pack au-greenwashing --format table
```

Or as a library — see [../examples/node-usage.md](../examples/node-usage.md).

## CLI

```
claimkind check <file|glob...> --pack <name> [--format table|json|junit] [--fail-on <sev>] [--pack-dir <dir>]
```

- CSV inputs are linted cell-by-cell (violations report `rN:cN`).
- Plain-text inputs are linted whole.
- `--fail-on advisory|medium|high|critical` exits non-zero at/above that severity — drop it into CI.

Linting, not legal advice.
