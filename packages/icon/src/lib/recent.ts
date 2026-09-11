/** Where the icons an author reached for last are kept, in the browser rather than the dataset. */
const storageKey = "driftime:sanity-plugin-icon:recent";

/** How many icons are remembered. */
const limit = 8;

/**
 * Reads the icons an author reached for last.
 *
 * @returns Names of the remembered icons, most recent first.
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
 * Remembers an icon as the one reached for most recently.
 *
 * @param name - Name of the chosen icon.
 * @returns Names of the remembered icons, most recent first.
 */
export function writeRecent(name: string) {
  const updated = [name, ...readRecent().filter((entry) => entry !== name)].slice(0, limit);

  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {
    // A Studio with storage blocked simply does not remember, which is not worth reporting.
  }

  return updated;
}

/** Forgets every icon reached for so far. */
export function clearRecent() {
  try {
    globalThis.localStorage.removeItem(storageKey);
  } catch {
    // A Studio with storage blocked has nothing to forget.
  }
}
