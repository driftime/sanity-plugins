import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { formatOklch, parseOklch } from "@/lib/oklch";
import { formatHex, formatRgb, parseHex, parseRgb } from "@/lib/srgb";

/**
 * A color in every supported format.
 *
 * @public
 */
export interface SanityColorFormats {
  /** Six-digit hex, such as `#ece4d4`. */
  hex: string;
  /** Space-separated RGB, such as `rgb(236 228 212)`. */
  rgb: string;
  /** OKLCH, such as `oklch(0.9209 0.0231 84.59)`. */
  oklch: string;
}

/**
 * Reads a color in any supported format as linear RGB channels, removing stega characters first.
 *
 * @param value - A color as hex, RGB, or OKLCH.
 * @returns The red, green, and blue channels, or undefined when the color can't be read.
 */
export function parseChannels(value: string | undefined) {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  return parseHex(cleaned) ?? parseRgb(cleaned) ?? parseOklch(cleaned);
}

/**
 * Reads a color in any supported format and returns it in every format, removing stega characters
 * first. Colors outside the sRGB gamut are clamped to its nearest edge.
 *
 * @param value - A color as hex, RGB, or OKLCH.
 * @returns The color in every format, or undefined when it can't be read.
 * @public
 */
export function parseColor(value: string | undefined): SanityColorFormats | undefined {
  const channels = parseChannels(value);
  if (!isDefined(channels)) return undefined;

  const oklch = formatOklch(channels);
  if (!isDefined(oklch)) return undefined;

  return { hex: formatHex(channels), rgb: formatRgb(channels), oklch };
}
