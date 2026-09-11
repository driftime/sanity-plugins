import { Button, Flex, Grid, Stack, Text } from "@sanity/ui";
import type { ComponentProps } from "react";

import type { CellProps } from "@/components/picker/cell";
import { Cell } from "@/components/picker/cell";
import { gridColumns, gridLayoutStyle } from "@/config/grid";
import type { LibraryIcon } from "@/lib/library";

export type RecentProps = Omit<ComponentProps<typeof Stack>, "children" | "onSelect"> & {
  icons: LibraryIcon[];
  selected: string | undefined;
  onSelect: (icon: LibraryIcon) => void;
  onHover: CellProps["onHover"];
  onForget: () => void;
};

export function Recent({ icons, selected, onSelect, onHover, onForget, ...props }: RecentProps) {
  return (
    <Stack gap={3} {...props}>
      <Flex align="center" justify="space-between" gap={2}>
        <Text size={1} weight="medium" muted>
          Recent icons
        </Text>
        <Button
          type="button"
          mode="bleed"
          fontSize={1}
          padding={2}
          text="Clear"
          onClick={onForget}
          aria-label="Forget the recently used icons"
        />
      </Flex>
      <Grid role="listbox" aria-label="Recent icons" gridTemplateColumns={gridColumns} style={gridLayoutStyle}>
        {icons.map((icon, index) => (
          <Cell
            key={icon.name}
            icon={icon}
            selected={icon.name === selected}
            focusable
            position={index + 1}
            total={icons.length}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </Grid>
    </Stack>
  );
}
