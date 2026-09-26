import { isDefined } from "@repo/lib/utils";

import { importPackageFile, toKebabName, writeElementPairs } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { iconLibraryStyles } from "@/lib/libraries";

/** Suffixes Hugeicons adds to its export names, removed to get the icon's own name. */
const exportSuffixes = /(?:FreeIcons|Icon)$/u;

/**
 * Hugeicons, read from the shape data `@hugeicons/core-free-icons` exports. It has no keywords, so its icons are found
 * by name. The package also exports many icons under other libraries' names, which aren't used as keywords because
 * they don't describe the icon.
 */
export const hugeiconsAdapter: IconAdapter = {
  library: "hugeicons",
  label: "Hugeicons",
  packageName: "@hugeicons/core-free-icons",
  packagePattern: /^@hugeicons\//u,
  styles: [...iconLibraryStyles.hugeicons],
  async read({ directory, root }) {
    const exports = await importPackageFile(directory, "dist/esm/index.js");
    const namesByIcon = new Map<unknown, string[]>();

    for (const [exportName, value] of Object.entries(exports)) {
      namesByIcon.set(value, [...(namesByIcon.get(value) ?? []), exportName]);
    }

    return [...namesByIcon].flatMap(([value, exportNames]) => {
      const svg = writeElementPairs(root, { viewBox: "0 0 24 24", fill: "none" }, value);
      const iconNames = exportNames.filter((exportName) => exportName.endsWith("Icon")).toSorted();
      const [primary] = iconNames;
      if (!isDefined(svg) || !isDefined(primary)) return [];

      const name = toKebabName(primary.replace(exportSuffixes, ""));

      return [{ name, keywords: [], svg }];
    });
  },
};
