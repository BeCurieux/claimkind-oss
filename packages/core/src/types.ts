/**
 * ClaimKind core contract types.
 *
 * These mirror the rule/engine schema in CLAUDE-CODE-PIVOT.md §2–§3 verbatim.
 * They are the public contract: additive changes only, never break shape.
 */

export type Jurisdiction = "AU" | "US" | "UK" | "EU";
export type Severity = "critical" | "high" | "medium" | "advisory";

/** A pointer to a real regulator action. Every rule ships with at least one. */
export interface EnforcementCitation {
  regulator: string; // "ACCC", "TGA", "FTC", "ASA"
  action: string; // case/action name
  date: string; // ISO 8601
  url: string;
  outcome?: string; // penalty, undertaking, withdrawal
}

export interface Trigger {
  kind: "literal" | "regex" | "proximity" | "semantic";
  /**
   * The match payload, interpreted by `kind`:
   * - literal:   an exact phrase, matched case-insensitively on word boundaries.
   * - regex:     a JS RegExp source, compiled with flags "gi".
   * - proximity: "<termA> ~<N> <termB>" — termA within N words of termB.
   * - semantic:  a natural-language description; evaluated ONLY when an
   *              LlmAdapter is supplied. Results are capped at severity
   *              "advisory" unless corroborated by a deterministic trigger
   *              in the same rule.
   */
  value: string;
}

export interface ClaimRule {
  id: string; // "AU-GW-001" — stable forever, never reused
  pack: string; // "au-greenwashing"
  jurisdiction: Jurisdiction;
  category: string; // "environmental" | "therapeutic" | "efficacy" | ...
  severity: Severity;
  title: string;
  rationale: string; // why this rule exists, plain English
  triggers: Trigger[];
  exceptions?: Trigger[]; // patterns that negate a match
  enforcement: EnforcementCitation[]; // MINIMUM ONE. A rule without a citation does not ship.
  remediation: string; // how to fix, plain English
  examples: { violating: string[]; compliant: string[] };
  /** Draft rules are authored but not human-reviewed; excluded from shipped packs. */
  draft?: boolean;
}

export interface PackManifest {
  name: string; // "au-greenwashing"
  version: string; // "2026.3" — quarterly calver
  jurisdiction: Jurisdiction;
  ruleCount: number;
  changelog: string; // path
  licence: "MIT" | "proprietary";
}

/** A manifest paired with its resolved rules, ready to lint against. */
export interface LoadedPack {
  manifest: PackManifest;
  rules: ClaimRule[];
}

export interface LintContext {
  productType?: string;
  channel?: "pdp" | "ad" | "email" | "label" | "social";
}

// --- Semantic (LLM) adapter ------------------------------------------------

export interface SemanticQuery {
  ruleId: string;
  /** The semantic trigger's natural-language description. */
  description: string;
  text: string;
  context?: LintContext;
}

export interface SemanticSpan {
  start: number;
  end: number;
  /** Adapter confidence 0..1. Advisory-only; never creates a verdict alone. */
  confidence: number;
}

/**
 * Optional LLM adapter. Its ONLY role is to surface candidate spans for
 * semantic triggers. It never decides a verdict: the engine caps its output
 * at "advisory" unless a deterministic trigger in the same rule corroborates.
 * Batched: one call receives every semantic query for a lint run.
 */
export interface LlmAdapter {
  evaluateSemantic(queries: SemanticQuery[]): Promise<SemanticSpan[][]>;
}

// --- Lint I/O --------------------------------------------------------------

export interface LintOptions {
  packs: LoadedPack[];
  category?: string;
  context?: LintContext;
  /** Optional; absence = a fully deterministic run. */
  llmAdapter?: LlmAdapter;
}

export interface Violation {
  ruleId: string;
  severity: Severity;
  span: { start: number; end: number; text: string };
  title: string;
  rationale: string;
  remediation: string;
  enforcement: EnforcementCitation[];
  confidence: "deterministic" | "semantic-advisory";
}

export interface LintResult {
  violations: Violation[];
  packVersions: Record<string, string>; // audit anchor
  textHash: string; // sha256, audit anchor
  stats: { rulesEvaluated: number; durationMs: number };
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  advisory: 0,
  medium: 1,
  high: 2,
  critical: 3,
};
