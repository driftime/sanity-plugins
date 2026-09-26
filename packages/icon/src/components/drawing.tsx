// Consumers render this in server components, where the compiler's memo cache hook can't run.
"use no memo";

import { isDefined } from "@repo/lib/utils";
import type { ComponentProps, ReactElement } from "react";
import { createElement } from "react";

import type { IconDrawing, IconElement } from "@/lib/nodes";
import { iconSvgAttributes } from "@/lib/nodes";

/**
 * Converts stored attributes to React props, turning a `style` attribute into the object React expects.
 *
 * @param attributes - The stored attributes.
 * @returns The props.
 */
function toProps({ style, ...attributes }: Record<string, string>) {
  if (!isDefined(style)) return attributes;

  const declarations = style.split(";").flatMap((declaration): [string, string][] => {
    const [property = "", ...value] = declaration.split(":");
    const name = property.trim();
    const joined = value.join(":").trim();
    if (!isDefined(name) || !isDefined(joined)) return [];

    const key = name.startsWith("--")
      ? name
      : name
          .replace(/^-ms-/u, "ms-")
          .replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());

    return [[key, joined]];
  });

  return { ...attributes, style: Object.fromEntries(declarations) };
}

/**
 * Draws one element of a stored drawing, with its children.
 *
 * @param child - The element, or text inside one.
 * @param index - Its position among its siblings.
 * @returns The element.
 */
function renderChild(child: IconElement | string, index: number): ReactElement | string {
  if (typeof child === "string") return child;

  const [element, attributes, children] = child;

  return createElement(
    element,
    { ...toProps(attributes), key: String(index) },
    children?.map((nested, position) => renderChild(nested, position)),
  );
}

export type DrawingProps = Omit<ComponentProps<"svg">, "children"> & { drawing: IconDrawing | undefined };

export function Drawing({ drawing, ...props }: DrawingProps) {
  if (!isDefined(drawing)) return null;

  // Stored roots only hold checked attribute names, but their values are text, not React's literal types.
  const root = toProps(drawing.root) as ComponentProps<"svg">;

  return (
    <svg {...iconSvgAttributes} {...root} aria-hidden="true" {...props}>
      {drawing.node.map((child, index) => renderChild(child, index))}
    </svg>
  );
}
