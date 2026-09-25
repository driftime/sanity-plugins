/**
 * A color in a palette.
 *
 * @public
 */
export interface SanityColorEntry<TName extends string = string> {
  /** Name shown to authors. */
  label: string;
  /** The color, as hex, RGB, or OKLCH. */
  value: string;
  /** Palette color used for text on this one. */
  contrast: TName;
  /** Whether to hide the color from the picker. It can still be another color's `contrast`. */
  hidden?: boolean;
}

/**
 * Palette colors, keyed by the name each is stored under.
 *
 * @public
 */
export type SanityColorPalette<TName extends string = string> = Record<TName, SanityColorEntry<TName>>;

/**
 * Defines a palette, type-checking that every `contrast` names a color in it.
 *
 * @param palette - The palette colors.
 * @returns The palette, unchanged.
 * @public
 */
export function defineColorPalette<T extends SanityColorPalette<Extract<keyof T, string>>>(palette: T) {
  return palette;
}
