import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import type { AnyString, SanityColorSwatch, SanityColorSwatchName, SanityImagePalette } from "@/types";
import { colorSwatchNames } from "@/types";

/** Matches a color taken from an image and captures the swatch name. */
const swatchPattern = /^image:(?<swatch>[a-zA-Z]+)$/u;

/**
 * Reads an image swatch color, removing stega characters first. The `image:` prefix keeps swatches
 * apart from palette colors with the same name.
 *
 * @param value - The stored color.
 * @returns The swatch name, or undefined when the color isn't a swatch.
 */
export function resolveColorSwatch(value: SanityColorSwatch | AnyString | undefined) {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  const { swatch } = swatchPattern.exec(cleaned)?.groups ?? {};

  return colorSwatchNames.find((name) => name === swatch);
}

/**
 * Converts a swatch name to its stored form.
 *
 * @param name - The swatch name.
 * @returns The stored color.
 */
export function createColorSwatch(name: SanityColorSwatchName): SanityColorSwatch {
  return `image:${name}`;
}

/**
 * Lists the swatches an image has, limited to those the field allows, in the field's order.
 *
 * @param palette - The image's palette.
 * @param allowed - The swatches the field allows.
 * @returns Each available swatch with its color.
 */
export function getAvailableSwatches(palette: SanityImagePalette | undefined, allowed: SanityColorSwatchName[]) {
  return allowed.flatMap((name) => {
    const background = colorSwatchNames.includes(name) ? palette?.[name]?.background : undefined;

    return isDefined(background) ? [{ name, background }] : [];
  });
}
