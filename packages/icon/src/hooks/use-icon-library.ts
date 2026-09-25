import { useEffect, useState } from "react";

import type { LibraryIcon } from "@/lib/library";
import { requestLibrary } from "@/lib/library";

/**
 * Loads the icon library. Only an open picker calls this, so a Studio that never opens one never loads it.
 *
 * @returns Every icon in the library, or undefined while it loads.
 */
export function useIconLibrary() {
  const [library, setLibrary] = useState<LibraryIcon[]>();

  useEffect(() => {
    let active = true;

    async function load() {
      const loaded = await requestLibrary();
      if (active) setLibrary(loaded);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return library;
}
