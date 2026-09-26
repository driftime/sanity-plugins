import path from "node:path";

import { listSvgFiles, readSvgIcons } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { iconLibraryStyles } from "@/lib/libraries";

/** Iconoir, read from the SVG files the `iconoir` package ships for each style. It has no keywords. */
export const iconoirAdapter: IconAdapter = {
  library: "iconoir",
  label: "Iconoir",
  packageName: "iconoir",
  packagePattern: /^iconoir(?:-.+)?$/u,
  styles: [...iconLibraryStyles.iconoir],
  async read({ directory, style }) {
    const folder = path.join(directory, "icons", style);
    const files = await listSvgFiles(folder);

    return readSvgIcons(folder, files, (file) => ({ name: file.slice(0, -".svg".length), keywords: [] }));
  },
};
