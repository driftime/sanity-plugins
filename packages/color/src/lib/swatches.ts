import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import type { AnyString, SanityColorSwatch, SanityColorSwatchName, SanityImagePalette } from "@/types";
import { colorSwatchNames } from "@/types";

/** Matches a color taken from an image, capturing the swatch it names. */
const swatchPattern = /^image:(?<swatch>[a-zA-Z]+)$/u;

/**
 * Reads a color taken from an image, clearing the stega characters a Sanity fetch leaves behind.
 * The prefix is what keeps a swatch apart from a palette color of the same name.
 *
 * @param value - The color to read.
 * @returns The swatch name, or undefined when the color came from somewhere else.
 */
export function resolveColorSwatch(value: SanityColorSwatch | AnyString | undefined) {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  const { swatch } = swatchPattern.exec(cleaned)?.groups ?? {};

  return colorSwatchNames.find((name) => name === swatch);
}

/**
 * Names a swatch as an author's choice of it.
 *
 * @param name - The swatch chosen.
 * @returns The color, ready to store.
 */
export function createColorSwatch(name: SanityColorSwatchName): SanityColorSwatch {
  return `image:${name}`;
}

/**
 * Reads the swatches an image actually yielded, narrowed to those a field offers and listed in the
 * order it names them.
 *
 * @param palette - Palette of the image the field draws from.
 * @param allowed - Swatches the field offers.
 * @returns The swatches carrying a color, each with the color it paints.
 */
export function getAvailableSwatches(palette: SanityImagePalette | undefined, allowed: SanityColorSwatchName[]) {
  return allowed.flatMap((name) => {
    const background = colorSwatchNames.includes(name) ? palette?.[name]?.background : undefined;

    return isDefined(background) ? [{ name, background }] : [];
  });
}
