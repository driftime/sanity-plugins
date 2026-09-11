import { isDefined } from "@repo/lib/utils";

import { parseChannels, parseColor } from "@/lib/formats";
import { getLuminance } from "@/lib/srgb";

/**
 * Contrast each WCAG 2.2 conformance level asks of text, at body size and at large size. Level A is
 * absent because it sets no contrast requirement at all: the rule begins at AA.
 *
 */
export const contrastStandards = {
  AA: { body: 4.5, large: 3 },
  AAA: { body: 7, large: 4.5 },
} as const;

/**
 * What a pairing is measured against, or `off` to measure nothing. There is no setting between the
 * two: a standard either applies, in which case what it rejects is rejected, or it does not.
 *
 * @public
 */
export type SanityColorStandard = "off" | keyof typeof contrastStandards;

/**
 * How a pairing measures up, being readable everywhere, readable only at large sizes, or not
 * readable at all.
 *
 * @public
 */
export type SanityColorVerdict = "pass" | "large" | "fail";

/**
 * Measures the contrast between two colors against the WCAG ratio. Each is read in whichever form
 * it was written, so a palette color and one an author typed weigh the same.
 *
 * @param first - Color written as hex, RGB, or OKLCH.
 * @param second - The color placed against it.
 * @returns The ratio, or undefined when either color cannot be read.
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
 * Picks whichever of black or white reads better on a color, matching what `contrast-color()`
 * settles on in CSS, including its preference for white when the two are equal.
 *
 * @param value - Color written as hex, RGB, or OKLCH.
 * @returns The more readable of the two, in every form.
 */
export function getBestContrastColor(value: string | undefined) {
  const onWhite = getContrastRatio(value, "#ffffff") ?? 0;
  const onBlack = getContrastRatio(value, "#000000") ?? 0;

  return parseColor(onWhite >= onBlack ? "#ffffff" : "#000000");
}

/**
 * Judges a pairing against a conformance level, so the badge an author sees and the rule that stops
 * a document being published cannot reach different conclusions about the same two colors.
 *
 * @param ratio - The measured contrast ratio.
 * @param standard - The conformance level to judge against.
 * @returns The verdict.
 * @public
 */
export function getContrastVerdict(ratio: number, standard: Exclude<SanityColorStandard, "off">): SanityColorVerdict {
  const { body, large } = contrastStandards[standard];

  if (ratio >= body) return "pass";

  return ratio >= large ? "large" : "fail";
}
