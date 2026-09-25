/** Local storage key for recent icons, which are kept in the browser rather than the dataset. */
const storageKey = "driftime:sanity-plugin-icon:recent";

/** Number of recent icons to keep. */
const limit = 8;

/**
 * Reads the recently chosen icons.
 *
 * @returns The icon names, most recent first.
 */
export function readRecent() {
  try {
    const stored: unknown = JSON.parse(globalThis.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];

    return stored.filter((entry: unknown) => typeof entry === "string");
  } catch {
    return [];
  }
}

/**
 * Adds an icon to the front of the recent list.
 *
 * @param name - The chosen icon's name.
 * @returns The updated icon names, most recent first.
 */
export function writeRecent(name: string) {
  const updated = [name, ...readRecent().filter((entry) => entry !== name)].slice(0, limit);

  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {
    // If storage is blocked, the icon just isn't remembered.
  }

  return updated;
}

/** Clears the recent icons. */
export function clearRecent() {
  try {
    globalThis.localStorage.removeItem(storageKey);
  } catch {
    // If storage is blocked, there's nothing to clear.
  }
}
