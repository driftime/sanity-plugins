import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { formatOklch, parseOklch } from "@/lib/oklch";
import { formatHex, formatRgb, parseHex, parseRgb } from "@/lib/srgb";

/**
 * A color in each of the forms it might be wanted in, so a consumer paints CSS with one, writes an
 * email with another, and never converts anything itself.
 *
 * @public
 */
export interface SanityColorFormats {
  /** Six digit hex, as `#ece4d4`. */
  hex: string;
  /** Space-separated RGB, as `rgb(236 228 212)`. */
  rgb: string;
  /** OKLCH, as `oklch(0.9209 0.0231 84.59)`. */
  oklch: string;
}

/**
 * Reads a color written in any form this plugin accepts as its three linear channels, clearing the
 * stega characters a Sanity fetch leaves behind.
 *
 * @param value - Color written as hex, RGB, or OKLCH.
 * @returns The red, green, and blue channels, or undefined when the color cannot be read.
 */
export function parseChannels(value: string | undefined) {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  return parseHex(cleaned) ?? parseRgb(cleaned) ?? parseOklch(cleaned);
}

/**
 * Reads a color written in any form this plugin accepts, clearing the stega characters a Sanity
 * fetch leaves behind. A color beyond what a display can show is brought back to its nearest
 * edge, so every form returned is one a browser will paint.
 *
 * @param value - Color written as hex, RGB, or OKLCH.
 * @returns The color in every form, or undefined when it cannot be read.
 * @public
 */
export function parseColor(value: string | undefined): SanityColorFormats | undefined {
  const channels = parseChannels(value);
  if (!isDefined(channels)) return undefined;

  const oklch = formatOklch(channels);
  if (!isDefined(oklch)) return undefined;

  return { hex: formatHex(channels), rgb: formatRgb(channels), oklch };
}
