/** Resolve and load rule packs by name — from JSON on disk or a pack package. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import type { ClaimRule, LoadedPack, PackManifest } from "@claimkind/core";

const require = createRequire(import.meta.url);

export interface LoadPackOptions {
  packDir?: string;
  cwd?: string;
}

export async function loadPack(name: string, opts: LoadPackOptions = {}): Promise<LoadedPack> {
  const cwd = opts.cwd ?? process.cwd();

  // 1. JSON pack on disk: <dir>/manifest.json + rules/*.json
  const dirs: string[] = [];
  if (opts.packDir) dirs.push(join(opts.packDir, name));
  dirs.push(join(cwd, "packs", name));
  for (const dir of dirs) {
    const manifestPath = join(dir, "manifest.json");
    if (existsSync(manifestPath)) return loadJsonPack(dir, manifestPath);
  }

  // 2. Installed pack package: @claimkind/pack-<name> exporting `pack`/`default`.
  const pkg = `@claimkind/pack-${name}`;
  const imported = await tryImportPack(pkg);
  if (imported) return imported;

  throw new Error(
    `Pack "${name}" not found. Looked for:\n  ${dirs
      .map((d) => join(d, "manifest.json"))
      .join("\n  ")}\n  (installed package) ${pkg}`,
  );
}

function loadJsonPack(dir: string, manifestPath: string): LoadedPack {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as PackManifest;
  const rules: ClaimRule[] = [];
  const rulesDir = join(dir, "rules");
  if (existsSync(rulesDir)) {
    for (const file of readdirSync(rulesDir)) {
      if (!file.endsWith(".json")) continue;
      const parsed = JSON.parse(readFileSync(join(rulesDir, file), "utf8"));
      if (Array.isArray(parsed)) rules.push(...parsed);
      else rules.push(parsed);
    }
  }
  return { manifest, rules };
}

async function tryImportPack(pkg: string): Promise<LoadedPack | undefined> {
  let entry: string;
  try {
    // Resolve the package's main entry, then import it by file URL (Windows-safe).
    entry = require.resolve(pkg);
  } catch {
    return undefined;
  }
  const mod = (await import(pathToFileURL(entry).href)) as {
    pack?: LoadedPack;
    default?: LoadedPack;
  };
  const pack = mod.pack ?? mod.default;
  if (pack && pack.manifest && Array.isArray(pack.rules)) return pack;
  throw new Error(`Package "${pkg}" did not export a LoadedPack ('pack' or default).`);
}
