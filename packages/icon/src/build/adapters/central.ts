import path from "node:path";

import { isDefined, isRecord } from "@repo/lib/utils";

import { importPackageFile, isElementType, loadRenderer, toKebabName } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { readJson } from "@/build/packages";

/**
 * Central, read by rendering the React components of its licensed style packages. Each installed
 * `@central-icons-react/` package is a style, named after the rest of its name, so several can be used at once. Each
 * icon is drawn in Central's raw mode, since its default mode draws through a mask.
 */
export const centralAdapter: IconAdapter = {
  library: "central",
  label: "Central Icon System",
  packageName: undefined,
  packagePrefix: "@central-icons-react/",
  packageExample: "@central-icons-react/round-outlined-radius-2-stroke-1.5",
  styles: [],
  async read({ directory, root }) {
    const renderer = loadRenderer(root);
    if (!isDefined(renderer)) return [];

    const [exports, index] = await Promise.all([
      importPackageFile(directory, "index.mjs"),
      readJson(path.join(directory, "icons-index.json")),
    ]);
    const aliases = isRecord(index) && isRecord(index["iconAliases"]) ? index["iconAliases"] : {};

    return Object.entries(exports).flatMap(([exportName, component]) => {
      // Central's components are wrapped in `memo` and `forwardRef`, so they're objects rather than functions.
      if (!exportName.startsWith("Icon") || exportName.endsWith("Default") || !isElementType(component)) return [];

      const svg = renderer.render(component, { mode: "raw" });

      const listed = aliases[exportName];
      const keywords = typeof listed === "string" ? listed.split(",").map((keyword) => keyword.trim()) : [];

      return [{ name: toKebabName(exportName.slice("Icon".length)), keywords, svg }];
    });
  },
};
