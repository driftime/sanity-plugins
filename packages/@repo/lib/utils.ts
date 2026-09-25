/** A value that may be null or undefined. */
type Nullable<T> = T | null | undefined;

/**
 * Checks whether a value is present. `false`, blank strings, and empty plain objects count as absent,
 * as does an array with no present elements.
 *
 * @param value - The value to check.
 * @returns True if the value is present.
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
 * Converts a string to another case.
 *
 * @param value - The string to convert.
 * @param format - The case to convert to.
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
 * Checks whether a value is an object whose keys can be read.
 *
 * @param value - The value to check.
 * @returns True if the value is an object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Reads a nested value by following a path of keys.
 *
 * @param value - The object to read from.
 * @param path - The keys to follow.
 * @returns The value, or undefined when the path doesn't exist.
 */
export function readPath(value: unknown, path: string[]) {
  let current: unknown = value;

  for (const segment of path) {
    if (!isRecord(current)) return undefined;

    current = current[segment];
  }

  return current;
}
