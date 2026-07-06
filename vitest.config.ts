import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Tests resolve the engine from source, so no build step is needed to test.
      "@claimkind/core": new URL("./packages/core/src/index.ts", import.meta.url).pathname,
    },
  },
  test: {
    include: ["packages/*/test/**/*.test.ts"],
  },
});
