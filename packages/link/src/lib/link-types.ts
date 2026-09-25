import { linkTypes } from "@/config/destinations";
import type { SanityLinkDestination } from "@/types";
import { linkMarkTypeName } from "@/types";

/**
 * Finds the link type for a stored destination value.
 *
 * @param name - The stored value.
 * @returns The link type, or undefined when the value isn't recognised.
 */
export function getLinkType(name: string | undefined) {
  return linkTypes.find((linkType) => linkType.name === name);
}

/**
 * Lists the fields that other destinations own, which are cleared when switching to this one. Fields it
 * shares, such as the anchor, are kept.
 *
 * @param type - The new destination.
 * @returns The fields to clear.
 */
export function getStaleFields(type: SanityLinkDestination) {
  const kept = new Set<string>(getLinkType(type)?.fields);

  return linkTypes
    .filter((linkType) => linkType.name !== type)
    .flatMap((linkType) => [...linkType.fields])
    .filter((field) => !kept.has(field));
}

/**
 * Checks whether a link's destination shows a field.
 *
 * @param parent - The link.
 * @param field - The field name.
 * @returns Whether the field is shown.
 */
export function showsField(parent: unknown, field: string) {
  return linkTypes.some(
    (linkType) => linkType.fields.some((owned) => owned === field) && isLinkType(parent, linkType.name),
  );
}

/**
 * Checks whether a link has a given kind of destination, so fields are only shown and required for
 * their own link type.
 *
 * @param parent - The link.
 * @param type - The link type.
 * @returns Whether the link has that type.
 */
export function isLinkType(parent: unknown, type: SanityLinkDestination) {
  return typeof parent === "object" && parent !== null && "type" in parent && parent.type === type;
}

/**
 * Checks whether a link is a text annotation, whose label comes from the text it wraps.
 *
 * @param parent - The link.
 * @returns Whether the link is an annotation.
 */
export function isLinkMark(parent: unknown) {
  return typeof parent === "object" && parent !== null && "_type" in parent && parent._type === linkMarkTypeName;
}
