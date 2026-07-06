import type { LoadedPack, PackManifest } from "@claimkind/core";
import { rules } from "./rules.js";

export const manifest: PackManifest = {
  name: "au-greenwashing",
  version: "2026.1",
  jurisdiction: "AU",
  ruleCount: rules.length,
  changelog: "CHANGELOG.md",
  licence: "MIT",
};

export const pack: LoadedPack = { manifest, rules };

export { rules } from "./rules.js";
export default pack;
