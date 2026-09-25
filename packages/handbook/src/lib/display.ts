import { createSanityIcon } from "@repo/lib/icons";
import { convertCase } from "@repo/lib/utils";
import type { ComponentProps, ComponentType, ReactNode } from "react";

/**
 * Works out a schema type's label: its Handbook title, then its schema title, then its name in title case.
 *
 * @param type - The schema type or field.
 * @returns The label.
 */
export function resolveTitle(type: { name: string; title?: string; handbook?: { title?: string } }) {
  const { name, title, handbook } = type;

  return handbook?.title ?? title ?? convertCase(name, "title");
}

/**
 * Works out a schema type's description, preferring its Handbook description and ignoring non-string
 * schema descriptions.
 *
 * @param type - The schema type or field.
 * @returns The description, or undefined when there isn't one.
 */
export function resolveDescription(type: { description?: unknown; handbook?: { description?: string } }) {
  const { description, handbook } = type;

  return handbook?.description ?? (typeof description === "string" ? description : undefined);
}

/**
 * Gets a schema type's icon as a component, redrawn at the plugin's icon size to match the built-in icons.
 * String icons are ignored.
 *
 * @param type - The schema type.
 * @returns The icon component, or undefined when there isn't one.
 */
export function resolveIcon(type: { icon?: ReactNode | ComponentType<ComponentProps<"svg">> }) {
  return typeof type.icon === "function" ? createSanityIcon(type.icon) : undefined;
}
