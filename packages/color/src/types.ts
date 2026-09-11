/**
 * Widens a string union without collapsing it, so the names a palette offers still complete while a
 * value from anywhere else is accepted.
 */
export type AnyString = string & NonNullable<unknown>;

/** Type name of the color object. */
export const colorTypeName = "color";

/**
 * Swatches an image offers, ordered by how prominently each one features rather than alphabetically,
 * so a picker lists the colors an author is most likely to want first.
 */
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
 * Name of a swatch in the palette derived for an image.
 *
 * @public
 */
export type SanityColorSwatchName = (typeof colorSwatchNames)[number];

/**
 * One swatch of an image's palette. Mirrors the shape Sanity derives rather than importing it, so a
 * color can be resolved outside the Studio without pulling `sanity` into the page bundle.
 *
 */
export interface SanityImageSwatch {
  /** Color the swatch paints. */
  background: string;
}

/**
 * The palette derived for an image, keyed by swatch name. Every swatch is optional, since the ones
 * an image yields depend on the image.
 *
 */
export type SanityImagePalette = Partial<Record<SanityColorSwatchName, SanityImageSwatch>>;

/**
 * A color taken from an image, named so it cannot be mistaken for a palette color of the same
 * name.
 *
 */
export type SanityColorSwatch = `image:${SanityColorSwatchName}`;

/**
 * A color an author chose: a palette name, an image swatch, or a hex code. Each form identifies
 * itself.
 *
 */
export type SanityColorValue<TName extends string = string> = TName | SanityColorSwatch | AnyString;

/**
 * A color an author chose, holding the background and the text placed on it. Each stores the choice
 * rather than the color it produced, so a palette color follows the palette.
 *
 * @public
 */
export interface SanityColor<TName extends string = string> {
  _type: typeof colorTypeName;
  /** Color painted behind the content, as the author chose it. */
  background?: SanityColorValue<TName>;
  /** What that background resolved to, written only where it names an image swatch. */
  backgroundHex?: string;
  /** Color of the text on it, or nothing to take the pairing the palette sets. */
  text?: SanityColorValue<TName>;
  /** What that text resolved to, written only where it names an image swatch. */
  textHex?: string;
}
