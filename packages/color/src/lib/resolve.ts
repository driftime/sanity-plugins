import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { getBestContrastColor, getContrastRatio } from "@/lib/contrast";
import { parseColor } from "@/lib/formats";
import type { SanityColorFormats } from "@/lib/formats";
import type { SanityColorPalette } from "@/lib/palette";
import { resolveColorSwatch } from "@/lib/swatches";
import type { SanityColor, SanityColorSwatchName } from "@/types";

/**
 * A color ready to paint with, carrying the palette name it came from where it has one.
 *
 * @public
 */
export interface SanityResolvedColor extends SanityColorFormats {
  /** Name the palette offers it under, or undefined for a color chosen outside the palette. */
  name?: string;
  /** How the palette names it to an author, or undefined for a color chosen outside the palette. */
  label?: string;
  /** Swatch it was taken from, where it came from an image. */
  swatch?: SanityColorSwatchName;
}

/**
 * A pairing ready to paint with, alongside how it measures up.
 *
 * @public
 */
export interface SanityColorResult {
  /** Color painted behind the content, or undefined when none was chosen. */
  background?: SanityResolvedColor;
  /** Color the text paints, including the pairing applied where an author chose none. */
  text?: SanityResolvedColor;
  /** Whether the text paints light or dark, for anything sitting over the color without inheriting from it. */
  tone?: "light" | "dark";
  /** Contrast between the two, or undefined when there is no pairing to measure. */
  ratio?: number;
}

/**
 * Resolves one stored color, following a palette name to what it paints and reading anything else
 * as the color it already is.
 *
 * @param value - The color as the author chose it.
 * @param palette - The palette to resolve a name against.
 * @param hex - What it resolved to, needed only where it names an image swatch.
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
 * Resolves the color text paints in, standing in for the pairing applied where an author chose
 * none. A palette color names its own pairing; anything else takes whichever of black or white
 * reads better on it.
 *
 * @param background - The resolved background.
 * @param text - The stored text color.
 * @param palette - The palette to resolve a name against.
 * @param hex - What the text resolved to, needed only where it names an image swatch.
 * @returns The color, or undefined when there is no background to sit on.
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
 * Reads whether text paints light or dark, for anything standing over a color without inheriting
 * from it.
 *
 * @param text - The resolved text color.
 * @returns The tone, or undefined when there is no text color to read.
 */
function getColorTone(text: SanityResolvedColor | undefined) {
  if (!isDefined(text)) return undefined;

  return getBestContrastColor(text.hex)?.hex === "#000000" ? "light" : "dark";
}

/**
 * Resolves a stored color into the pairing a page paints, in every form it might be wanted in, with
 * the contrast between the two already measured.
 *
 * @param color - The stored color.
 * @param palette - The palette its names are resolved against.
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
 * Binds a resolver to a palette, so a site reads a stored color without naming the palette at every
 * call. The palette is still passed, once, where it is defined.
 *
 * @param palette - The palette names are resolved against.
 * @returns A resolver taking only the stored color.
 * @public
 */
export function createColorResolver(palette: SanityColorPalette) {
  return function resolvePaletteColor(color: SanityColor | undefined) {
    return resolveColor(color, palette);
  };
}
