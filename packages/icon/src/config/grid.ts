/** Size of one cell, in pixels. Fixed so the grid never reflows. */
export const gridCellSize = 40;

/** Space between rows, in pixels. */
const gridRowGap = 4;

/** Distance from one row to the next, which placing a window over the grid depends on knowing. */
export const gridRowHeight = gridCellSize + gridRowGap;

/** How many icons a row holds. */
export const gridColumns = 8;

/** How many rows the scrolling area shows at once. */
export const gridVisibleRows = 8;

/** Height of the scrolling area, sized to the rows it shows. The final row carries no trailing gap. */
export const gridHeight = gridVisibleRows * gridRowHeight - gridRowGap;

/**
 * Rows built either side of the visible ones. Everything built is also painted, so a row scrolled
 * into view is already there rather than arriving with it.
 */
export const gridOverscan = gridVisibleRows;

/** Layout both grids share, so a recent icon sits on the same columns as the library below it. */
export const gridLayoutStyle = { justifyItems: "center", rowGap: gridRowGap } as const;
