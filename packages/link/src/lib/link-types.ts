import { linkTypes } from "@/config/destinations";
import type { SanityLinkDestination } from "@/types";
import { linkMarkTypeName } from "@/types";

/**
 * Reads which kind of destination a stored value names, so the tabs and the preview describe the same
 * choice. A value the plugin no longer offers reads as no choice at all.
 *
 * @param name - The stored type value.
 * @returns The matching link type, or undefined when nothing recognisable was stored.
 */
export function getLinkType(name: string | undefined) {
  return linkTypes.find((linkType) => linkType.name === name);
}

/**
 * Names the fields every other destination owns, so moving to one clears what the last one wrote. A
 * field the destination being moved to also owns is kept, since a page and a section share the anchor.
 *
 * @param type - The destination being moved to.
 * @returns Fields belonging to the destinations being left.
 */
export function getStaleFields(type: SanityLinkDestination) {
  const kept = new Set<string>(getLinkType(type)?.fields);

  return linkTypes
    .filter((linkType) => linkType.name !== type)
    .flatMap((linkType) => [...linkType.fields])
    .filter((field) => !kept.has(field));
}

/**
 * Checks whether the destination a link points at shows a given field, so a field's visibility is
 * read from the one table that says which destination owns what.
 *
 * @param parent - The link the field belongs to.
 * @param field - Name of the field to check for.
 * @returns Whether the link's destination shows that field.
 */
export function showsField(parent: unknown, field: string) {
  return linkTypes.some(
    (linkType) => linkType.fields.some((owned) => owned === field) && isLinkType(parent, linkType.name),
  );
}

/**
 * Checks the kind of destination the link a field belongs to points at, so a field is shown and
 * required only for the link type that uses it.
 *
 * @param parent - The link the field belongs to.
 * @param type - The link type to check for.
 * @returns Whether the link points at that kind of destination.
 */
export function isLinkType(parent: unknown, type: SanityLinkDestination) {
  return typeof parent === "object" && parent !== null && "type" in parent && parent.type === type;
}

/**
 * Checks whether the link a field belongs to was authored as an annotation, where the text it wraps
 * supplies what the field would otherwise hold.
 *
 * @param parent - The link the field belongs to.
 * @returns Whether the link is a text annotation.
 */
export function isLinkMark(parent: unknown) {
  return typeof parent === "object" && parent !== null && "_type" in parent && parent._type === linkMarkTypeName;
}
