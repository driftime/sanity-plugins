import { contrastStandards, getContrastVerdict } from "@/lib/contrast";
import type { SanityColorStandard, SanityColorVerdict } from "@/lib/contrast";

/**
 * Describes a contrast result in WCAG terms: the ratio, the threshold it's compared with, and what the
 * pairing can be used for.
 *
 * @param ratio - The contrast ratio.
 * @param standard - The conformance level.
 * @returns The verdict and a sentence explaining it.
 */
export function getContrastReport(ratio: number, standard: Exclude<SanityColorStandard, "off">) {
  const { body, large } = contrastStandards[standard];
  const verdict = getContrastVerdict(ratio, standard);
  const measured = `Contrast is ${String(ratio)}:1`;
  const requires = `WCAG 2.2 ${standard} requires`;

  if (verdict === "pass") {
    return {
      verdict,
      detail: `${measured}, above the ${String(body)}:1 ${requires} for body text. Safe at any size.`,
    };
  }

  if (verdict === "large") {
    return {
      verdict,
      detail: `${measured}, below the ${String(body)}:1 ${requires} for body text but above the ${String(large)}:1 for large text. Use it for headings, not paragraphs.`,
    };
  }

  return {
    verdict,
    detail: `${measured}, below the ${String(large)}:1 ${requires} for large text. Unreadable at any size.`,
  };
}

/**
 * Works out the severity to report a verdict at. A pairing readable only at large sizes is a warning at
 * most, because the plugin can't know whether it will be used for body text or headings.
 *
 * @param verdict - The verdict.
 * @returns The severity, or undefined when there's nothing to report.
 */
export function getVerdictSeverity(verdict: SanityColorVerdict) {
  if (verdict === "pass") return undefined;

  return verdict === "large" ? ("warning" as const) : ("error" as const);
}
