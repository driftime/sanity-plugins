/**
 * One color a palette offers.
 *
 * @public
 */
export interface SanityColorEntry<TName extends string = string> {
  /** How the color is named to an author. */
  label: string;
  /** What the color paints, written as hex, RGB, or OKLCH. */
  value: string;
  /** Color paired as text on it, named from the palette. */
  contrast: TName;
  /** Whether to keep the color out of the picker. It may still be named as another color's pairing. */
  hidden?: boolean;
}

/**
 * The colors a palette offers, keyed by the name each one is chosen and stored by.
 *
 * @public
 */
export type SanityColorPalette<TName extends string = string> = Record<TName, SanityColorEntry<TName>>;

/**
 * Declares a palette, tying every `contrast` to a name the palette offers. It returns what it was
 * given: the checking is the point, and needs the keys inferred before it can happen.
 *
 * @param palette - The colors the palette offers.
 * @returns The palette, unchanged.
 * @public
 */
export function defineColorPalette<T extends SanityColorPalette<Extract<keyof T, string>>>(palette: T) {
  return palette;
}
