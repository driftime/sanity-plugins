import { isDefined, isRecord, readPath } from "@repo/lib/utils";

/**
 * Finds the asset ID of the image a color field takes swatches from. The form holds the asset as an
 * unresolved reference.
 *
 * @param parent - The object holding the color field.
 * @param path - Dotted path from that object to the image.
 * @returns The asset ID, or undefined when no image is configured or set.
 */
export function resolveImageReference(parent: unknown, path: string | undefined) {
  if (!isDefined(path)) return undefined;

  const asset = readPath(parent, [...path.split("."), "asset"]);
  if (!isRecord(asset)) return undefined;

  const reference = asset["_ref"];

  return typeof reference === "string" ? reference : undefined;
}
