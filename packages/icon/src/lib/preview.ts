import { defaultIconProps } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import { createElement } from "react";

import { Drawing } from "@/components/drawing";
import { resolveIconNode } from "@/lib/nodes";
import type { SanityIcon } from "@/types";

/**
 * Builds the media a stored icon previews with, so a document lists the drawing an author chose
 * rather than one placeholder standing in for every icon alike.
 *
 * @param value - The stored icon.
 * @returns The media component, or undefined when nothing readable was stored.
 * @public
 */
export function createIconPreview(value: SanityIcon | undefined) {
  const node = resolveIconNode(value?.node);
  if (!isDefined(node)) return undefined;

  return function IconPreview() {
    return createElement(Drawing, { node, ...defaultIconProps });
  };
}
