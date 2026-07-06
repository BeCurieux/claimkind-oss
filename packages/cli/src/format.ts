import type { LintResult, Severity } from "@claimkind/core";

export interface Finding {
  file: string;
  unit?: string; // e.g. a CSV cell reference "r2:c3"
  result: LintResult;
}

const SEV_LABEL: Record<Severity, string> = {
  critical: "CRIT",
  high: "HIGH",
  medium: "MED ",
  advisory: "ADV ",
};

export function formatTable(findings: Finding[]): string {
  const lines: string[] = [];
  let total = 0;
  for (const f of findings) {
    for (const v of f.result.violations) {
      total++;
      const loc = f.unit ? `${f.file} [${f.unit}]` : f.file;
      const cite = v.enforcement[0];
      lines.push(
        `${SEV_LABEL[v.severity]}  ${v.ruleId}  ${loc}\n` +
          `      ${v.title}\n` +
          `      match: ${JSON.stringify(v.span.text)}\n` +
          `      fix:   ${v.remediation}\n` +
          (cite ? `      cite:  ${cite.regulator} — ${cite.action} (${cite.date})\n             ${cite.url}\n` : "") +
          `      [${v.confidence}]`,
      );
    }
  }
  if (total === 0) lines.push("No violations found.");
  lines.push("");
  lines.push(`${total} violation(s) across ${findings.length} unit(s).`);
  lines.push(disclaimer());
  return lines.join("\n");
}

export function formatJson(findings: Finding[]): string {
  return JSON.stringify(
    { findings, disclaimer: disclaimer() },
    null,
    2,
  );
}

export function formatJUnit(findings: Finding[]): string {
  let cases = "";
  let failures = 0;
  let tests = 0;
  for (const f of findings) {
    for (const v of f.result.violations) {
      tests++;
      failures++;
      const loc = f.unit ? `${f.file} ${f.unit}` : f.file;
      const msg = xml(`${v.severity}: ${v.title} — ${v.remediation}`);
      const cite = v.enforcement[0];
      const body = xml(
        `${v.rationale}\nmatch: ${v.span.text}\n` +
          (cite ? `cite: ${cite.regulator} ${cite.action} ${cite.url}` : ""),
      );
      cases +=
        `    <testcase classname="${xml(loc)}" name="${xml(v.ruleId)}">\n` +
        `      <failure message="${msg}">${body}</failure>\n` +
        `    </testcase>\n`;
    }
  }
  if (tests === 0) {
    cases = `    <testcase classname="claimkind" name="no-violations"/>\n`;
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuites>\n` +
    `  <testsuite name="claimkind" tests="${Math.max(tests, 1)}" failures="${failures}">\n` +
    cases +
    `  </testsuite>\n` +
    `</testsuites>\n`
  );
}

export function disclaimer(): string {
  return "ClaimKind performs deterministic linting against citation-backed rules. It is not legal advice.";
}

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
