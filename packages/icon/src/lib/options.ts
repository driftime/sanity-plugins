import { isDefined } from "@repo/lib/utils";

import type { SanityIconConfig, SanityIconOptions, SanityIconSelection } from "@/plugin";

/**
 * Resolves the library, style, and icons a field offers. A field that names a library replaces all three of the
 * plugin's, and one that doesn't uses the plugin's.
 *
 * @param options - The field's options.
 * @param config - The plugin configuration.
 * @returns The field's settings, whose library is undefined when neither the field nor the plugin names one.
 */
export function resolveIconOptions(options: SanityIconOptions | undefined, config: SanityIconConfig | undefined) {
  const { library, style, icons }: Partial<SanityIconSelection> =
    (isDefined(options?.library) ? options : config) ?? {};

  return { library, style, icons };
}
