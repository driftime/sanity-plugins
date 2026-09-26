import path from "node:path";

import { isDefined } from "@repo/lib/utils";

import { writeIconNames } from "@/build/names";
import { createRegistryModule, isRegistryModule } from "@/build/registry";
import type { DetectedLibrary } from "@/build/sets";
import { describeReport, detectLibraries, listRegistryDependencies, loadIconSet } from "@/build/sets";
import { logger, pluginName } from "@/config/defaults";

/**
 * Options for the build step that converts icon libraries for the Studio.
 *
 * @public
 */
export interface SanityIconBuildOptions {
  /** Folders of the project's own SVG icons, keyed by the identifier fields use, such as `{ acme: "./icons" }`. */
  custom?: Record<string, string>;
}

/**
 * A Vite plugin, limited to the hooks the build step uses, so the package doesn't depend on Vite's own types.
 *
 * @public
 */
export interface SanityIconVitePlugin {
  /** Name Vite reports the plugin under. */
  name: string;
  /**
   * Keeps the placeholder registry out of Vite's pre-bundling in development, which would fix it in place, while the
   * rest of the plugin and its dependencies are pre-bundled as usual.
   *
   * @returns The configuration to merge.
   */
  config: () => { optimizeDeps: { exclude: string[] } };
  /**
   * Reads the project folder and cache folder once Vite has resolved its configuration.
   *
   * @param config - Vite's resolved configuration.
   */
  configResolved: (config: { root: string; cacheDir: string }) => Promise<void>;
  /**
   * Watches the project's own icon folders in development, reloading the Studio when an icon is added, changed, or
   * removed.
   *
   * @param server - Vite's development server.
   */
  configureServer: (server: {
    watcher: {
      add: (paths: string[]) => void;
      on: (event: "all", listener: (event: string, file: string) => void) => void;
    };
    moduleGraph: { invalidateAll: () => void };
    ws: { send: (payload: { type: "full-reload" }) => void };
  }) => void;
  /** Lists the installed icon names in the plugin's types when a build or dev server starts. */
  buildStart: () => Promise<void>;
  /**
   * Claims the modules each set is loaded from.
   *
   * @param id - The module requested.
   * @returns The module's resolved id, or undefined when it isn't a set.
   */
  resolveId: (id: string) => string | undefined;
  /**
   * Generates the registry in place of the placeholder, and each set's module.
   *
   * @param this - Vite's plugin context, used to watch the files the registry depends on.
   * @param id - The resolved module id.
   * @returns The module's code, or undefined when it isn't the build step's.
   */
  load: (this: { addWatchFile?: (file: string) => void }, id: string) => Promise<string | undefined>;
}

/** Prefix of the module each set is loaded from, followed by its library and style. */
const setPrefix = `virtual:${pluginName}/set/`;

/**
 * Creates the Vite plugin that converts the project's installed icon libraries when the Studio starts or builds.
 *
 * @param options - Options for the build step.
 * @returns The Vite plugin.
 * @public
 */
export function iconLibraries(options: SanityIconBuildOptions = {}): SanityIconVitePlugin {
  let root = process.cwd();
  let cacheDir: string | undefined = undefined;
  let libraries: DetectedLibrary[] = [];

  return {
    name: pluginName,
    config() {
      return { optimizeDeps: { exclude: [`${pluginName}/sets`] } };
    },
    async configResolved(config) {
      ({ root, cacheDir } = config);
      libraries = await detectLibraries(root, options.custom);
    },
    configureServer(server) {
      const folders = Object.values(options.custom ?? {}).map((folder) => path.resolve(root, folder));
      if (!isDefined(folders)) return;

      server.watcher.add(folders);
      server.watcher.on("all", (_event, file) => {
        if (!folders.some((folder) => file.startsWith(`${folder}${path.sep}`))) return;

        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
      });
    },
    async buildStart() {
      const names = new Map<string, Set<string>>();
      const loaded = await Promise.all(
        libraries.flatMap((library) =>
          library.styles.map(async ({ style }) => {
            const { set } = await loadIconSet(library, style, { root, cacheDir });

            return { library: library.adapter.library, set };
          }),
        ),
      );

      for (const { library, set } of loaded) {
        const libraryNames = names.get(library) ?? new Set<string>();

        for (const icon of set.icons) libraryNames.add(icon.name);
        names.set(library, libraryNames);
      }

      await writeIconNames(names);
    },
    resolveId(id) {
      return id.startsWith(setPrefix) ? `\0${id}` : undefined;
    },
    async load(id) {
      if (isRegistryModule(id)) {
        libraries = await detectLibraries(root, options.custom);

        // Vite treats watched files as imports in development, so folders are watched by the server instead.
        const { files } = listRegistryDependencies(root, libraries);
        for (const file of files) this.addWatchFile?.(file);

        return createRegistryModule(libraries, (key) => `${setPrefix}${key}`);
      }
      if (!id.startsWith(`\0${setPrefix}`)) return undefined;

      const [libraryName, style] = id.slice(`\0${setPrefix}`.length).split("/");
      const library = libraries.find(({ adapter }) => adapter.library === libraryName);
      if (!isDefined(library) || !isDefined(style)) return undefined;

      const { set, report } = await loadIconSet(library, style, { root, cacheDir });
      logger.info(describeReport(library.adapter.label, style, report));

      return `export default JSON.parse(${JSON.stringify(JSON.stringify(set))});`;
    },
  };
}

/**
 * Adds the icon build step to a Vite configuration, for the `vite` option in `sanity.cli.ts` or a framework's own
 * Vite settings.
 *
 * @param options - Options for the build step.
 * @returns A function that extends the Vite configuration.
 * @public
 */
export function withIcons(options: SanityIconBuildOptions = {}) {
  return function extendConfig<Config extends { plugins?: unknown[] }>(config: Config): Config {
    return { ...config, plugins: [...(config.plugins ?? []), iconLibraries(options)] };
  };
}
