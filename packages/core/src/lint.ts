/**
 * The lint pipeline. Deterministic first: every violation is produced by a
 * rule matching the text via literal/regex/proximity triggers. Semantic
 * triggers run only when an LlmAdapter is supplied, and their output can never
 * exceed "advisory" severity unless a deterministic trigger in the same rule
 * corroborates it. Model output alone never creates a verdict.
 */
import { findMatches, dedupeSpans, spansOverlap, type Span } from "./matchers";
import { sha256Hex } from "./hash";
import type {
  ClaimRule,
  LintOptions,
  LintResult,
  SemanticQuery,
  Severity,
  Violation,
} from "./types";

export async function lint(text: string, options: LintOptions): Promise<LintResult> {
  const started = now();
  const { packs, category, context, llmAdapter, includeDrafts } = options;

  const violations: Violation[] = [];
  const packVersions: Record<string, string> = {};
  let rulesEvaluated = 0;

  interface SemanticJob {
    rule: ClaimRule;
    description: string;
    hasDeterministic: boolean;
    exceptionSpans: Span[];
  }
  const semanticJobs: SemanticJob[] = [];

  for (const pack of packs) {
    packVersions[pack.manifest.name] = pack.manifest.version;
    for (const rule of pack.rules) {
      if (rule.draft && !includeDrafts) continue; // draft rules never lint in production
      if (category && rule.category !== category) continue;
      rulesEvaluated++;

      const exceptionSpans = collectSpans(text, rule.exceptions ?? []);
      const deterministicSpans = collectSpans(
        text,
        rule.triggers.filter((t) => t.kind !== "semantic"),
      ).filter((s) => !overlapsAny(s, exceptionSpans));

      for (const span of deterministicSpans) {
        violations.push(toViolation(rule, span, rule.severity, "deterministic"));
      }

      if (llmAdapter) {
        for (const t of rule.triggers) {
          if (t.kind !== "semantic") continue;
          semanticJobs.push({
            rule,
            description: t.value,
            hasDeterministic: deterministicSpans.length > 0,
            exceptionSpans,
          });
        }
      }
    }
  }

  // Semantic pass: a single batched adapter call for the whole run.
  if (llmAdapter && semanticJobs.length > 0) {
    const queries: SemanticQuery[] = semanticJobs.map((j) => ({
      ruleId: j.rule.id,
      description: j.description,
      text,
      context,
    }));
    const results = await llmAdapter.evaluateSemantic(queries);
    results.forEach((spansForJob, i) => {
      const job = semanticJobs[i];
      if (!job) return;
      for (const raw of spansForJob ?? []) {
        const span: Span = {
          start: raw.start,
          end: raw.end,
          text: text.slice(raw.start, raw.end),
        };
        if (overlapsAny(span, job.exceptionSpans)) continue;
        const corroborated = job.hasDeterministic;
        violations.push(
          toViolation(
            job.rule,
            span,
            corroborated ? job.rule.severity : "advisory",
            corroborated ? "deterministic" : "semantic-advisory",
          ),
        );
      }
    });
  }

  const textHash = await sha256Hex(text);
  return {
    violations: dedupeViolations(violations),
    packVersions,
    textHash,
    stats: { rulesEvaluated, durationMs: Math.round((now() - started) * 1000) / 1000 },
  };
}

function collectSpans(text: string, triggers: { kind: string; value: string }[]): Span[] {
  const spans: Span[] = [];
  for (const t of triggers) {
    spans.push(...findMatches(text, t as never));
  }
  return dedupeSpans(spans);
}

function overlapsAny(span: Span, others: Span[]): boolean {
  return others.some((o) => spansOverlap(span, o));
}

function toViolation(
  rule: ClaimRule,
  span: Span,
  severity: Severity,
  confidence: Violation["confidence"],
): Violation {
  return {
    ruleId: rule.id,
    severity,
    span: { start: span.start, end: span.end, text: span.text },
    title: rule.title,
    rationale: rule.rationale,
    remediation: rule.remediation,
    enforcement: rule.enforcement,
    confidence,
  };
}

/**
 * Collapse duplicates at the same rule+span, preferring the deterministic
 * verdict over a semantic-advisory one for the same location.
 */
function dedupeViolations(violations: Violation[]): Violation[] {
  const best = new Map<string, Violation>();
  for (const v of violations) {
    const key = `${v.ruleId}:${v.span.start}:${v.span.end}`;
    const existing = best.get(key);
    if (!existing || (existing.confidence === "semantic-advisory" && v.confidence === "deterministic")) {
      best.set(key, v);
    }
  }
  return [...best.values()].sort(
    (a, b) => a.span.start - b.span.start || a.ruleId.localeCompare(b.ruleId),
  );
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : 0;
}
