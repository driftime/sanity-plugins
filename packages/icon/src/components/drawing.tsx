// Runs inside a consumer's server components, where the compiler's memo cache hook cannot.
"use no memo";

import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";
import { createElement } from "react";

import type { IconNode } from "@/lib/nodes";
import { iconRootAttributes } from "@/lib/nodes";

export type DrawingProps = Omit<ComponentProps<"svg">, "children"> & { node: IconNode | undefined };

export function Drawing({ node, ...props }: DrawingProps) {
  if (!isDefined(node)) return null;

  return (
    <svg {...iconRootAttributes} aria-hidden="true" {...props}>
      {node.map(([element, attributes], index) => createElement(element, { ...attributes, key: String(index) }))}
    </svg>
  );
}
