import { describe, it, expect } from "vitest";
import { validatePack } from "../src/pack";
import type { LoadedPack } from "../src/types";
import { fixturePack } from "./fixtures/pack";

describe("pack invariants", () => {
  it("the fixture pack passes every invariant (static + behavioural)", async () => {
    const issues = await validatePack(fixturePack);
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });

  it("flags a rule with no enforcement citation", async () => {
    const broken: LoadedPack = {
      manifest: { ...fixturePack.manifest, ruleCount: 1 },
      rules: [{ ...fixturePack.rules[0]!, enforcement: [] }],
    };
    const issues = await validatePack(broken);
    expect(issues.some((i) => i.kind === "citation")).toBe(true);
  });

  it("flags a manifest ruleCount mismatch", async () => {
    const broken: LoadedPack = {
      ...fixturePack,
      manifest: { ...fixturePack.manifest, ruleCount: 99 },
    };
    const issues = await validatePack(broken);
    expect(issues.some((i) => i.kind === "manifest")).toBe(true);
  });

  it("flags a malformed rule id", async () => {
    const broken: LoadedPack = {
      manifest: { ...fixturePack.manifest, ruleCount: 1 },
      rules: [{ ...fixturePack.rules[0]!, id: "bad_id" }],
    };
    const issues = await validatePack(broken);
    expect(issues.some((i) => i.kind === "id")).toBe(true);
  });
});
