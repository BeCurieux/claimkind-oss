# Using @claimkind/core as a library

```ts
import { lint, type LoadedPack } from "@claimkind/core";

// Load a pack however you like (bundled JSON, fetch, import).
const pack: LoadedPack = /* { manifest, rules } */;

const result = await lint("Our eco-friendly, carbon neutral bottle", {
  packs: [pack],
  context: { channel: "pdp" },
});

for (const v of result.violations) {
  console.log(`${v.severity} ${v.ruleId}: ${v.title}`);
  console.log(`  fix: ${v.remediation}`);
  console.log(`  cite: ${v.enforcement[0]?.url}`);
}

// Audit anchors for a compliance record:
console.log(result.textHash, result.packVersions);
```

## Deterministic vs semantic

Without an `llmAdapter`, `lint()` is fully deterministic — identical input yields
identical output. Supplying an `llmAdapter` enables `semantic` triggers, whose
findings are capped at `advisory` severity unless a deterministic trigger in the
same rule corroborates them. Model output never creates a verdict on its own.

Linting, not legal advice.
