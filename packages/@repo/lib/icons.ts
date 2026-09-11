import type { ComponentProps, ComponentType } from "react";
import { createElement } from "react";

/**
 * Properties the plugin's own icons are drawn with. Icons taken from `@sanity/icons` are left alone,
 * since they already carry the sizing and stroke the rest of the Studio uses.
 */
export const defaultIconProps: ComponentProps<"svg"> = { width: "1em", height: "1em", strokeWidth: 1.5 };

/**
 * Creates a Sanity Studio icon component from an SVG icon.
 *
 * @param icon - The icon component to wrap.
 * @param props - Additional props merged over the default properties a Studio icon is drawn with.
 * @returns A Studio icon component.
 */
export function createSanityIcon(icon: ComponentType<ComponentProps<"svg">>, props?: ComponentProps<"svg">) {
  const Icon = icon;

  function SanityIcon() {
    return createElement(Icon, { ...defaultIconProps, ...props });
  }

  return SanityIcon;
}
