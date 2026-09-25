import { isDefined } from "@repo/lib/utils";
import { createElement } from "react";

import { Swatch } from "@/components/swatch";

/**
 * Creates preview media for a stored color, so each document shows its own color instead of a placeholder.
 *
 * @param color - The color to show.
 * @returns The media component, or undefined when nothing was chosen.
 */
export function createColorPreview(color: string | undefined) {
  if (!isDefined(color)) return undefined;

  return function ColorPreview() {
    return createElement(Swatch, { color });
  };
}
