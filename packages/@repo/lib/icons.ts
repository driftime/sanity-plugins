import type { ComponentProps, ComponentType } from "react";
import { createElement } from "react";

/** Default props for the plugin's own icons. Icons from `@sanity/icons` already match the Studio. */
export const defaultIconProps: ComponentProps<"svg"> = { width: "1em", height: "1em", strokeWidth: 1.5 };

/**
 * Wraps an SVG icon component for use in the Studio.
 *
 * @param icon - The icon to wrap.
 * @param props - Props that override the Studio icon defaults.
 * @returns An icon component.
 */
export function createSanityIcon(icon: ComponentType<ComponentProps<"svg">>, props?: ComponentProps<"svg">) {
  const Icon = icon;

  function SanityIcon() {
    return createElement(Icon, { ...defaultIconProps, ...props });
  }

  return SanityIcon;
}
