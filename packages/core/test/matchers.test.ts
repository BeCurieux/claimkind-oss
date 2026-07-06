import { describe, it, expect } from "vitest";
import { findMatches } from "../src/matchers";
import type { Trigger } from "../src/types";

const lit = (value: string): Trigger => ({ kind: "literal", value });
const rx = (value: string): Trigger => ({ kind: "regex", value });
const prox = (value: string): Trigger => ({ kind: "proximity", value });

describe("literal matcher", () => {
  it("matches on word boundaries only", () => {
    expect(findMatches("ecosystem services", lit("eco"))).toHaveLength(0);
    expect(findMatches("eco matters here", lit("eco"))).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    const spans = findMatches("Our ECO-Friendly bottle", lit("eco-friendly"));
    expect(spans).toHaveLength(1);
    expect(spans[0]!.text).toBe("ECO-Friendly");
  });

  it("finds every occurrence", () => {
    expect(findMatches("green green green", lit("green"))).toHaveLength(3);
  });
});

describe("regex matcher", () => {
  it("honours whitespace patterns", () => {
    expect(findMatches("carbon   neutral", rx("carbon\\s+neutral"))).toHaveLength(1);
  });

  it("throws a clear error on an invalid pattern", () => {
    expect(() => findMatches("x", rx("("))).toThrow(/Invalid regex trigger/);
  });
});

describe("proximity matcher", () => {
  it("matches when terms are within N words", () => {
    expect(findMatches("100% pure natural formula", prox("100% ~2 natural"))).toHaveLength(1);
  });

  it("does not match when terms are too far apart", () => {
    expect(findMatches("100% a b c natural", prox("100% ~2 natural"))).toHaveLength(0);
  });

  it("matches regardless of term order", () => {
    expect(findMatches("natural and 100% too", prox("100% ~3 natural"))).toHaveLength(1);
  });
});

describe("semantic trigger", () => {
  it("never matches deterministically (needs an adapter)", () => {
    expect(findMatches("safe for the planet", { kind: "semantic", value: "planet-safe idea" })).toHaveLength(0);
  });
});
