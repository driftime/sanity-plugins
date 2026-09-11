import { defineConfig } from "@sanity/pkg-utils";

export default defineConfig({
  dist: "dist",
  tsconfig: "tsconfig.dist.json",
  reactCompiler: true,
  deps: { onlyBundle: [/^@repo\//u] },
});
