import { describe, it, expect } from "vitest";
import { lint } from "../src/lint";
import type { LlmAdapter } from "../src/types";
import { fixturePack } from "./fixtures/pack";

/** Mock adapter: returns a span for `phrase` wherever it appears in the text. */
const mockAdapter = (phrase: string): LlmAdapter => ({
  async evaluateSemantic(queries) {
    return queries.map((q) => {
      const idx = q.text.indexOf(phrase);
      return idx >= 0 ? [{ start: idx, end: idx + phrase.length, confidence: 0.9 }] : [];
    });
  },
});

describe("lint — deterministic path", () => {
  it("flags a vague green claim with its citation", async () => {
    const r = await lint("Our eco-friendly water bottle", { packs: [fixturePack] });
    expect(r.violations).toHaveLength(1);
    const v = r.violations[0]!;
    expect(v.ruleId).toBe("TS-GW-001");
    expect(v.severity).toBe("high");
    expect(v.confidence).toBe("deterministic");
    expect(v.enforcement[0]!.regulator).toBe("ACCC");
  });

  it("respects exceptions", async () => {
    const r = await lint("This packaging is not eco-friendly", { packs: [fixturePack] });
    expect(r.violations).toHaveLength(0);
  });

  it("emits audit anchors", async () => {
    const r = await lint("We are carbon neutral", { packs: [fixturePack] });
    expect(r.packVersions).toEqual({ fixture: "2026.1" });
    expect(r.textHash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.stats.rulesEvaluated).toBe(4);
  });

  it("filters by category", async () => {
    const r = await lint("Our eco-friendly bottle", {
      packs: [fixturePack],
      category: "therapeutic",
    });
    expect(r.violations).toHaveLength(0);
    expect(r.stats.rulesEvaluated).toBe(0);
  });
});

describe("lint — semantic path", () => {
  it("does nothing without an adapter", async () => {
    const r = await lint("This range is kind to the earth.", { packs: [fixturePack] });
    expect(r.violations).toHaveLength(0);
  });

  it("caps uncorroborated semantic hits at advisory", async () => {
    const r = await lint("This range is kind to the earth.", {
      packs: [fixturePack],
      llmAdapter: mockAdapter("kind to the earth"),
    });
    const v = r.violations.find((v) => v.ruleId === "TS-GW-004");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("advisory");
    expect(v!.confidence).toBe("semantic-advisory");
  });

  it("elevates a semantic hit corroborated by a deterministic trigger", async () => {
    const r = await lint("Our planet-safe range is kind to the earth.", {
      packs: [fixturePack],
      llmAdapter: mockAdapter("kind to the earth"),
    });
    const semantic = r.violations.find(
      (v) => v.ruleId === "TS-GW-004" && v.span.text === "kind to the earth",
    );
    expect(semantic).toBeDefined();
    expect(semantic!.severity).toBe("high");
    expect(semantic!.confidence).toBe("deterministic");
  });
});
