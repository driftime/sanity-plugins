import path from "node:path";

import { listSvgFiles, readSvgIcons } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { iconLibraryStyles } from "@/lib/libraries";

/** Folder each Heroicons style is published in, named after the size it's drawn for. */
const styleFolders: Record<string, string> = {
  outline: "24/outline",
  solid: "24/solid",
  mini: "20/solid",
  micro: "16/solid",
};

/**
 * Heroicons, read from the SVG files the `heroicons` package ships for each style. It has no keywords, so its icons
 * are found by name.
 */
export const heroiconsAdapter: IconAdapter = {
  library: "heroicons",
  label: "Heroicons",
  packageName: "heroicons",
  packagePattern: /^(?:heroicons|@heroicons\/.+)$/u,
  styles: [...iconLibraryStyles.heroicons],
  async read({ directory, style }) {
    const folder = path.join(directory, styleFolders[style] ?? "24/outline");
    const files = await listSvgFiles(folder);

    return readSvgIcons(folder, files, (file) => ({ name: file.slice(0, -".svg".length), keywords: [] }));
  },
};
