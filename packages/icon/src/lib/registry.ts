import type { IconLibraryInfo } from "@/lib/sets";

/**
 * Loads one converted set, as a module whose default export is the set.
 *
 * @public
 */
export type IconSetLoader = () => Promise<{ default: unknown }>;

/**
 * What the build step generates: a loader for every converted set, and every library it knows.
 *
 * @public
 */
export interface IconRegistry {
  /** Whether the build step generated the registry, rather than the placeholder being used. */
  ready: boolean;
  /** Loaders keyed by library and style, such as `phosphor/bold`. */
  sets: Record<string, IconSetLoader>;
  /** Libraries the build step knows, keyed by identifier. */
  libraries: Record<string, IconLibraryInfo>;
}

/**
 * Builds the key a set is registered under.
 *
 * @param library - Identifier of the library.
 * @param style - Identifier of the style.
 * @returns The key.
 */
export function getIconSetKey(library: string, style: string) {
  return `${library}/${style}`;
}
