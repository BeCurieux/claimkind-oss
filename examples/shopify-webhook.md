# Lint on Shopify product publish (webhook sketch)

Subscribe to `products/update`, lint the product's claim-bearing fields, and
record the audit anchors. Deterministic path — no model required.

```ts
import { lint, type LoadedPack } from "@claimkind/core";

export async function handleProductWebhook(payload: any, packs: LoadedPack[]) {
  const text = [payload.title, payload.body_html, ...(payload.tags ?? [])]
    .filter(Boolean)
    .join("\n");

  const result = await lint(text, { packs, context: { channel: "pdp" } });

  // Persist for the audit trail: what was checked, against which pack versions.
  await saveAudit({
    productId: payload.id,
    textHash: result.textHash,
    packVersions: result.packVersions,
    violations: result.violations,
  });

  return result.violations.filter((v) => v.severity === "critical");
}

declare function saveAudit(record: unknown): Promise<void>;
```

Linting, not legal advice.
