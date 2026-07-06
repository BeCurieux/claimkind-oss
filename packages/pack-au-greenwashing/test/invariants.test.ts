import { describe, it, expect } from "vitest";
import { validatePack } from "@claimkind/core";
import pack, { manifest, rules } from "../src/index.js";

describe("au-greenwashing pack invariants (CLAUDE.md §2)", () => {
  it("passes every packaging + behavioural invariant", async () => {
    const issues = await validatePack(pack);
    // Surface any failures with detail if this ever regresses.
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });

  it("has 15 rules and a matching calver manifest", () => {
    expect(rules.length).toBe(15);
    expect(manifest.ruleCount).toBe(15);
    expect(manifest.version).toMatch(/^\d{4}\.\d+$/);
    expect(manifest.licence).toBe("MIT");
  });

  it("gives every rule at least one enforcement citation with a real URL", () => {
    for (const r of rules) {
      expect(r.enforcement.length).toBeGreaterThanOrEqual(1);
      for (const c of r.enforcement) {
        expect(c.url).toMatch(/^https:\/\/www\.accc\.gov\.au\//);
        expect(c.regulator).toBe("ACCC");
      }
    }
  });

  it("marks all machine-drafted rules draft:true (pending human review)", () => {
    expect(rules.every((r) => r.draft === true)).toBe(true);
  });

  it("uses only the four defined severities", () => {
    const allowed = new Set(["critical", "high", "medium", "advisory"]);
    for (const r of rules) expect(allowed.has(r.severity)).toBe(true);
  });
});
