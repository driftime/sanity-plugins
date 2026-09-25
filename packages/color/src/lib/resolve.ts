import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { getBestContrastColor, getContrastRatio } from "@/lib/contrast";
import { parseColor } from "@/lib/formats";
import type { SanityColorFormats } from "@/lib/formats";
import type { SanityColorPalette } from "@/lib/palette";
import { resolveColorSwatch } from "@/lib/swatches";
import type { SanityColor, SanityColorSwatchName } from "@/types";

/**
 * A color ready to use, with its palette name if it has one.
 *
 * @public
 */
export interface SanityResolvedColor extends SanityColorFormats {
  /** Palette name, or undefined for a color from outside the palette. */
  name?: string;
  /** Palette label, or undefined for a color from outside the palette. */
  label?: string;
  /** Image swatch the color came from, if any. */
  swatch?: SanityColorSwatchName;
}

/**
 * A resolved background and text pairing, with its contrast.
 *
 * @public
 */
export interface SanityColorResult {
  /** Background color, or undefined when none was chosen. */
  background?: SanityResolvedColor;
  /** Text color, including the automatic pairing when none was chosen. */
  text?: SanityResolvedColor;
  /** Whether the text is light or dark, for elements that don't inherit the text color. */
  tone?: "light" | "dark";
  /** Contrast between the two, or undefined when there's no pairing to measure. */
  ratio?: number;
}

/**
 * Resolves one stored color, looking up palette names and reading anything else as a color value.
 *
 * @param value - The stored color.
 * @param palette - The palette to look names up in.
 * @param hex - The resolved color, needed only for an image swatch.
 * @returns The color, or undefined when nothing readable was stored.
 */
export function resolveColorValue(
  value: string | undefined,
  palette?: SanityColorPalette,
  hex?: string,
): SanityResolvedColor | undefined {
  const cleaned = stegaClean(value);

  const entry = isDefined(cleaned) ? palette?.[cleaned] : undefined;
  if (isDefined(entry)) {
    const formats = parseColor(entry.value);

    return isDefined(formats) ? { ...formats, name: cleaned, label: entry.label } : undefined;
  }

  const swatch = resolveColorSwatch(cleaned);
  if (isDefined(swatch)) {
    const formats = parseColor(hex);

    return isDefined(formats) ? { ...formats, swatch } : undefined;
  }

  return parseColor(cleaned);
}

/**
 * Resolves the text color, with an automatic pairing when none was chosen: a palette color's `contrast`,
 * or otherwise black or white, whichever contrasts more.
 *
 * @param background - The resolved background.
 * @param text - The stored text color.
 * @param palette - The palette to look names up in.
 * @param hex - The resolved text color, needed only for an image swatch.
 * @returns The text color, or undefined when there's no background.
 */
function resolveTextValue(
  background: SanityResolvedColor | undefined,
  text: string | undefined,
  palette?: SanityColorPalette,
  hex?: string,
) {
  const chosen = resolveColorValue(text, palette, hex);
  if (isDefined(chosen)) return chosen;
  if (!isDefined(background)) return undefined;

  const paired = isDefined(background.name) ? palette?.[background.name]?.contrast : undefined;
  if (isDefined(paired)) return resolveColorValue(paired, palette);

  return getBestContrastColor(background.hex);
}

/**
 * Works out whether a text color is light or dark.
 *
 * @param text - The resolved text color.
 * @returns The tone, or undefined when there's no text color.
 */
function getColorTone(text: SanityResolvedColor | undefined) {
  if (!isDefined(text)) return undefined;

  return getBestContrastColor(text.hex)?.hex === "#000000" ? "light" : "dark";
}

/**
 * Resolves a stored color into a background and text pairing in every format, with its contrast measured.
 *
 * @param color - The stored color.
 * @param palette - The palette to look names up in.
 * @returns The resolved pairing.
 * @public
 */
export function resolveColor(color: SanityColor | undefined, palette?: SanityColorPalette): SanityColorResult {
  const { background: storedBackground, backgroundHex, text: storedText, textHex } = color ?? {};

  const background = resolveColorValue(storedBackground, palette, backgroundHex);
  const text = resolveTextValue(background, storedText, palette, textHex);

  const ratio = isDefined(background) && isDefined(text) ? getContrastRatio(background.hex, text.hex) : undefined;

  return { background, text, tone: getColorTone(text), ratio };
}

/**
 * Creates a resolver bound to a palette, so the site doesn't pass the palette on every call.
 *
 * @param palette - The palette.
 * @returns A resolver that takes only the stored color.
 * @public
 */
export function createColorResolver(palette: SanityColorPalette) {
  return function resolvePaletteColor(color: SanityColor | undefined) {
    return resolveColor(color, palette);
  };
}
