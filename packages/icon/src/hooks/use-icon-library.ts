import { useEffect, useState } from "react";

import type { LibraryResult } from "@/lib/library";
import { requestLibrary } from "@/lib/library";

/**
 * Loads an icon library style. Only an open picker calls this, so a Studio that never opens one never loads it.
 *
 * @param library - Identifier of the library, or undefined when none is set.
 * @param style - Identifier of the style, or undefined for the library's default.
 * @returns The icons or why they can't be shown, or undefined while loading.
 */
export function useIconLibrary(library: string | undefined, style: string | undefined) {
  const [result, setResult] = useState<LibraryResult>();

  useEffect(() => {
    let active = true;

    async function load() {
      const loaded = await requestLibrary(library, style);
      if (active) setResult(loaded);
    }

    void load();

    return () => {
      active = false;
    };
  }, [library, style]);

  return result;
}
