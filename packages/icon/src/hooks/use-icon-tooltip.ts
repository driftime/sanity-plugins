import { isDefined } from "@repo/lib/utils";
import { useEffect, useRef, useState } from "react";

import type { HoveredIcon } from "@/components/picker/tooltip";
import type { LibraryIcon } from "@/lib/library";

/**
 * Tracks which icon the cursor rests on, holding a tooltip back until it has settled somewhere.
 *
 * @param scrolling - Whether the grid is currently moving under the cursor.
 * @returns The icon being hovered, alongside ways to follow the cursor and to dismiss it.
 */
export function useIconTooltip(scrolling: boolean) {
  const [hovered, setHovered] = useState<HoveredIcon>();
  const hoverStart = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    },
    [],
  );

  function clearHover() {
    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    if (isDefined(hovered)) setHovered(undefined);
  }

  function handleHover(icon: LibraryIcon, element: HTMLElement) {
    if (scrolling || element === hovered?.element) return;

    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);

    if (isDefined(hovered)) {
      setHovered({ icon, element });

      return;
    }

    hoverStart.current = setTimeout(() => {
      setHovered({ icon, element });
    }, 200);
  }

  return { hovered, handleHover, clearHover };
}
