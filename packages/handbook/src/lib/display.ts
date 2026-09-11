import { createSanityIcon } from "@repo/lib/icons";
import { convertCase } from "@repo/lib/utils";
import type { ComponentProps, ComponentType, ReactNode } from "react";

/**
 * Resolves the label shown for a schema type, preferring Handbook metadata over the schema's own
 * title and falling back to a title-cased name.
 *
 * @param type - The schema type or field to resolve a label for.
 * @returns The label.
 */
export function resolveTitle(type: { name: string; title?: string; handbook?: { title?: string } }) {
  const { name, title, handbook } = type;

  return handbook?.title ?? title ?? convertCase(name, "title");
}

/**
 * Resolves the description shown for a schema type, preferring Handbook metadata and ignoring the
 * non-string descriptions a schema may carry.
 *
 * @param type - The schema type or field to resolve a description for.
 * @returns The description, or undefined when neither source provides one.
 */
export function resolveDescription(type: { description?: unknown; handbook?: { description?: string } }) {
  const { description, handbook } = type;

  return handbook?.description ?? (typeof description === "string" ? description : undefined);
}

/**
 * Narrows a schema type's icon to a renderable component, discarding the string form a schema may
 * carry instead. A consumer's icon is redrawn at the plugin's own weight, so it sits beside the
 * built-in ones rather than at its own library's default size.
 *
 * @param type - The schema type to read an icon from.
 * @returns The icon component, or undefined when none is set.
 */
export function resolveIcon(type: { icon?: ReactNode | ComponentType<ComponentProps<"svg">> }) {
  return typeof type.icon === "function" ? createSanityIcon(type.icon) : undefined;
}
