import { useState } from "react";

import { clearRecent, readRecent, writeRecent } from "@/lib/recent";

/**
 * Tracks the icons an author chose most recently from one library style. The list is read when the picker opens, so
 * choices made in another tab are included.
 *
 * @param scope - The library and style, such as `phosphor/bold`.
 * @returns The recent icon names, most recent first, and functions to add to and clear them.
 */
export function useRecentIcons(scope: string) {
  const [recent, setRecent] = useState<string[]>(() => readRecent(scope));

  function remember(name: string) {
    setRecent(writeRecent(scope, name));
  }

  function forget() {
    clearRecent(scope);
    setRecent([]);
  }

  return { recent, remember, forget };
}
