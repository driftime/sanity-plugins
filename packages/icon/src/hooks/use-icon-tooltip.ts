import { isDefined } from "@repo/lib/utils";
import { useEffect, useRef, useState } from "react";

import type { HoveredIcon } from "@/components/picker/tooltip";
import type { LibraryIcon } from "@/lib/library";

/**
 * Tracks the icon under the cursor, showing its tooltip after a short delay. Tooltips are held back while the grid
 * scrolls, and the icon left under the cursor gets its tooltip once scrolling stops.
 *
 * @param scrolling - Whether the grid is scrolling.
 * @returns The hovered icon, and functions to update and clear it.
 */
export function useIconTooltip(scrolling: boolean) {
  const [hovered, setHovered] = useState<HoveredIcon>();
  const hoverStart = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrolledOnto = useRef<HoveredIcon>(undefined);

  useEffect(
    () => () => {
      if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    },
    [],
  );

  useEffect(() => {
    const landed = scrolledOnto.current;
    if (scrolling || !isDefined(landed)) return;

    scrolledOnto.current = undefined;
    if (!landed.element.isConnected || !landed.element.matches(":hover")) return;

    hoverStart.current = setTimeout(() => {
      setHovered(landed);
    }, 200);
  }, [scrolling]);

  function clearHover() {
    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    if (isDefined(hovered)) setHovered(undefined);
  }

  function handleHover(icon: LibraryIcon, element: HTMLElement) {
    if (scrolling) {
      scrolledOnto.current = { icon, element };

      return;
    }

    if (element === hovered?.element) return;

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
