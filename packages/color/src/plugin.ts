import type { ObjectOptions, ObjectSchemaType, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import type { SanityColorStandard } from "@/lib/contrast";
import type { SanityColorPalette } from "@/lib/palette";
import { createColorType } from "@/schemas/types/color";
import type { SanityColorSwatchName, colorTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    color: SanityColorDefinition;
  }
}

/**
 * A color an author may set.
 *
 * @public
 */
export type SanityColorPicker = "background" | "text";

/**
 * Somewhere the colors a picker offers may come from.
 *
 * @public
 */
export type SanityColorSource = "palette" | "image" | "custom";

/**
 * How the image source behaves. Naming `image` as a source without a field to read is a mistake
 * rather than a quiet no-op, since there would be nothing to offer.
 *
 * @public
 */
export interface SanityColorImage {
  /** Dotted path from the object holding the field to the image swatches are taken from. */
  field?: string;
  /** Swatches the image may offer, in the order they are listed. Every swatch when omitted. */
  swatches?: SanityColorSwatchName[];
}

/**
 * How the preview beneath the pickers behaves.
 *
 * @public
 */
export interface SanityColorPreview {
  /** Words to paint the pairing with. Shown as a specimen of the two letters where none are given. */
  text?: string;
}

/**
 * How the custom source behaves.
 *
 * @public
 */
export interface SanityColorCustom {
  /** Color each picker starts a custom selection from. */
  initial?: SanityColorInitial;
}

/**
 * Color each picker starts a custom selection from.
 *
 * @public
 */
export interface SanityColorInitial {
  /** Color the background picker starts from. `#ffffff` when omitted. */
  background?: string;
  /** Color the text picker starts from. `#000000` when omitted. */
  text?: string;
}

/**
 * Options a color field takes. Each list replaces whatever the plugin was given rather than adding
 * to it, while the objects beside them say only how a thing behaves and are merged key by key.
 *
 * @public
 */
export interface SanityColorOptions<TName extends string = string> extends ObjectOptions {
  /** Colors an author may set. Both when omitted. */
  pickers?: SanityColorPicker[];
  /** Where the colors a picker offers may come from. Palette colors and a custom color when omitted. */
  sources?: SanityColorSource[];
  /** Colors the palette source offers, in the order they are named. Every color when omitted. */
  colors?: TName[];
  /** How the image source behaves. */
  image?: SanityColorImage;
  /** How the custom source behaves. */
  custom?: SanityColorCustom;
  /** How the preview beneath the pickers behaves. */
  preview?: SanityColorPreview;
  /** What a pairing is measured against, or `off` to measure nothing. */
  standard?: SanityColorStandard;
}

/**
 * Shape of a field or array member holding a color, so its options are completed and checked the
 * way a built-in type's are.
 *
 * @public
 */
export interface SanityColorDefinition extends Omit<TypeAliasDefinition<typeof colorTypeName, undefined>, "options"> {
  options?: SanityColorOptions;
}

/**
 * Everything the plugin accepts, all of which may be left out. Without a palette an author is still
 * offered custom colors and any swatches an image yields.
 *
 * @public
 */
export interface SanityColorConfig {
  /** The palette every field offers, as returned by `defineColorPalette`. */
  palette?: SanityColorPalette;
  /** Colors an author may set. Both when omitted. */
  pickers?: SanityColorPicker[];
  /** Where the colors a picker offers may come from. Palette colors and a custom color when omitted. */
  sources?: SanityColorSource[];
  /** How the image source behaves. */
  image?: SanityColorImage;
  /** How the custom source behaves. */
  custom?: SanityColorCustom;
  /** How the preview beneath the pickers behaves. */
  preview?: SanityColorPreview;
  /** What a pairing is measured against, or `off` to measure nothing. */
  standard?: SanityColorStandard;
}

/** Compiled shape of a color field, carrying the options the field itself was given. */
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
 * Creates the color field type for Sanity Studio, offering a palette through a picker that measures
 * every pairing against WCAG as an author chooses it.
 *
 * @param config - Plugin configuration.
 * @returns Sanity plugin definition.
 * @public
 */
export function colorPlugin(config: SanityColorConfig = {}) {
  return plugin(config);
}
