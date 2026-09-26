import path from "node:path";

import { convertCase, isRecord } from "@repo/lib/utils";

import { listSvgFiles, readSvgIcons } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";
import { readJson } from "@/build/packages";

/**
 * Creates an adapter for a folder of the project's own SVG files. Each file becomes an icon named after the file, and an
 * optional `keywords.json` in the folder lists each icon's keywords by name.
 *
 * @param library - Identifier of the set.
 * @param folder - The folder, relative to the project.
 * @returns The adapter.
 */
export function createCustomAdapter(library: string, folder: string): IconAdapter {
  return {
    library,
    label: convertCase(library, "title"),
    packageName: undefined,
    styles: ["default"],
    async read({ root }) {
      const directory = path.resolve(root, folder);
      const [files, keywords] = await Promise.all([
        listSvgFiles(directory),
        readJson(path.join(directory, "keywords.json")),
      ]);

      return readSvgIcons(directory, files, (file) => {
        const name = convertCase(file.slice(0, -".svg".length), "kebab");
        const listed = isRecord(keywords) ? keywords[name] : undefined;

        return { name, keywords: Array.isArray(listed) ? listed.map(String) : [] };
      });
    },
  };
}
