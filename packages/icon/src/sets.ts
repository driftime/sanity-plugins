import type { IconRegistry } from "@/lib/registry";

/**
 * Converted icon sets for the Studio. This is a placeholder: the build step replaces the module with the sets it
 * converted from the project's installed libraries, so a Studio built without it finds no libraries.
 *
 * @public
 */
export const iconRegistry: IconRegistry = { ready: false, sets: {}, libraries: {} };
