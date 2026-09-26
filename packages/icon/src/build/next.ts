import path from "node:path";
import { fileURLToPath } from "node:url";

import { isRegistryModule, registryModulePath } from "@/build/registry";
import type { SanityIconBuildOptions } from "@/build/vite";

/** A webpack rule, limited to what the build step adds. */
interface WebpackRule {
  /** Matches the placeholder registry. */
  test: (resource: string) => boolean;
  /** The loader that replaces it, with the build step's options. */
  use: { loader: string; options: { custom: Record<string, string> } }[];
}

/**
 * The parts of a webpack configuration the build step extends.
 *
 * @public
 */
export interface SanityIconWebpackConfig {
  /** Module settings, whose rules the build step adds to. */
  module?: { rules?: unknown[] };
}

/**
 * The parts of a Next.js configuration the build step extends, so the package doesn't depend on Next.js's own types.
 *
 * @public
 */
export interface SanityIconNextConfig {
  /** Turbopack settings, whose rules the build step adds to. */
  turbopack?: { rules?: Record<string, unknown> };
  /** Customises webpack, for projects that build with it instead of Turbopack. */
  webpack?: SanityIconWebpackCustomizer | null;
}

/**
 * Customises webpack, as Next.js's `webpack` option does. The context is typed `never` because the build step only
 * passes Next.js's own context through, so any context type a project's function declares is accepted.
 *
 * @public
 */
export type SanityIconWebpackCustomizer = (config: SanityIconWebpackConfig, context: never) => SanityIconWebpackConfig;

/** Path of the loader, published next to this file. */
const loaderPath = fileURLToPath(new URL("next-loader.js", import.meta.url));

/**
 * Adds the icon build step to a Next.js configuration, for Studios embedded in a Next.js app. It works with both
 * Turbopack and webpack.
 *
 * @param options - Options for the build step.
 * @returns A function that extends the Next.js configuration.
 * @public
 */
export function withIcons(options: SanityIconBuildOptions = {}) {
  const loader = { loader: loaderPath, options: { custom: options.custom ?? {} } };
  const placeholder = path.basename(path.dirname(path.dirname(registryModulePath)));

  return function extendConfig<Config extends SanityIconNextConfig>(config: Config): Config {
    const { turbopack, webpack } = config;

    return {
      ...config,
      turbopack: {
        ...turbopack,
        rules: { ...turbopack?.rules, [`**/${placeholder}/dist/sets.js`]: { loaders: [loader], as: "*.js" } },
      },
      webpack(webpackConfig: SanityIconWebpackConfig, context: never) {
        const resolved = webpack?.(webpackConfig, context) ?? webpackConfig;
        const rule: WebpackRule = { test: isRegistryModule, use: [loader] };

        return { ...resolved, module: { ...resolved.module, rules: [...(resolved.module?.rules ?? []), rule] } };
      },
    };
  };
}
