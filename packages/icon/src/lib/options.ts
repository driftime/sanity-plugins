import type { SanityIconConfig, SanityIconOptions } from "@/plugin";

/**
 * Resolves the icons a field offers. A field's own list replaces the plugin's.
 *
 * @param options - The field's options.
 * @param config - The plugin configuration.
 * @returns The field's settings.
 */
export function resolveIconOptions(options: SanityIconOptions | undefined, config: SanityIconConfig) {
  return {
    icons: options?.icons ?? config.icons,
  };
}
