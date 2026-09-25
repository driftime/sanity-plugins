/** Cell size in pixels, fixed so the grid never reflows. */
export const gridCellSize = 40;

/** Gap between rows in pixels. */
const gridRowGap = 4;

/** Distance from one row to the next, used to position the rendered rows. */
export const gridRowHeight = gridCellSize + gridRowGap;

/** Icons per row. */
export const gridColumns = 8;

/** Rows visible at once. */
export const gridVisibleRows = 8;

/** Height of the scrolling area. The last row has no gap after it. */
export const gridHeight = gridVisibleRows * gridRowHeight - gridRowGap;

/** Extra rows rendered above and below the visible ones, so rows are already drawn as they scroll into view. */
export const gridOverscan = gridVisibleRows;

/** Layout shared by both grids, so recent icons line up with the library's columns. */
export const gridLayoutStyle = { justifyItems: "center", rowGap: gridRowGap } as const;
