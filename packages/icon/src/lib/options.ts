import type { SanityIconConfig, SanityIconOptions } from "@/plugin";

/**
 * Settles what an icon field offers. The list says what is on and replaces whatever the plugin was
 * given, so one line tells you the whole answer.
 *
 * @param options - Options the field itself was given.
 * @param config - Configuration the plugin was given.
 * @returns The settings the field runs on.
 */
export function resolveIconOptions(options: SanityIconOptions | undefined, config: SanityIconConfig) {
  return {
    icons: options?.icons ?? config.icons,
  };
}
