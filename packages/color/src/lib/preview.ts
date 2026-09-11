import { isDefined } from "@repo/lib/utils";
import { createElement } from "react";

import { Swatch } from "@/components/swatch";

/**
 * Builds the media a stored color previews with, so a document lists the color an author chose
 * rather than one placeholder standing in for every color alike.
 *
 * @param color - The color the swatch paints.
 * @returns The media component, or undefined when nothing was chosen.
 */
export function createColorPreview(color: string | undefined) {
  if (!isDefined(color)) return undefined;

  return function ColorPreview() {
    return createElement(Swatch, { color });
  };
}
