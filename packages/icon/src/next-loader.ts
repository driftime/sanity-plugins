import { isRecord } from "@repo/lib/utils";

import type { LoaderContext, generateRegistry } from "@/build/loader";
import { readPluginBuild } from "@/build/packages";
import { logger } from "@/config/defaults";

/** This module as the loader imports it afresh on every run. */
interface LoaderModule {
  /** Generates the registry. */
  generateRegistry: typeof generateRegistry;
}

/**
 * Checks whether an imported module is a fresh copy of this one.
 *
 * @param value - The imported module.
 * @returns True if the module is this one.
 */
function isLoaderModule(value: unknown): value is LoaderModule {
  return isRecord(value) && typeof value["generateRegistry"] === "function";
}

/**
 * Webpack and Turbopack loader that replaces the placeholder registry with the project's converted icon sets. The
 * bundler keeps this module loaded, so it imports a fresh copy of itself, versioned by the plugin's code, and runs that
 * copy's build step, so updating the plugin takes effect without restarting the bundler.
 *
 * @param this - The loader context.
 * @returns The registry's code.
 * @throws When the plugin's build step can't be loaded.
 * @public
 */
async function iconSetsLoader(this: LoaderContext) {
  const fresh: unknown = await import(`${import.meta.url}?version=${await readPluginBuild()}`);
  if (!isLoaderModule(fresh)) throw new Error(logger.format("The build step couldn't be loaded."));

  const { code, files, folders } = await fresh.generateRegistry(this.resourcePath, this.getOptions());

  for (const file of files) this.addDependency?.(file);
  for (const folder of folders) this.addContextDependency?.(folder);

  return code;
}

export default iconSetsLoader;
export { generateRegistry } from "@/build/loader";
