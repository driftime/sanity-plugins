import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isRecord } from "@repo/lib/utils";

import { writeIconNames } from "@/build/names";
import { listPluginFiles } from "@/build/packages";
import { createRegistryModule } from "@/build/registry";
import { describeReport, detectLibraries, listRegistryDependencies, loadIconSet } from "@/build/sets";
import { logger } from "@/config/defaults";

/**
 * The parts of a webpack or Turbopack loader's context the build step uses.
 *
 * @public
 */
export interface LoaderContext {
  /** Path of the module being loaded. */
  resourcePath: string;
  /**
   * Reads the loader's options.
   *
   * @returns The options.
   */
  getOptions: () => unknown;
  /**
   * Tells the bundler to run the loader again when a file changes.
   *
   * @param file - The file.
   */
  addDependency?: (file: string) => void;
  /**
   * Tells the bundler to run the loader again when anything in a folder changes.
   *
   * @param folder - The folder.
   */
  addContextDependency?: (folder: string) => void;
}

/**
 * Converts every installed library, writes each set to a file the bundler can split into its own chunk, and returns
 * the registry that replaces the placeholder.
 *
 * @param resourcePath - Path of the placeholder being replaced.
 * @param options - The loader's options.
 * @returns The registry's code, and the files and folders it was generated from.
 */
async function generateRegistryOnce(resourcePath: string, options: unknown) {
  const root = process.cwd();
  const custom = isRecord(options) && isRecord(options["custom"]) ? options["custom"] : {};
  const folders = Object.fromEntries(
    Object.entries(custom).flatMap(([name, folder]) => (typeof folder === "string" ? [[name, folder]] : [])),
  );

  const cacheDir = path.join(root, "node_modules", ".cache");
  const setsDir = path.join(cacheDir, "driftime-icon", "sets");
  await mkdir(setsDir, { recursive: true });

  const libraries = await detectLibraries(root, folders);
  const files = new Map<string, string>();
  const names = new Map<string, Set<string>>();

  const converted = await Promise.all(
    libraries.flatMap((library) =>
      library.styles.map(async ({ style }) => {
        const { adapter } = library;
        const { set, report } = await loadIconSet(library, style, { root, cacheDir });
        const file = path.join(setsDir, `${adapter.library}-${style}.json`);

        await writeFile(file, JSON.stringify(set));
        logger.info(describeReport(adapter.label, style, report));

        return { library: adapter.library, style, set, file };
      }),
    ),
  );

  for (const { library, style, set, file } of converted) {
    const libraryNames = names.get(library) ?? new Set<string>();

    for (const icon of set.icons) libraryNames.add(icon.name);
    names.set(library, libraryNames);
    files.set(`${library}/${style}`, file);
  }

  await writeIconNames(new Map([...names].filter(([, libraryNames]) => libraryNames.size > 0)));

  const code = createRegistryModule(libraries, (key) => {
    const file = files.get(key) ?? "";
    const relative = path.relative(path.dirname(resourcePath), file).replaceAll("\\", "/");

    return relative.startsWith(".") ? relative : `./${relative}`;
  });

  const dependencies = listRegistryDependencies(root, libraries);

  // The plugin's own files are included, so updating it runs the loader again even when `package.json` doesn't change.
  return { code, files: [...dependencies.files, ...(await listPluginFiles())], folders: dependencies.folders };
}

/**
 * Reads the project's `package.json` as text.
 *
 * @returns The contents, or an empty string when there's no file.
 */
async function readManifest() {
  try {
    return await readFile(path.join(process.cwd(), "package.json"), "utf8");
  } catch {
    return "";
  }
}

/**
 * Generates the registry, running again when the project's `package.json` changes while it runs, so a package
 * installed during a run isn't missed.
 *
 * @param resourcePath - Path of the placeholder being replaced.
 * @param options - The loader's options.
 * @param attempts - Runs allowed, including this one.
 * @returns The registry's code, and the files and folders it was generated from.
 * @public
 */
export async function generateRegistry(
  resourcePath: string,
  options: unknown,
  attempts = 3,
): ReturnType<typeof generateRegistryOnce> {
  const before = await readManifest();
  const result = await generateRegistryOnce(resourcePath, options);
  const after = await readManifest();

  return before === after || attempts <= 1 ? result : generateRegistry(resourcePath, options, attempts - 1);
}
