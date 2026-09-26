import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Worker } from "node:worker_threads";

import { isDefined, isRecord } from "@repo/lib/utils";

import { createCustomAdapter } from "@/build/adapters/custom";
import { iconAdapters } from "@/build/adapters/index";
import type { IconAdapter } from "@/build/adapters/types";
import type { SourceIcon } from "@/build/convert";
import { convertIcon } from "@/build/convert";
import type { InstalledPackage } from "@/build/packages";
import { findPackage, readDeclaredPackages, readJson, readPluginBuild } from "@/build/packages";
import type { IconSet, IconSetIcon } from "@/lib/sets";
import { parseIconSet } from "@/lib/sets";

/** What happened converting a set, for the build's log. */
export interface IconSetReport {
  /** Icons the library ships in the style. */
  total: number;
  /** Icons skipped, with why. */
  skipped: { name: string; reason: string }[];
  /** Time the conversion took, in milliseconds, or 0 when it came from the cache. */
  duration: number;
}

/** One installed style of a library, and the package it's read from. */
export interface DetectedStyle {
  /** Identifier of the style. */
  style: string;
  /** The package the style is read from. */
  installed: InstalledPackage;
}

/** A library found in the project, and where each of its styles is installed. */
export interface DetectedLibrary {
  /** How to read the library. */
  adapter: IconAdapter;
  /** The styles the project has installed, empty when it has none. */
  styles: DetectedStyle[];
  /** Whether the project's `package.json` lists the package the library is read from, installed or not. */
  listed: boolean;
  /**
   * Another package of the library the project lists, such as its React version, or undefined when there's none or the
   * library's own package is listed.
   */
  sitePackage?: string;
  /** Folder of the project's own icons, relative to the project, or undefined for a known library. */
  folder?: string;
}

/** Where the build step reads libraries from and caches conversions. */
export interface IconSetContext {
  /** The project folder. */
  root: string;
  /** Folder for cached conversions, or undefined to convert every time. */
  cacheDir: string | undefined;
}

/**
 * Finds every library the project can use: known libraries whose package it lists and has installed, and its own icon
 * folders. Only listed packages count, so a package that's only there because another one depends on it is ignored.
 *
 * @param root - The project folder.
 * @param custom - The project's own icon folders, keyed by identifier.
 * @returns Every library the build step knows, with where it's installed.
 */
export async function detectLibraries(root: string, custom: Record<string, string> = {}): Promise<DetectedLibrary[]> {
  const declared = await readDeclaredPackages(root);

  const known = await Promise.all(
    iconAdapters.map(async (adapter) => {
      const { packageName, packagePrefix, packagePattern } = adapter;

      if (isDefined(packagePrefix)) {
        const names = [...declared].filter((name) => name.startsWith(packagePrefix)).toSorted();
        const found = await Promise.all(
          names.map(async (name) => {
            const installed = await findPackage(root, name);

            return isDefined(installed) ? [{ style: name.slice(packagePrefix.length), installed }] : [];
          }),
        );

        return { adapter, styles: found.flat(), listed: isDefined(names) };
      }

      const listed = isDefined(packageName) && declared.has(packageName);
      const installed = listed ? await findPackage(root, packageName) : undefined;
      const styles = isDefined(installed) ? adapter.styles.map((style) => ({ style, installed })) : [];
      const sitePackage =
        listed || !isDefined(packagePattern)
          ? undefined
          : [...declared].toSorted().find((name) => packagePattern.test(name));

      return { adapter, styles, listed, ...(isDefined(sitePackage) && { sitePackage }) };
    }),
  );

  const folders = Object.entries(custom).map(([library, folder]) => ({
    adapter: createCustomAdapter(library, folder),
    listed: true,
    folder,
    styles: [
      { style: "default", installed: { name: library, directory: path.resolve(root, folder), version: "custom" } },
    ],
  }));

  return [...known, ...folders];
}

/**
 * Picks the root most icons in a set share, so only the others need their own.
 *
 * @param icons - The converted icons.
 * @returns The most common root.
 */
function findCommonRoot(icons: (IconSetIcon & { root: NonNullable<IconSetIcon["root"]> })[]) {
  const counts = new Map<string, { root: IconSet["root"]; count: number }>();

  for (const { root } of icons) {
    const key = JSON.stringify(root);
    counts.set(key, { root, count: (counts.get(key)?.count ?? 0) + 1 });
  }

  const [common] = [...counts.values()].toSorted((first, second) => second.count - first.count);

  return common?.root ?? {};
}

/**
 * Checks whether a value is an icon as a worker read it from its library.
 *
 * @param value - The value to check.
 * @returns True if the value is a source icon.
 */
function isSourceIcon(value: unknown): value is SourceIcon {
  if (!isRecord(value)) return false;

  const { name, keywords, svg } = value;

  return (
    typeof name === "string" &&
    Array.isArray(keywords) &&
    keywords.every((keyword) => typeof keyword === "string") &&
    typeof svg === "string"
  );
}

/**
 * Reads a library's icons in a fresh worker thread. A long-running bundler keeps every module it has imported, so an
 * icon package updated in place would otherwise be read from the old copy.
 *
 * @param library - The library and where it's installed.
 * @param style - The style to read.
 * @param root - The project folder.
 * @returns The icons as the library ships them.
 */
async function readSources(library: DetectedLibrary, style: string, root: string) {
  const { adapter, folder } = library;
  const installed = library.styles.find((candidate) => candidate.style === style)?.installed;
  if (!isDefined(installed)) return [];

  const worker = new Worker(new URL("read-worker.js", import.meta.url), {
    workerData: { library: adapter.library, folder, style, root, directory: installed.directory },
    // Libraries' components render with React's production build, which writes the same markup without warnings.
    env: { ...process.env, NODE_ENV: "production" },
  });

  try {
    const received: unknown[] = await once(worker, "message");
    const [sources] = received;

    return Array.isArray(sources) ? sources.filter((source) => isSourceIcon(source)) : [];
  } finally {
    void worker.terminate();
  }
}

/**
 * Converts one style of a library into a set, reporting anything skipped.
 *
 * @param library - The library and where it's installed.
 * @param style - The style to convert.
 * @param root - The project folder.
 * @returns The set and its report.
 */
async function convertIconSet(library: DetectedLibrary, style: string, root: string) {
  const { adapter } = library;
  const started = performance.now();
  const sources = await readSources(library, style, root);

  const report: IconSetReport = { total: sources.length, skipped: [], duration: 0 };
  const converted: (IconSetIcon & { root: NonNullable<IconSetIcon["root"]> })[] = [];

  for (const source of sources) {
    const { icon, problem } = convertIcon(source);

    if (isDefined(icon)) converted.push(icon);
    else if (isDefined(problem)) report.skipped.push({ name: source.name, reason: problem });
  }

  const common = findCommonRoot(converted);
  const set: IconSet = {
    library: adapter.library,
    style,
    root: common,
    icons: converted.map(({ root: iconRoot, ...icon }) =>
      JSON.stringify(iconRoot) === JSON.stringify(common) ? icon : { ...icon, root: iconRoot },
    ),
  };

  report.duration = Math.round(performance.now() - started);

  return { set, report };
}

/**
 * Reads a cached conversion's report.
 *
 * @param value - The cached report.
 * @returns The report, or undefined when the value isn't one.
 */
function parseReport(value: unknown): IconSetReport | undefined {
  if (!isRecord(value) || typeof value["total"] !== "number" || !Array.isArray(value["skipped"])) return undefined;

  const skipped = value["skipped"].flatMap((entry: unknown) =>
    isRecord(entry) && typeof entry["name"] === "string" && typeof entry["reason"] === "string"
      ? [{ name: entry["name"], reason: entry["reason"] }]
      : [],
  );

  return { total: value["total"], skipped, duration: 0 };
}

/**
 * Loads a converted set, from the cache when the same package version was converted before.
 *
 * @param library - The library and where it's installed.
 * @param style - The style to load.
 * @param context - The project folder and cache folder.
 * @returns The set and its report.
 */
export async function loadIconSet(library: DetectedLibrary, style: string, context: IconSetContext) {
  const { adapter, folder } = library;
  const installed = library.styles.find((candidate) => candidate.style === style)?.installed;
  const cacheable = isDefined(context.cacheDir) && isDefined(installed) && !isDefined(folder);
  const cacheFile =
    cacheable && isDefined(context.cacheDir)
      ? path.join(
          context.cacheDir,
          "driftime-icon",
          `${adapter.library}-${style}-${installed.name.replaceAll(/[@/]/gu, "_")}-${installed.version}-${await readPluginBuild()}.json`,
        )
      : undefined;

  if (isDefined(cacheFile)) {
    const cached = await readJson(cacheFile);
    const set = isRecord(cached) ? parseIconSet(cached["set"]) : undefined;
    const report = isRecord(cached) ? parseReport(cached["report"]) : undefined;

    if (isDefined(set) && isDefined(report)) return { set, report };
  }

  const { set, report } = await convertIconSet(library, style, context.root);

  if (isDefined(cacheFile)) {
    await mkdir(path.dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, JSON.stringify({ set, report }));
  }

  return { set, report };
}

/**
 * Lists the files the registry is generated from, so the bundler regenerates it when a library is installed, removed,
 * or updated, instead of keeping a cached copy.
 *
 * @param root - The project folder.
 * @param libraries - Every library the build step knows.
 * @returns The files, and the folders of the project's own icons.
 */
export function listRegistryDependencies(root: string, libraries: DetectedLibrary[]) {
  const files = [path.join(root, "package.json")];
  const folders: string[] = [];

  for (const { styles, folder } of libraries) {
    for (const { installed } of styles) {
      if (isDefined(folder)) folders.push(installed.directory);
      else files.push(path.join(installed.directory, "package.json"));
    }
  }

  return { files, folders };
}

/**
 * Summarises a set's conversion for the build's log, listing the first few icons it skipped and why.
 *
 * @param label - Readable name of the library.
 * @param style - The style converted.
 * @param report - What happened.
 * @returns The summary, one line per skipped icon after the first.
 */
export function describeReport(label: string, style: string, report: IconSetReport) {
  const { total, skipped, duration } = report;
  const kept = total - skipped.length;
  const count = `${kept.toLocaleString("en-US")} ${kept === 1 ? "icon" : "icons"}`;
  const timing = duration > 0 ? `converted in ${duration.toLocaleString("en-US")} ms` : "loaded from the cache";
  const summary = `${label} (\`${style}\`): ${count} ${timing}`;
  if (!isDefined(skipped)) return `${summary}.`;

  const shown = skipped.slice(0, 5).map(({ name, reason }) => `  \`${name}\` ${reason}.`);
  const hidden = skipped.length - shown.length;
  const more = hidden > 0 ? [`  …and ${hidden.toLocaleString("en-US")} more.`] : [];

  return [`${summary}, ${skipped.length.toLocaleString("en-US")} skipped:`, ...shown, ...more].join("\n");
}
