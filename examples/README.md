# Examples

> The `demo/` pack here is **synthetic** — fabricated rules and citations purely
> to demonstrate the CLI. It is not a real rule pack.

## Run the CLI against a CSV

```sh
npm run build
node packages/cli/dist/index.js check examples/sample.csv --pack demo --pack-dir examples --format table
```

Try `--format json` or `--format junit`, and `--fail-on high` to make CI fail on
high/critical findings.

## Files here

- `demo/` — a synthetic pack (`manifest.json` + `rules/demo.json`).
- `sample.csv` — a few product rows, some violating, some compliant.
- `node-usage.md` — using `@claimkind/core` as a library.
- `ci-github-actions.yml` — lint-on-PR with JUnit output.
- `shopify-webhook.md` — lint on product publish.

Linting, not legal advice.
