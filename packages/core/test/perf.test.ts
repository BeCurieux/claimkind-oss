import { describe, it, expect } from "vitest";
import { lint } from "../src/lint";
import type { ClaimRule, LoadedPack } from "../src/types";

/**
 * Performance budget from CLAUDE-CODE-PIVOT.md §3:
 * 10K-word input, 400 rules, <200ms deterministic path on commodity hardware.
 *
 * Synthetic rules/text only — no real rule content. The hard assertion is a
 * loose ceiling (catches catastrophic regressions without CI flakiness); the
 * actual measurement is logged so the 200ms target is visible.
 */
function makeRules(n: number): ClaimRule[] {
  const rules: ClaimRule[] = [];
  for (let i = 0; i < n; i++) {
    rules.push({
      id: `PERF-${i}`,
      pack: "perf",
      jurisdiction: "AU",
      category: "environmental",
      severity: "medium",
      title: `rule ${i}`,
      rationale: "synthetic",
      triggers: [{ kind: "literal", value: `trigmatch${i % 50}` }],
      enforcement: [
        { regulator: "ACCC", action: "synthetic", date: "2020-01-01", url: "https://example.test" },
      ],
      remediation: "synthetic",
      examples: { violating: ["x"], compliant: ["y"] },
    });
  }
  return rules;
}

function makeText(words: number): string {
  const out: string[] = [];
  for (let i = 0; i < words; i++) {
    out.push(i % 500 === 0 ? `trigmatch${i % 50}` : "greenword");
  }
  return out.join(" ");
}

describe("performance budget (§3)", () => {
  it("lints 10K words against 400 rules within a safe ceiling", async () => {
    const rules = makeRules(400);
    const pack: LoadedPack = {
      manifest: { name: "perf", version: "2026.1", jurisdiction: "AU", ruleCount: 400, changelog: "n/a", licence: "MIT" },
      rules,
    };
    const text = makeText(10_000);

    const result = await lint(text, { packs: [pack] });

    expect(result.stats.rulesEvaluated).toBe(400);
    // eslint-disable-next-line no-console
    console.log(
      `[perf] 10K words / 400 rules: ${result.stats.durationMs}ms ` +
        `(target <200ms) — ${result.violations.length} violations`,
    );
    // Loose ceiling to avoid CI flakiness; the log surfaces the real number.
    expect(result.stats.durationMs).toBeLessThan(2000);
  });
});
