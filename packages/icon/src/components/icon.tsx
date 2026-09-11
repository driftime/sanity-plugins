// Runs inside a consumer's server components, where the compiler's memo cache hook cannot.
"use no memo";

import type { ComponentProps } from "react";

import { Drawing } from "@/components/drawing";
import { resolveIconNode } from "@/lib/nodes";
import type { SanityIcon } from "@/types";

/**
 * Properties for drawing a stored icon, extending an SVG element with the value to read it from.
 *
 * @public
 */
export type SanityIconProps = Omit<ComponentProps<"svg">, "children"> & {
  /** Stored icon to draw. */
  value: SanityIcon | undefined;
};

/**
 * Draws the icon an author chose, taking the shapes from the stored value so nothing has to resolve
 * them against an icon library. Renders nothing when the value is absent or unreadable.
 *
 * @returns The icon, or nothing when there is nothing to draw.
 * @public
 */
export function Icon({ value, ...props }: SanityIconProps) {
  return <Drawing node={resolveIconNode(value?.node)} {...props} />;
}
