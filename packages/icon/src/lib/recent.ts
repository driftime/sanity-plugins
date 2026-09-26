/** Local storage key for recent icons, which are kept in the browser rather than the dataset. */
const storageKey = "driftime:sanity-plugin-icon:recent";

/** Number of recent icons to keep. */
const limit = 8;

/**
 * Builds the storage key for one library style.
 *
 * @param scope - The library and style, such as `phosphor/bold`.
 * @returns The storage key.
 */
function getStorageKey(scope: string) {
  return `${storageKey}:${scope}`;
}

/**
 * Reads the recently chosen icons.
 *
 * @param scope - The library and style, such as `phosphor/bold`.
 * @returns The icon names, most recent first.
 */
export function readRecent(scope: string) {
  try {
    const stored: unknown = JSON.parse(globalThis.localStorage.getItem(getStorageKey(scope)) ?? "[]");
    if (!Array.isArray(stored)) return [];

    return stored.filter((entry: unknown) => typeof entry === "string");
  } catch {
    return [];
  }
}

/**
 * Adds an icon to the front of the recent list.
 *
 * @param scope - The library and style, such as `phosphor/bold`.
 * @param name - The chosen icon's name.
 * @returns The updated icon names, most recent first.
 */
export function writeRecent(scope: string, name: string) {
  const updated = [name, ...readRecent(scope).filter((entry) => entry !== name)].slice(0, limit);

  try {
    globalThis.localStorage.setItem(getStorageKey(scope), JSON.stringify(updated));
  } catch {
    // If storage is blocked, the icon just isn't remembered.
  }

  return updated;
}

/**
 * Clears the recent icons.
 *
 * @param scope - The library and style, such as `phosphor/bold`.
 */
export function clearRecent(scope: string) {
  try {
    globalThis.localStorage.removeItem(getStorageKey(scope));
  } catch {
    // If storage is blocked, there's nothing to clear.
  }
}
