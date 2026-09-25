import {
  defaultCustomBackground,
  defaultCustomText,
  defaultPickers,
  defaultSources,
  defaultStandard,
} from "@/config/defaults";
import type { SanityColorConfig, SanityColorOptions } from "@/plugin";
import { colorSwatchNames } from "@/types";

/**
 * Resolves a color field's settings. A field's own lists replace the plugin's, while settings objects
 * merge key by key.
 *
 * @param options - The field's options.
 * @param config - The plugin configuration.
 * @returns The field's settings.
 */
export function resolveColorOptions(options: SanityColorOptions | undefined, config: SanityColorConfig) {
  return {
    pickers: options?.pickers ?? config.pickers ?? [...defaultPickers],
    sources: options?.sources ?? config.sources ?? [...defaultSources],
    colors: options?.colors,
    image: {
      field: options?.image?.field ?? config.image?.field,
      swatches: options?.image?.swatches ?? config.image?.swatches ?? [...colorSwatchNames],
    },
    custom: {
      initial: {
        background:
          options?.custom?.initial?.background ?? config.custom?.initial?.background ?? defaultCustomBackground,
        text: options?.custom?.initial?.text ?? config.custom?.initial?.text ?? defaultCustomText,
      },
    },
    preview: {
      text: options?.preview?.text ?? config.preview?.text,
    },
    standard: options?.standard ?? config.standard ?? defaultStandard,
  };
}
