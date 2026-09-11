import { isDefined, isRecord, readPath } from "@repo/lib/utils";

/**
 * Locates the image a color field draws swatches from and reads the asset it points at. The form
 * holds an asset as an unresolved reference, so this is an identifier rather than the image itself.
 *
 * @param parent - The object holding the color field.
 * @param path - Dotted path from that object to the image.
 * @returns The asset identifier, or undefined when the field names no image or none is set.
 */
export function resolveImageReference(parent: unknown, path: string | undefined) {
  if (!isDefined(path)) return undefined;

  const asset = readPath(parent, [...path.split("."), "asset"]);
  if (!isRecord(asset)) return undefined;

  const reference = asset["_ref"];

  return typeof reference === "string" ? reference : undefined;
}
