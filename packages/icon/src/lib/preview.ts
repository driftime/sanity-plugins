import { isDefined } from "@repo/lib/utils";
import { createElement } from "react";

import { Drawing } from "@/components/drawing";
import { resolveIconDrawing } from "@/lib/nodes";
import type { SanityIcon } from "@/types";

/**
 * Creates preview media for a stored icon, so each document shows its own icon instead of a placeholder.
 *
 * @param value - The stored icon.
 * @returns The media component, or undefined when nothing readable was stored.
 * @public
 */
export function createIconPreview(value: SanityIcon | undefined) {
  const drawing = resolveIconDrawing(value?.node);
  if (!isDefined(drawing)) return undefined;

  return function IconPreview() {
    return createElement(Drawing, { drawing, width: "1em", height: "1em" });
  };
}
