import { contrastStandards, getContrastVerdict } from "@/lib/contrast";
import type { SanityColorStandard, SanityColorVerdict } from "@/lib/contrast";

/**
 * Describes how a pairing measures up, in the terms the standard uses. Every verdict is worded the
 * same way: what it measured, which threshold that sits against, and what the pairing may be used
 * for.
 *
 * @param ratio - The measured contrast ratio.
 * @param standard - The conformance level being measured against.
 * @returns The verdict and the sentence explaining it.
 */
export function getContrastReport(ratio: number, standard: Exclude<SanityColorStandard, "off">) {
  const { body, large } = contrastStandards[standard];
  const verdict = getContrastVerdict(ratio, standard);
  const measured = `Measures ${String(ratio)}:1`;
  const asks = `WCAG 2.2 ${standard} asks`;

  if (verdict === "pass") {
    return {
      verdict,
      detail: `${measured}, above the ${String(body)}:1 ${asks} of body text. Safe at any size.`,
    };
  }

  if (verdict === "large") {
    return {
      verdict,
      detail: `${measured}, below the ${String(body)}:1 ${asks} of body text but above the ${String(large)}:1 it asks of large text. Use it for headings, not paragraphs.`,
    };
  }

  return {
    verdict,
    detail: `${measured}, below the ${String(large)}:1 ${asks} of large text. Unreadable however large the text is set.`,
  };
}

/**
 * Decides the severity a verdict is reported at. A pairing legible only as a heading never rises
 * above a warning, since the plugin cannot know whether the color will carry body copy or a heading.
 *
 * @param verdict - How the pairing measured up.
 * @returns The severity to report at, or undefined when there is nothing to report.
 */
export function getVerdictSeverity(verdict: SanityColorVerdict) {
  if (verdict === "pass") return undefined;

  return verdict === "large" ? ("warning" as const) : ("error" as const);
}
