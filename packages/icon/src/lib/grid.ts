import { gridColumns, gridHeight, gridOverscan, gridRowHeight, gridVisibleRows } from "@/config/grid";

/**
 * Works out which icon a key press moves to, so the library can be walked without a mouse.
 *
 * @param key - The key pressed.
 * @param current - Index of the icon the grid is on.
 * @param last - Index of the final icon in the results.
 * @returns The index moved to, or undefined when the key does not move.
 */
export function getNextIndex(key: string, current: number, last: number) {
  if (key === "ArrowRight") return current + 1;
  if (key === "ArrowLeft") return current - 1;
  if (key === "ArrowDown") return current + gridColumns;
  if (key === "ArrowUp") return current - gridColumns;
  if (key === "Home") return 0;
  if (key === "End") return last;

  return undefined;
}

/**
 * Works out which rows the grid builds for a given scroll position, so only the icons near the
 * viewport are mounted. The rows above and below stand in as padding, keeping the scrollbar honest.
 *
 * @param scrollRow - Row the scrolling area has reached.
 * @param count - Number of icons in the results.
 * @returns The row the grid starts building at, the row it stops at, and the row count in total.
 */
export function getVisibleRows(scrollRow: number, count: number) {
  const totalRows = Math.ceil(count / gridColumns);
  const firstRow = Math.max(0, scrollRow - gridOverscan);
  const lastRow = Math.min(totalRows, firstRow + gridVisibleRows + gridOverscan * 2);

  return { totalRows, firstRow, lastRow };
}

/**
 * Works out where the scrolling area sits to show a given icon in the middle, for opening on the
 * icon already chosen.
 *
 * @param index - Index of the icon to show.
 * @returns The position to scroll to.
 */
export function getCenteredScrollTop(index: number) {
  return Math.max(0, Math.floor(index / gridColumns) * gridRowHeight - gridHeight / 2);
}

/**
 * Works out where the scrolling area moves to bring a given icon into view, staying put when the
 * icon already shows. Taken from the index rather than the icon's own cell, since Home and End can
 * land outside the rows that are mounted.
 *
 * @param index - Index of the icon to reveal.
 * @param scrollTop - Position the scrolling area has reached.
 * @returns The position to scroll to.
 */
export function getRevealedScrollTop(index: number, scrollTop: number) {
  const top = Math.floor(index / gridColumns) * gridRowHeight;

  if (top < scrollTop) return top;
  if (top + gridRowHeight > scrollTop + gridHeight) return top + gridRowHeight - gridHeight;

  return scrollTop;
}
