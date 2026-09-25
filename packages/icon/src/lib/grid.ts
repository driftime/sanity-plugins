import { gridColumns, gridHeight, gridOverscan, gridRowHeight, gridVisibleRows } from "@/config/grid";

/**
 * Works out which icon a key press moves to.
 *
 * @param key - The key pressed.
 * @param current - Index of the current icon.
 * @param last - Index of the last icon.
 * @returns The new index, or undefined when the key doesn't move.
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
 * Works out which rows to render at a scroll position, so only icons near the viewport are mounted.
 * Padding replaces the other rows, so the scrollbar stays the right size.
 *
 * @param scrollRow - The row scrolled to.
 * @param count - Number of icons in the results.
 * @returns The first and last rows to render, and the total number of rows.
 */
export function getVisibleRows(scrollRow: number, count: number) {
  const totalRows = Math.ceil(count / gridColumns);
  const firstRow = Math.max(0, scrollRow - gridOverscan);
  const lastRow = Math.min(totalRows, firstRow + gridVisibleRows + gridOverscan * 2);

  return { totalRows, firstRow, lastRow };
}

/**
 * Works out the scroll position that centres an icon, for opening on the selected icon.
 *
 * @param index - Index of the icon.
 * @returns The scroll position.
 */
export function getCenteredScrollTop(index: number) {
  return Math.max(0, Math.floor(index / gridColumns) * gridRowHeight - gridHeight / 2);
}

/**
 * Works out the scroll position that brings an icon into view, keeping the current one if it's
 * already visible. It uses the index because Home and End can move to rows that aren't mounted.
 *
 * @param index - Index of the icon.
 * @param scrollTop - The current scroll position.
 * @returns The scroll position.
 */
export function getRevealedScrollTop(index: number, scrollTop: number) {
  const top = Math.floor(index / gridColumns) * gridRowHeight;

  if (top < scrollTop) return top;
  if (top + gridRowHeight > scrollTop + gridHeight) return top + gridRowHeight - gridHeight;

  return scrollTop;
}
