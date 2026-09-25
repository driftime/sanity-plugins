/** Accepts any string without losing a union's autocomplete suggestions. */
export type AnyString = string & NonNullable<unknown>;

/** Schema type name of the color object. */
export const colorTypeName = "color";

/** Image swatch names, ordered by prominence so the most useful appear first in the picker. */
export const colorSwatchNames = [
  "dominant",
  "vibrant",
  "muted",
  "lightVibrant",
  "lightMuted",
  "darkVibrant",
  "darkMuted",
] as const;

/**
 * Name of a swatch in an image's palette.
 *
 * @public
 */
export type SanityColorSwatchName = (typeof colorSwatchNames)[number];

/**
 * One swatch in an image's palette. Mirrors Sanity's own type so colors can be resolved on the site
 * without importing `sanity`.
 */
export interface SanityImageSwatch {
  /** The swatch color. */
  background: string;
}

/** An image's palette, keyed by swatch name. Every swatch is optional, since not every image has all of them. */
export type SanityImagePalette = Partial<Record<SanityColorSwatchName, SanityImageSwatch>>;

/** An image swatch color, prefixed so it can't be confused with a palette color of the same name. */
export type SanityColorSwatch = `image:${SanityColorSwatchName}`;

/** A stored color: a palette name, an image swatch, or a hex code. */
export type SanityColorValue<TName extends string = string> = TName | SanityColorSwatch | AnyString;

/**
 * A stored color: the background and the text on it. Each stores the author's choice rather than the
 * resulting color, so palette colors follow changes to the palette.
 *
 * @public
 */
export interface SanityColor<TName extends string = string> {
  _type: typeof colorTypeName;
  /** Background color, as chosen. */
  background?: SanityColorValue<TName>;
  /** Hex value of the background, set only for an image swatch. */
  backgroundHex?: string;
  /** Text color, or undefined to use the automatic pairing. */
  text?: SanityColorValue<TName>;
  /** Hex value of the text color, set only for an image swatch. */
  textHex?: string;
}
