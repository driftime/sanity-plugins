import { isDefined } from "@repo/lib/utils";

import { importPackageFile, isElementType, loadRenderer, toKebabName } from "@/build/adapters/shared";
import type { IconAdapter } from "@/build/adapters/types";

/**
 * Finds the style suffix every export name in a Nucleo package ends with, such as `Outline18`, so it can be removed to
 * get each icon's own name.
 *
 * @param names - The export names.
 * @returns The shared suffix, starting at a capital letter, or an empty string when there's none.
 */
function findStyleSuffix(names: string[]) {
  const [first, ...rest] = names;
  if (!isDefined(first)) return "";

  let length = 0;
  while (length < first.length && rest.every((name) => name.at(-1 - length) === first.at(-1 - length))) length += 1;

  const shared = first.slice(first.length - length);
  const start = shared.search(/[A-Z]/u);

  return start === -1 ? "" : shared.slice(start);
}

/**
 * Nucleo, read by rendering the React components of its licensed packages. Each installed `nucleo-` package is a
 * style, named after the rest of its name, such as `ui-outline-18`. It has no keywords.
 */
export const nucleoAdapter: IconAdapter = {
  library: "nucleo",
  label: "Nucleo",
  packageName: undefined,
  packagePrefix: "nucleo-",
  packageExample: "nucleo-ui-outline-18",
  styles: [],
  async read({ directory, root }) {
    const renderer = loadRenderer(root);
    if (!isDefined(renderer)) return [];

    const exports = await importPackageFile(directory, "dist/index.js");
    const components = Object.entries(exports).flatMap(([exportName, component]) =>
      exportName.startsWith("Icon") && exportName !== "Icon" && isElementType(component)
        ? [[exportName, component] as const]
        : [],
    );
    const suffix = findStyleSuffix(components.map(([exportName]) => exportName));

    return components.flatMap(([exportName, component]) => {
      const svg = renderer.render(component);

      const name = toKebabName(exportName.slice("Icon".length, exportName.length - suffix.length));

      return [{ name, keywords: [], svg }];
    });
  },
};
