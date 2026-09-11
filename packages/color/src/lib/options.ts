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
 * Settles what a color field offers. Lists replace what the plugin was given, so one line is the
 * whole answer; the objects beside them merge key by key.
 *
 * @param options - Options the field itself was given.
 * @param config - Configuration the plugin was given.
 * @returns The settings the field runs on.
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
