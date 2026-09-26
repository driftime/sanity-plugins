import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { isDefined } from "@repo/lib/utils";

import type { DetectedLibrary } from "@/build/sets";
import { getIconSetKey } from "@/lib/registry";
import type { IconLibraryInfo } from "@/lib/sets";

/**
 * Resolves symbolic links in a path, so a package linked into `node_modules` matches its real location.
 *
 * @param file - The path.
 * @returns The real path, or the path unchanged when it doesn't exist.
 */
function resolveRealPath(file: string) {
  try {
    return realpathSync(file);
  } catch {
    return file;
  }
}

/**
 * Path of the placeholder registry module the Studio imports, which the build step replaces. The build step's own
 * code is published next to it, so the path is found from this file's location.
 */
export const registryModulePath = resolveRealPath(fileURLToPath(new URL("sets.js", import.meta.url)));

/**
 * Checks whether a module the bundler is loading is the placeholder registry.
 *
 * @param id - The module's path, possibly followed by a query.
 * @returns Whether it's the placeholder.
 */
export function isRegistryModule(id: string) {
  const [file] = id.split("?");

  return isDefined(file) && resolveRealPath(file) === registryModulePath;
}

/**
 * Writes the module that replaces the placeholder registry, with a loader for each installed library style, so each
 * set is only downloaded when a picker for it opens.
 *
 * @param libraries - Every library the build step knows.
 * @param importFor - The specifier the bundler imports a set from, given its key.
 * @returns The module's code.
 */
export function createRegistryModule(libraries: DetectedLibrary[], importFor: (key: string) => string) {
  const loaders = libraries.flatMap(({ adapter, styles }) =>
    styles.map(({ style }) => {
      const key = getIconSetKey(adapter.library, style);

      return `${JSON.stringify(key)}: () => import(${JSON.stringify(importFor(key))})`;
    }),
  );

  const info: Record<string, IconLibraryInfo> = Object.fromEntries(
    libraries.map(({ adapter, styles, listed, sitePackage }) => [
      adapter.library,
      {
        label: adapter.label,
        packageName: adapter.packageName ?? adapter.packageExample ?? adapter.library,
        ...(isDefined(adapter.packagePrefix) && { packagePrefix: adapter.packagePrefix }),
        styles: isDefined(styles) ? styles.map(({ style }) => style) : adapter.styles,
        listed,
        installed: isDefined(styles),
        ...(isDefined(sitePackage) && { sitePackage }),
      },
    ]),
  );

  return [
    `const sets = {\n  ${loaders.join(",\n  ")}\n};`,
    `export const iconRegistry = { ready: true, sets, libraries: ${JSON.stringify(info)} };`,
  ].join("\n");
}
