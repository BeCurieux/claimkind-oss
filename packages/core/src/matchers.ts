/**
 * Deterministic trigger matchers. Given a piece of text and a trigger, each
 * returns the character spans that match. No I/O, no randomness, no model —
 * identical input always yields identical spans. Semantic triggers are handled
 * separately (they require an adapter) and return nothing here.
 */
import type { Trigger } from "./types";

export interface Span {
  start: number;
  end: number;
  text: string;
}

/** Unicode-aware word-boundary lookarounds (letters or numbers). */
const BEFORE = "(?<![\\p{L}\\p{N}])";
const AFTER = "(?![\\p{L}\\p{N}])";

export function findMatches(text: string, trigger: Trigger): Span[] {
  switch (trigger.kind) {
    case "literal":
      return literalMatches(text, trigger.value);
    case "regex":
      return regexMatches(text, trigger.value);
    case "proximity":
      return proximityMatches(text, trigger.value);
    case "semantic":
      return []; // resolved by the adapter pass in lint()
    default:
      return [];
  }
}

function literalMatches(text: string, phrase: string): Span[] {
  const trimmed = phrase.trim();
  if (!trimmed) return [];
  const re = new RegExp(`${BEFORE}${escapeRegex(trimmed)}${AFTER}`, "giu");
  return collect(text, re);
}

function regexMatches(text: string, source: string): Span[] {
  let re: RegExp;
  try {
    re = new RegExp(source, "gi");
  } catch (err) {
    throw new Error(
      `Invalid regex trigger ${JSON.stringify(source)}: ${(err as Error).message}`,
    );
  }
  return collect(text, re);
}

/**
 * Proximity: "<termA> ~<N> <termB>" matches when termA occurs within N words of
 * termB (either order). The reported span covers from the earlier term's start
 * to the later term's end.
 */
function proximityMatches(text: string, value: string): Span[] {
  const parsed = /^(.+?)\s*~(\d+)\s+(.+)$/.exec(value.trim());
  if (!parsed) return [];
  const [, aRaw, nRaw, bRaw] = parsed;
  const n = Number.parseInt(nRaw!, 10);
  const aHits = literalMatches(text, aRaw!);
  const bHits = literalMatches(text, bRaw!);
  const spans: Span[] = [];
  for (const a of aHits) {
    for (const b of bHits) {
      if (a.start === b.start && a.end === b.end) continue;
      const [lo, hi] = a.start <= b.start ? [a, b] : [b, a];
      if (hi.start < lo.end) continue; // overlapping terms
      const between = text.slice(lo.end, hi.start).trim();
      const words = between === "" ? 0 : between.split(/\s+/).length;
      if (words <= n) {
        spans.push({ start: lo.start, end: hi.end, text: text.slice(lo.start, hi.end) });
      }
    }
  }
  return dedupeSpans(spans);
}

function collect(text: string, re: RegExp): Span[] {
  const spans: Span[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++; // guard against zero-width infinite loops
      continue;
    }
    spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }
  return spans;
}

export function dedupeSpans(spans: Span[]): Span[] {
  const seen = new Set<string>();
  const out: Span[] = [];
  for (const s of spans) {
    const key = `${s.start}:${s.end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.sort((a, b) => a.start - b.start || a.end - b.end);
}

export function spansOverlap(a: Span, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
