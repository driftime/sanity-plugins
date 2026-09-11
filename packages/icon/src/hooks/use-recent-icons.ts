import { useState } from "react";

import { clearRecent, readRecent, writeRecent } from "@/lib/recent";

/**
 * Tracks the icons an author reached for last, keeping what is remembered and what is drawn in step.
 * The stored list is read as the picker mounts, so another tab choosing an icon is picked up too.
 *
 * @returns The remembered names, most recent first, alongside ways to add to and empty them.
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
