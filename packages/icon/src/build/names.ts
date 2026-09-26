import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { isDefined } from "@repo/lib/utils";

import { registryModulePath } from "@/build/registry";
import { pluginName } from "@/config/defaults";

/** Types file the plugin reads icon names from, published next to the placeholder registry. */
const namesFile = path.join(path.dirname(registryModulePath), "names.d.ts");

/**
 * Writes the installed icon names into the plugin's own types, so options that list icons are checked against them.
 * The file is replaced rather than edited, because pnpm shares a package's files between projects.
 *
 * @param names - Icon names keyed by library.
 */
export async function writeIconNames(names: Map<string, Set<string>>) {
  const entries = [...names]
    .toSorted(([first], [second]) => first.localeCompare(second))
    .map(([library, icons]) => {
      const union = [...icons].toSorted().map((name) => JSON.stringify(name));

      return `  ${JSON.stringify(library)}: ${isDefined(union) ? union.join(" | ") : "never"};`;
    });

  const content = [
    `// Written by ${pluginName}'s build step from the project's installed icon libraries.`,
    "export type SanityIconNames = {",
    ...entries,
    "};",
    "",
  ].join("\n");

  const current = await readFile(namesFile, "utf8").catch(() => "");
  if (current === content) return;

  const temporary = `${namesFile}.${process.pid}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, namesFile);
}
