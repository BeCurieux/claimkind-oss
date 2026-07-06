import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  target: "es2022",
  // core is bundled in so the CLI runs standalone
  noExternal: ["@claimkind/core"],
  banner: { js: "#!/usr/bin/env node" },
});
