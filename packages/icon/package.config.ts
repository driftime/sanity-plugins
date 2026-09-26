import { defineConfig } from "@sanity/pkg-utils";

export default defineConfig({
  dist: "dist",
  tsconfig: "tsconfig.dist.json",
  reactCompiler: true,
  // The placeholders stay their own published files, so the build step can replace them.
  deps: {
    onlyBundle: [/^@repo\//u],
    neverBundle: ["@driftime/sanity-plugin-icon/sets", "@driftime/sanity-plugin-icon/names"],
  },
});
