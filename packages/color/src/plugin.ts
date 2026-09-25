import type { ObjectOptions, ObjectSchemaType, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import type { SanityColorStandard } from "@/lib/contrast";
import type { SanityColorPalette } from "@/lib/palette";
import { createColorType } from "@/schemas/types/color";
import type { SanityColorSwatchName, colorTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    /** Definition of a field of type `color`. */
    color: SanityColorDefinition;
  }
}

/**
 * A color authors can set.
 *
 * @public
 */
export type SanityColorPicker = "background" | "text";

/**
 * A source of colors for the pickers.
 *
 * @public
 */
export type SanityColorSource = "palette" | "image" | "custom";

/**
 * Settings for the image source. Using `image` as a source without a `field` logs a warning, since
 * there's no image to take swatches from.
 *
 * @public
 */
export interface SanityColorImage {
  /** Dotted path from the object holding the color field to the image to take swatches from. */
  field?: string;
  /** Image swatches authors can choose from, in the order listed. Defaults to every swatch. */
  swatches?: SanityColorSwatchName[];
}

/**
 * Settings for the preview below the pickers.
 *
 * @public
 */
export interface SanityColorPreview {
  /** Text to show the pairing with. Defaults to an "Aa" sample. */
  text?: string;
}

/**
 * Settings for the custom source.
 *
 * @public
 */
export interface SanityColorCustom {
  /** Starting colors for a custom selection. */
  initial?: SanityColorInitial;
}

/**
 * Starting colors for a custom selection.
 *
 * @public
 */
export interface SanityColorInitial {
  /** Starting background. Defaults to `#ffffff`. */
  background?: string;
  /** Starting text color. Defaults to `#000000`. */
  text?: string;
}

/**
 * Options for a color field. A field's own lists replace the plugin's, while settings objects merge key by key.
 *
 * @public
 */
export interface SanityColorOptions<TName extends string = string> extends ObjectOptions {
  /** Colors authors can set. Defaults to both. */
  pickers?: SanityColorPicker[];
  /** Where the pickers' colors come from. Defaults to the palette and custom colors. */
  sources?: SanityColorSource[];
  /** Palette colors authors can choose from, in the order listed. Defaults to every color. */
  colors?: TName[];
  /** Settings for the image source. */
  image?: SanityColorImage;
  /** Settings for the custom source. */
  custom?: SanityColorCustom;
  /** Settings for the preview below the pickers. */
  preview?: SanityColorPreview;
  /** Conformance level to measure pairings against, or `off` to skip measuring. */
  standard?: SanityColorStandard;
}

/**
 * Definition of a field or array member holding a color, so its options are type-checked like a
 * built-in type's.
 *
 * @public
 */
export interface SanityColorDefinition extends Omit<TypeAliasDefinition<typeof colorTypeName, undefined>, "options"> {
  /** Options for the field. */
  options?: SanityColorOptions;
}

/**
 * Plugin configuration. Every option is optional; without a palette, authors can still choose custom
 * colors and image swatches.
 *
 * @public
 */
export interface SanityColorConfig {
  /** Palette offered to every field, as returned by `defineColorPalette`. */
  palette?: SanityColorPalette;
  /** Colors authors can set. Defaults to both. */
  pickers?: SanityColorPicker[];
  /** Where the pickers' colors come from. Defaults to the palette and custom colors. */
  sources?: SanityColorSource[];
  /** Settings for the image source. */
  image?: SanityColorImage;
  /** Settings for the custom source. */
  custom?: SanityColorCustom;
  /** Settings for the preview below the pickers. */
  preview?: SanityColorPreview;
  /** Conformance level to measure pairings against, or `off` to skip measuring. */
  standard?: SanityColorStandard;
}

/** Compiled color field type, with the field's own options. */
export interface ColorSchemaType extends ObjectSchemaType {
  options?: SanityColorOptions;
}

const plugin = definePlugin<SanityColorConfig>((config) => {
  const { palette } = config;

  return {
    name: pluginName,
    schema: {
      types: [createColorType(palette ?? {}, config)],
    },
  };
});

/**
 * Adds a color field type to Sanity Studio, with a picker that checks each pairing's contrast against
 * WCAG as authors choose it.
 *
 * @param config - The plugin configuration.
 * @returns The plugin.
 * @public
 */
export function colorPlugin(config: SanityColorConfig = {}) {
  return plugin(config);
}
