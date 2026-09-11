/** A value that may be absent, covering both null and undefined. */
type Nullable<T> = T | null | undefined;

/**
 * Checks whether a value is defined and non-empty, treating `false`, empty strings, and objects with
 * no keys as absent. An array is absent unless one of its elements is itself present, while anything
 * built from a class counts as present on existence alone. Not intended for boolean flags.
 *
 * @param value - The value to check.
 * @returns True if the value is defined and not empty.
 */
export function isDefined<T>(value: Nullable<T> | false): value is T {
  if (value === undefined || value === null || value === false) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.some((element) => isDefined(element));

  if (typeof value === "object") {
    const prototype = Reflect.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return true;

    return Object.keys(value).length > 0;
  }

  return true;
}

/**
 * Converts a string between different casing formats.
 *
 * @param value - The string to convert.
 * @param format - The target casing format.
 * @returns The converted string.
 */
export function convertCase(value: string, format: "kebab" | "snake" | "camel" | "pascal" | "title" | "sentence") {
  const words = value
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower> $<upper>")
    .replaceAll(/[-_\s]+/gu, " ")
    .trim()
    .toLowerCase();

  switch (format) {
    case "kebab": {
      return words.replaceAll(/\s+/gu, "-");
    }
    case "snake": {
      return words.replaceAll(/\s+/gu, "_");
    }
    case "camel": {
      return words.replaceAll(/\s+(?<character>.)/gu, (_match, character: string) => character.toUpperCase());
    }
    case "pascal": {
      return words.replaceAll(/(?:^|\s+)(?<character>.)/gu, (_match, character: string) => character.toUpperCase());
    }
    case "title": {
      return words.replaceAll(/\b\w/gu, (character) => character.toUpperCase());
    }
    case "sentence": {
      return words.replaceAll(/^(?<character>.)/gu, (character) => character.toUpperCase());
    }
    default: {
      return value;
    }
  }
}

/**
 * Checks whether a value can be read by key, narrowing what arrives untyped from outside the plugin.
 *
 * @param value - The value to check.
 * @returns True if the value has keys to read.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Reads a value out of nested records by following a path of keys, so a caller can name something
 * inside a shape it does not otherwise know.
 *
 * @param value - The object to read from.
 * @param path - Keys leading to the value.
 * @returns The value at the path, or undefined when a key is missing or a step holds no keys to read.
 */
export function readPath(value: unknown, path: string[]) {
  let current: unknown = value;

  for (const segment of path) {
    if (!isRecord(current)) return undefined;

    current = current[segment];
  }

  return current;
}
