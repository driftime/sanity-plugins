import path from "node:path";

import { isDefined, isRecord } from "@repo/lib/utils";

import { roundStrokeRoot, writeElementPairs } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { readJson } from "@/build/packages";
import { iconLibraryStyles } from "@/lib/libraries";

/** Tabler, read from the shape data and keywords `@tabler/icons` ships for each style. */
export const tablerAdapter: IconAdapter = {
  library: "tabler",
  label: "Tabler Icons",
  packageName: "@tabler/icons",
  packagePattern: /^@tabler\/icons(?:-.+)?$/u,
  styles: [...iconLibraryStyles.tabler],
  async read({ directory, style, root }) {
    const [nodes, details] = await Promise.all([
      readJson(path.join(directory, `tabler-nodes-${style}.json`)),
      readJson(path.join(directory, "icons.json")),
    ]);
    if (!isRecord(nodes)) return [];

    const attributes = style === "filled" ? { viewBox: "0 0 24 24", fill: "currentColor" } : roundStrokeRoot;

    return Object.entries(nodes).flatMap(([name, value]) => {
      const svg = writeElementPairs(root, attributes, value);
      if (!isDefined(svg)) return [];

      const detail = isRecord(details) ? details[name] : undefined;
      const tags = isRecord(detail) && Array.isArray(detail["tags"]) ? detail["tags"].map(String) : [];

      return [{ name, keywords: tags, svg }];
    });
  },
};
