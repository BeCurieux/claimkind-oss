/**
 * Pack invariant validation (§2). Encodes the rules that gate whether a pack may
 * ship, and is exercised by every pack's test suite:
 *
 *  - every rule has >=1 enforcement citation (with regulator/action/url);
 *  - every rule has >=1 violating and >=1 compliant example;
 *  - every violating example MUST trigger the rule;
 *  - every compliant example MUST NOT trigger the rule;
 *  - rule IDs are unique and well-formed; rule.pack matches the manifest;
 *  - pack version is calver (YYYY.N) and ruleCount matches.
 *
 * Behavioural checks run against a non-draft copy of each rule, so drafted rules
 * (which production `lint()` intentionally skips) are still fully exercised here.
 */
import type { ClaimRule, LoadedPack } from "./types";
import { lint } from "./lint";

export interface PackValidationIssue {
  ruleId?: string;
  kind: "manifest" | "id" | "pack" | "citation" | "examples" | "behaviour";
  message: string;
}

const CALVER = /^\d{4}\.\d+$/;
const RULE_ID = /^[A-Z]{2}-[A-Z]{2,4}-\d{3,}$/;

export async function validatePack(pack: LoadedPack): Promise<PackValidationIssue[]> {
  const issues: PackValidationIssue[] = [];
  const { manifest, rules } = pack;

  if (!CALVER.test(manifest.version)) {
    issues.push({ kind: "manifest", message: `version "${manifest.version}" is not calver (YYYY.N)` });
  }
  if (manifest.ruleCount !== rules.length) {
    issues.push({ kind: "manifest", message: `ruleCount ${manifest.ruleCount} != actual ${rules.length}` });
  }

  const seen = new Set<string>();
  for (const rule of rules) {
    const id = rule.id;
    if (!RULE_ID.test(id)) {
      issues.push({ ruleId: id, kind: "id", message: `id "${id}" is not well-formed (e.g. AU-GW-001)` });
    }
    if (seen.has(id)) {
      issues.push({ ruleId: id, kind: "id", message: `duplicate rule id "${id}"` });
    }
    seen.add(id);

    if (rule.pack !== manifest.name) {
      issues.push({ ruleId: id, kind: "pack", message: `rule.pack "${rule.pack}" != manifest "${manifest.name}"` });
    }

    if (!rule.enforcement || rule.enforcement.length < 1) {
      issues.push({ ruleId: id, kind: "citation", message: "no enforcement citation (>=1 required)" });
    } else {
      for (const c of rule.enforcement) {
        if (!c.regulator || !c.action || !c.url) {
          issues.push({ ruleId: id, kind: "citation", message: "citation missing regulator/action/url" });
        }
      }
    }

    if (!rule.examples || rule.examples.violating.length < 1) {
      issues.push({ ruleId: id, kind: "examples", message: "no violating example (>=1 required)" });
    }
    if (!rule.examples || rule.examples.compliant.length < 1) {
      issues.push({ ruleId: id, kind: "examples", message: "no compliant example (>=1 required)" });
    }

    // Behavioural invariants: lint each example against a single-rule pack.
    // Force draft:false so drafted rules are still exercised (lint() skips drafts).
    const solo: LoadedPack = { manifest, rules: [{ ...rule, draft: false }] };
    for (const ex of rule.examples?.violating ?? []) {
      const res = await lint(ex, { packs: [solo] });
      if (!res.violations.some((v) => v.ruleId === id)) {
        issues.push({ ruleId: id, kind: "behaviour", message: `violating example did NOT trigger: "${ex}"` });
      }
    }
    for (const ex of rule.examples?.compliant ?? []) {
      const res = await lint(ex, { packs: [solo] });
      if (res.violations.some((v) => v.ruleId === id)) {
        issues.push({ ruleId: id, kind: "behaviour", message: `compliant example WRONGLY triggered: "${ex}"` });
      }
    }
  }

  return issues;
}

/** IDs of rules still awaiting human review (draft:true). */
export function draftRules(rules: ClaimRule[]): string[] {
  return rules.filter((r) => r.draft).map((r) => r.id);
}
