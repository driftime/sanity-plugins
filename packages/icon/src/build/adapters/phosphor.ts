import path from "node:path";

import { isRecord } from "@repo/lib/utils";

import { importPackageFile, listSvgFiles, readSvgIcons } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { iconLibraryStyles } from "@/lib/libraries";

/**
 * Reads Phosphor's keywords from the icon list `@phosphor-icons/core` exports.
 *
 * @param directory - The package folder.
 * @returns Keywords keyed by icon name.
 */
async function readPhosphorKeywords(directory: string) {
  const { icons } = await importPackageFile(directory, "dist/index.mjs");
  if (!Array.isArray(icons)) return new Map<string, string[]>();

  return new Map(
    icons.flatMap((icon: unknown) =>
      isRecord(icon) && typeof icon["name"] === "string" && Array.isArray(icon["tags"])
        ? [[icon["name"], icon["tags"].map(String)] as const]
        : [],
    ),
  );
}

/** Phosphor, read from the SVG files `@phosphor-icons/core` ships for each weight. */
export const phosphorAdapter: IconAdapter = {
  library: "phosphor",
  label: "Phosphor Icons",
  packageName: "@phosphor-icons/core",
  packagePattern: /^@phosphor-icons\//u,
  styles: [...iconLibraryStyles.phosphor],
  async read({ directory, style }) {
    const folder = path.join(directory, "assets", style);
    const [files, keywords] = await Promise.all([listSvgFiles(folder), readPhosphorKeywords(directory)]);
    const suffix = style === "regular" ? ".svg" : `-${style}.svg`;

    return readSvgIcons(
      folder,
      files.filter((file) => file.endsWith(suffix)),
      (file) => {
        const name = file.slice(0, -suffix.length);

        return { name, keywords: keywords.get(name) ?? [] };
      },
    );
  },
};
