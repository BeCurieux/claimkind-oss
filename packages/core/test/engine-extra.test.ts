import { describe, it, expect } from "vitest";
import { lint } from "../src/lint";
import type { ClaimRule, LoadedPack } from "../src/types";

const baseRule = (over: Partial<ClaimRule>): ClaimRule => ({
  id: "X-1",
  pack: "x",
  jurisdiction: "AU",
  category: "environmental",
  severity: "high",
  title: "t",
  rationale: "r",
  triggers: [{ kind: "literal", value: "greenwash" }],
  enforcement: [{ regulator: "ACCC", action: "a", date: "2020-01-01", url: "https://example.test" }],
  remediation: "m",
  examples: { violating: ["greenwash"], compliant: ["ok"] },
  ...over,
});

const packOf = (name: string, version: string, rules: ClaimRule[]): LoadedPack => ({
  manifest: { name, version, jurisdiction: "AU", ruleCount: rules.length, changelog: "n/a", licence: "MIT" },
  rules,
});

describe("engine — extra behaviour", () => {
  it("skips draft rules entirely by default", async () => {
    const pack = packOf("x", "2026.1", [baseRule({ draft: true })]);
    const r = await lint("this is greenwash", { packs: [pack] });
    expect(r.violations).toHaveLength(0);
    expect(r.stats.rulesEvaluated).toBe(0);
  });

  it("evaluates draft rules when includeDrafts is set (preview mode)", async () => {
    const pack = packOf("x", "2026.1", [baseRule({ draft: true })]);
    const r = await lint("this is greenwash", { packs: [pack], includeDrafts: true });
    expect(r.violations.map((v) => v.ruleId)).toEqual(["X-1"]);
    expect(r.stats.rulesEvaluated).toBe(1);
  });

  it("merges pack versions across multiple packs", async () => {
    const r = await lint("greenwash", {
      packs: [packOf("a", "2026.1", [baseRule({ id: "A-1" })]), packOf("b", "2026.2", [baseRule({ id: "B-1" })])],
    });
    expect(r.packVersions).toEqual({ a: "2026.1", b: "2026.2" });
    expect(r.violations.map((v) => v.ruleId).sort()).toEqual(["A-1", "B-1"]);
  });

  it("matches literal phrases containing regex-special characters", async () => {
    const pack = packOf("x", "2026.1", [
      baseRule({ id: "PCT", triggers: [{ kind: "literal", value: "100%" }] }),
    ]);
    const r = await lint("now 100% better", { packs: [pack] });
    expect(r.violations).toHaveLength(1);
    expect(r.violations[0]!.span.text).toBe("100%");
  });

  it("is stable: identical input yields identical output hash and spans", async () => {
    const pack = packOf("x", "2026.1", [baseRule({})]);
    const a = await lint("a greenwash claim", { packs: [pack] });
    const b = await lint("a greenwash claim", { packs: [pack] });
    expect(a.textHash).toBe(b.textHash);
    expect(a.violations).toEqual(b.violations);
  });
});
