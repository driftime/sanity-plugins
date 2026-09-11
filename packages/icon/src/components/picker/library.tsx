import { Box, Button, Flex, Grid, Text } from "@sanity/ui";
import type { ComponentProps, RefObject } from "react";

import type { CellProps } from "@/components/picker/cell";
import { Cell } from "@/components/picker/cell";
import { gridColumns, gridHeight, gridLayoutStyle, gridRowHeight } from "@/config/grid";
import type { getVisibleRows } from "@/lib/grid";
import type { LibraryIcon } from "@/lib/library";

export type LibraryProps = Omit<ComponentProps<typeof Box>, "children" | "onSelect"> & {
  icons: LibraryIcon[];
  rows: ReturnType<typeof getVisibleRows>;
  selected: string | undefined;
  activeIndex: number;
  activeCell: RefObject<HTMLButtonElement | null>;
  search: string;
  onSelect: (icon: LibraryIcon) => void;
  onHover: CellProps["onHover"];
  onClearSearch: () => void;
};

export function Library({
  icons,
  rows,
  selected,
  activeIndex,
  activeCell,
  search,
  onSelect,
  onHover,
  onClearSearch,
  ...props
}: LibraryProps) {
  const { totalRows, firstRow, lastRow } = rows;
  const visible = icons.slice(firstRow * gridColumns, lastRow * gridColumns);

  return (
    <Box role="listbox" aria-label="Icon library" style={{ height: gridHeight, overflowY: "auto" }} {...props}>
      {icons.length === 0 && (
        <Flex align="center" justify="center" direction="column" gap={3} style={{ height: gridHeight }}>
          <Text size={1} muted>{`Nothing matches "${search}".`}</Text>
          <Button type="button" mode="ghost" text="Clear search" onClick={onClearSearch} />
        </Flex>
      )}
      {icons.length > 0 && (
        <Grid
          gridTemplateColumns={gridColumns}
          style={{
            ...gridLayoutStyle,
            paddingTop: firstRow * gridRowHeight,
            paddingBottom: (totalRows - lastRow) * gridRowHeight,
          }}
        >
          {visible.map((icon, offset) => {
            const index = firstRow * gridColumns + offset;

            return (
              <Cell
                key={icon.name}
                ref={index === activeIndex ? activeCell : undefined}
                icon={icon}
                selected={icon.name === selected}
                focusable={index === activeIndex}
                position={index + 1}
                total={icons.length}
                onSelect={onSelect}
                onHover={onHover}
              />
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
