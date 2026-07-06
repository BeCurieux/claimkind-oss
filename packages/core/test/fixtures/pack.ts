/**
 * SYNTHETIC test fixture — NOT a shippable rule pack.
 *
 * The rules and "enforcement citations" below are fabricated purely to exercise
 * the engine (matchers, exceptions, invariants, the semantic pass). They are
 * clearly marked as test data (example.test URLs). No real rule content or real
 * enforcement action is reconstructed here — that only ever comes from supplied
 * seed files under human review.
 */
import type { LoadedPack } from "../../src/types";

export const fixturePack: LoadedPack = {
  manifest: {
    name: "fixture",
    version: "2026.1",
    jurisdiction: "AU",
    ruleCount: 4,
    changelog: "n/a",
    licence: "MIT",
  },
  rules: [
    {
      id: "TS-GW-001",
      pack: "fixture",
      jurisdiction: "AU",
      category: "environmental",
      severity: "high",
      title: "Vague unqualified green claim",
      rationale: "Unqualified environmental adjectives mislead without substantiation.",
      triggers: [{ kind: "literal", value: "eco-friendly" }],
      exceptions: [{ kind: "literal", value: "not eco-friendly" }],
      enforcement: [
        {
          regulator: "ACCC",
          action: "FIXTURE v Example Pty Ltd (test data)",
          date: "2020-01-01",
          url: "https://example.test/fixture-001",
          outcome: "test-only",
        },
      ],
      remediation: "State the specific, verifiable environmental benefit.",
      examples: {
        violating: ["Our eco-friendly water bottle"],
        compliant: ["Made from 100% recycled PET", "This packaging is not eco-friendly"],
      },
    },
    {
      id: "TS-GW-002",
      pack: "fixture",
      jurisdiction: "AU",
      category: "environmental",
      severity: "critical",
      title: "Absolute carbon neutrality claim",
      rationale: "Absolute neutrality claims require verified offsetting evidence.",
      triggers: [{ kind: "regex", value: "carbon\\s+neutral" }],
      enforcement: [
        {
          regulator: "ACCC",
          action: "FIXTURE re Carbon Claims (test data)",
          date: "2021-06-01",
          url: "https://example.test/fixture-002",
        },
      ],
      remediation: "Disclose the offsetting standard and scope.",
      examples: {
        violating: ["We are carbon neutral across all operations"],
        compliant: ["We measure our carbon emissions annually"],
      },
    },
    {
      id: "TS-GW-003",
      pack: "fixture",
      jurisdiction: "AU",
      category: "environmental",
      severity: "medium",
      title: "Unqualified 'natural' proximity claim",
      rationale: "'100%' near 'natural' overstates purity.",
      triggers: [{ kind: "proximity", value: "100% ~2 natural" }],
      enforcement: [
        {
          regulator: "ACCC",
          action: "FIXTURE re Natural Claims (test data)",
          date: "2022-03-01",
          url: "https://example.test/fixture-003",
        },
      ],
      remediation: "Qualify what proportion is natural and by what measure.",
      examples: {
        violating: ["100% pure natural formula"],
        compliant: ["Contains natural botanical extracts"],
      },
    },
    {
      id: "TS-GW-004",
      pack: "fixture",
      jurisdiction: "AU",
      category: "environmental",
      severity: "high",
      title: "Planet-safe claim (semantic-capable)",
      rationale: "Broad safety-for-the-planet claims are typically unsubstantiated.",
      triggers: [
        { kind: "literal", value: "planet-safe" },
        { kind: "semantic", value: "an unsubstantiated claim that the product is safe for the planet" },
      ],
      enforcement: [
        {
          regulator: "ACCC",
          action: "FIXTURE re Planet Claims (test data)",
          date: "2023-09-01",
          url: "https://example.test/fixture-004",
        },
      ],
      remediation: "Replace with a specific, evidenced environmental attribute.",
      examples: {
        violating: ["Our planet-safe cleaning range"],
        compliant: ["Formulated without phosphates"],
      },
    },
  ],
};
