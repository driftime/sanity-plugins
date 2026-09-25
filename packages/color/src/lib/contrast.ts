import { isDefined } from "@repo/lib/utils";

import { parseChannels, parseColor } from "@/lib/formats";
import { getLuminance } from "@/lib/srgb";

/** Contrast WCAG 2.2 requires for body and large text at each level. Level A has no contrast requirement. */
export const contrastStandards = {
  AA: { body: 4.5, large: 3 },
  AAA: { body: 7, large: 4.5 },
} as const;

/**
 * Conformance level to measure pairings against, or `off` to skip measuring.
 *
 * @public
 */
export type SanityColorStandard = "off" | keyof typeof contrastStandards;

/**
 * Result of measuring a pairing: readable at any size, readable only at large sizes, or unreadable.
 *
 * @public
 */
export type SanityColorVerdict = "pass" | "large" | "fail";

/**
 * Measures the WCAG contrast ratio between two colors, in any supported format.
 *
 * @param first - A color as hex, RGB, or OKLCH.
 * @param second - The other color.
 * @returns The ratio, or undefined when either color can't be read.
 * @public
 */
export function getContrastRatio(first: string | undefined, second: string | undefined) {
  const firstChannels = parseChannels(first);
  const secondChannels = parseChannels(second);
  if (!isDefined(firstChannels) || !isDefined(secondChannels)) return undefined;

  const firstLuminance = getLuminance(firstChannels);
  const secondLuminance = getLuminance(secondChannels);
  if (!isDefined(firstLuminance) || !isDefined(secondLuminance)) return undefined;

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Picks black or white, whichever contrasts more with a color. This matches CSS `contrast-color()`,
 * including its preference for white on a tie.
 *
 * @param value - A color as hex, RGB, or OKLCH.
 * @returns Black or white, in every format.
 */
export function getBestContrastColor(value: string | undefined) {
  const onWhite = getContrastRatio(value, "#ffffff") ?? 0;
  const onBlack = getContrastRatio(value, "#000000") ?? 0;

  return parseColor(onWhite >= onBlack ? "#ffffff" : "#000000");
}

/**
 * Judges a contrast ratio against a conformance level. The Studio and the publishing rule both use this,
 * so they always agree.
 *
 * @param ratio - The contrast ratio.
 * @param standard - The conformance level.
 * @returns The verdict.
 * @public
 */
export function getContrastVerdict(ratio: number, standard: Exclude<SanityColorStandard, "off">): SanityColorVerdict {
  const { body, large } = contrastStandards[standard];

  if (ratio >= body) return "pass";

  return ratio >= large ? "large" : "fail";
}
