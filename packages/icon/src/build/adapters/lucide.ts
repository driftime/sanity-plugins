import path from "node:path";

import { isDefined, isRecord } from "@repo/lib/utils";

import { roundStrokeRoot, writeElementPairs } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { readJson } from "@/build/packages";
import { iconLibraryStyles } from "@/lib/libraries";

/** Lucide, read from the shape data and keywords `lucide-static` ships. */
export const lucideAdapter: IconAdapter = {
  library: "lucide",
  label: "Lucide",
  packageName: "lucide-static",
  packagePattern: /^(?:lucide(?:-.+)?|@lucide\/.+)$/u,
  styles: [...iconLibraryStyles.lucide],
  async read({ directory, root }) {
    const [nodes, tags] = await Promise.all([
      readJson(path.join(directory, "icon-nodes.json")),
      readJson(path.join(directory, "tags.json")),
    ]);
    if (!isRecord(nodes)) return [];

    return Object.entries(nodes).flatMap(([name, value]) => {
      const svg = writeElementPairs(root, roundStrokeRoot, value);
      if (!isDefined(svg)) return [];

      const keywords = isRecord(tags) && Array.isArray(tags[name]) ? tags[name].map(String) : [];

      return [{ name, keywords, svg }];
    });
  },
};
