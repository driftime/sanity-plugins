import { useState } from "react";

import { clearRecent, readRecent, writeRecent } from "@/lib/recent";

/**
 * Tracks the icons an author chose most recently. The list is read when the picker opens, so choices
 * made in another tab are included.
 *
 * @returns The recent icon names, most recent first, and functions to add to and clear them.
 */
export function useRecentIcons() {
  const [recent, setRecent] = useState<string[]>(readRecent);

  function remember(name: string) {
    setRecent(writeRecent(name));
  }

  function forget() {
    clearRecent();
    setRecent([]);
  }

  return { recent, remember, forget };
}
