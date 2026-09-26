import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { isDefined, isRecord } from "@repo/lib/utils";

/** An installed package's folder and version. */
export interface InstalledPackage {
  /** Name the package was published under, which differs from the name it's installed under when it's an alias. */
  name: string;
  /** Folder the package is installed in. */
  directory: string;
  /** Version installed. */
  version: string;
}

/**
 * Lists the plugin's own published code files.
 *
 * @returns The files' paths, sorted.
 */
export async function listPluginFiles() {
  const files = await readdir(import.meta.dirname);

  return files
    .filter((file) => file.endsWith(".js"))
    .toSorted()
    .map((file) => path.join(import.meta.dirname, file));
}

/**
 * Hashes the plugin's own published code, so anything built from an older version is replaced. It uses the contents
 * rather than modification times, because packages installed from npm all carry the same fixed date.
 *
 * @returns The hash.
 */
export async function readPluginBuild() {
  const files = await listPluginFiles();
  const contents = await Promise.all(files.map(async (file) => ({ file, content: await readFile(file) })));
  const hash = createHash("sha256");

  for (const { file, content } of contents) hash.update(path.basename(file)).update(content);

  return hash.digest("hex").slice(0, 16);
}

/**
 * Reads and parses a JSON file.
 *
 * @param file - Path to the file.
 * @returns The parsed contents, or undefined when the file is missing or isn't JSON.
 */
export async function readJson(file: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return undefined;
  }
}

/**
 * Lists a folder and every folder above it, nearest first.
 *
 * @param directory - The folder to start from.
 * @returns The folders.
 */
function listAncestors(directory: string): string[] {
  const parent = path.dirname(directory);

  return parent === directory ? [directory] : [directory, ...listAncestors(parent)];
}

/**
 * Finds an installed package by walking up from the project folder through each `node_modules`, the way Node does.
 * Its `package.json` is read directly, because some icon packages don't allow importing it.
 *
 * @param root - The project folder.
 * @param name - The package name.
 * @returns The package, or undefined when it isn't installed.
 */
export async function findPackage(root: string, name: string): Promise<InstalledPackage | undefined> {
  const candidates = await Promise.all(
    listAncestors(path.resolve(root)).map(async (folder) => {
      const directory = path.join(folder, "node_modules", name);

      return { directory, manifest: await readJson(path.join(directory, "package.json")) };
    }),
  );

  for (const { directory, manifest } of candidates) {
    if (isRecord(manifest) && typeof manifest["version"] === "string") {
      const published = typeof manifest["name"] === "string" ? manifest["name"] : name;

      return { name: published, directory, version: manifest["version"] };
    }
  }

  return undefined;
}

/**
 * Lists the packages a project declares, from its dependencies, dev dependencies, and peer dependencies.
 *
 * @param root - The project folder.
 * @returns The declared package names.
 */
export async function readDeclaredPackages(root: string) {
  const manifest = await readJson(path.join(root, "package.json"));
  if (!isRecord(manifest)) return new Set<string>();

  const groups = [manifest["dependencies"], manifest["devDependencies"], manifest["peerDependencies"]];

  return new Set(
    groups.flatMap((group) => (isRecord(group) ? Object.keys(group) : [])).filter((name) => isDefined(name)),
  );
}
