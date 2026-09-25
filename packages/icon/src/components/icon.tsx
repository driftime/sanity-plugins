// Consumers render this in server components, where the compiler's memo cache hook can't run.
"use no memo";

import type { ComponentProps } from "react";

import { Drawing } from "@/components/drawing";
import { resolveIconNode } from "@/lib/nodes";
import type { SanityIcon } from "@/types";

/**
 * Props for drawing a stored icon: an SVG element's props plus the stored value.
 *
 * @public
 */
export type SanityIconProps = Omit<ComponentProps<"svg">, "children"> & {
  /** Stored icon to draw. */
  value: SanityIcon | undefined;
};

/**
 * Draws a stored icon from the shapes saved with it, without loading an icon library.
 *
 * @returns The icon, or nothing when the value is missing or unreadable.
 * @public
 */
export function Icon({ value, ...props }: SanityIconProps) {
  return <Drawing node={resolveIconNode(value?.node)} {...props} />;
}
