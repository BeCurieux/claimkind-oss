import { readFileSync, existsSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { lint, draftRules, SEVERITY_ORDER, type LoadedPack, type Severity } from "@claimkind/core";
import { parseCsv } from "./csv";
import { loadPack } from "./loadPacks";
import { formatTable, formatJson, formatJUnit, type Finding } from "./format";

const FORMATS = ["table", "json", "junit"] as const;
type Format = (typeof FORMATS)[number];
const SEVERITIES: Severity[] = ["advisory", "medium", "high", "critical"];

interface Args {
  files: string[];
  packs: string[];
  format: Format;
  failOn?: Severity;
  packDir?: string;
}

const USAGE = `claimkind — deterministic, citation-backed compliance linting

Usage:
  claimkind check <file|glob...> --pack <name> [options]

Options:
  --pack <name>        Rule pack to load (repeatable)
  --format <fmt>       table | json | junit            (default: table)
  --fail-on <sev>      advisory | medium | high | critical  (exit 1 at/above)
  --pack-dir <dir>     Directory to resolve packs from
  -h, --help           Show this help

Linting, not legal advice.`;

export async function runCli(argv: string[]): Promise<number> {
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    console.log(USAGE);
    return argv.length === 0 ? 2 : 0;
  }
  if (argv[0] !== "check") {
    console.error(`Unknown command: ${argv[0]}\n\n${USAGE}`);
    return 2;
  }

  let args: Args;
  try {
    args = parseArgs(argv.slice(1));
  } catch (err) {
    console.error(`${(err as Error).message}\n\n${USAGE}`);
    return 2;
  }

  if (args.files.length === 0) {
    console.error(`No input files given.\n\n${USAGE}`);
    return 2;
  }
  if (args.packs.length === 0) {
    console.error(`At least one --pack is required.\n\n${USAGE}`);
    return 2;
  }

  let packs: LoadedPack[];
  try {
    packs = await Promise.all(args.packs.map((name) => loadPack(name, { packDir: args.packDir })));
  } catch (err) {
    console.error((err as Error).message);
    return 2;
  }

  for (const p of packs) {
    const drafts = draftRules(p.rules).length;
    const active = p.rules.length - drafts;
    if (p.rules.length === 0) {
      console.error(`Note: pack "${p.manifest.name}" contains 0 rules (stub) — nothing to check.`);
    } else if (active === 0) {
      console.error(
        `Note: pack "${p.manifest.name}" — ${p.rules.length} rules, all draft (skipped pending human review). 0 active rules.`,
      );
    } else if (drafts > 0) {
      console.error(`Note: pack "${p.manifest.name}" — ${active} active, ${drafts} draft (skipped).`);
    }
  }

  const findings: Finding[] = [];
  for (const file of expandFiles(args.files)) {
    if (!existsSync(file)) {
      console.error(`File not found: ${file}`);
      return 2;
    }
    const content = readFileSync(file, "utf8");
    if (file.toLowerCase().endsWith(".csv")) {
      const rows = parseCsv(content);
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r]!;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c]!.trim();
          if (!cell) continue;
          const result = await lint(cell, { packs });
          if (result.violations.length > 0) {
            findings.push({ file, unit: `r${r + 1}:c${c + 1}`, result });
          }
        }
      }
    } else {
      const result = await lint(content, { packs });
      findings.push({ file, result });
    }
  }

  console.log(render(findings, args.format));

  if (args.failOn) {
    const threshold = SEVERITY_ORDER[args.failOn];
    const worst = maxSeverity(findings);
    if (worst !== undefined && SEVERITY_ORDER[worst] >= threshold) return 1;
  }
  return 0;
}

function parseArgs(tokens: string[]): Args {
  const args: Args = { files: [], packs: [], format: "table" };
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    switch (t) {
      case "--pack":
        args.packs.push(expectValue(tokens, ++i, "--pack"));
        break;
      case "--format": {
        const v = expectValue(tokens, ++i, "--format");
        if (!FORMATS.includes(v as Format)) throw new Error(`Invalid --format: ${v}`);
        args.format = v as Format;
        break;
      }
      case "--fail-on": {
        const v = expectValue(tokens, ++i, "--fail-on");
        if (!SEVERITIES.includes(v as Severity)) throw new Error(`Invalid --fail-on: ${v}`);
        args.failOn = v as Severity;
        break;
      }
      case "--pack-dir":
        args.packDir = expectValue(tokens, ++i, "--pack-dir");
        break;
      default:
        if (t.startsWith("--")) throw new Error(`Unknown option: ${t}`);
        args.files.push(t);
    }
  }
  return args;
}

function expectValue(tokens: string[], i: number, flag: string): string {
  const v = tokens[i];
  if (v === undefined || v.startsWith("--")) throw new Error(`${flag} requires a value`);
  return v;
}

/** Minimal glob: expands a single `*` segment in the basename. */
function expandFiles(patterns: string[]): string[] {
  const out: string[] = [];
  for (const p of patterns) {
    if (!p.includes("*")) {
      out.push(p);
      continue;
    }
    const dir = dirname(p);
    const base = basename(p);
    const re = new RegExp("^" + base.split("*").map(escapeRegex).join(".*") + "$", "i");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (re.test(f)) out.push(join(dir, f));
    }
  }
  return out;
}

function render(findings: Finding[], format: Format): string {
  switch (format) {
    case "json":
      return formatJson(findings);
    case "junit":
      return formatJUnit(findings);
    default:
      return formatTable(findings);
  }
}

function maxSeverity(findings: Finding[]): Severity | undefined {
  let worst: Severity | undefined;
  for (const f of findings) {
    for (const v of f.result.violations) {
      if (worst === undefined || SEVERITY_ORDER[v.severity] > SEVERITY_ORDER[worst]) {
        worst = v.severity;
      }
    }
  }
  return worst;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
