import { Button } from "@sanity/ui";
import type { ComponentProps } from "react";

import { Drawing } from "@/components/drawing";
import { gridCellSize } from "@/config/grid";
import type { LibraryIcon } from "@/lib/library";

export type CellProps = Omit<
  ComponentProps<typeof Button>,
  "icon" | "selected" | "onSelect" | "onClick" | "onMouseEnter"
> & {
  icon: LibraryIcon;
  selected: boolean;
  focusable: boolean;
  position: number;
  total: number;
  onSelect: (icon: LibraryIcon) => void;
  onHover: (icon: LibraryIcon, element: HTMLElement) => void;
};

export function Cell({ icon, selected, focusable, position, total, onSelect, onHover, ...props }: CellProps) {
  return (
    <Button
      type="button"
      role="option"
      aria-selected={selected}
      aria-posinset={position}
      aria-setsize={total}
      tabIndex={focusable ? 0 : -1}
      mode="bleed"
      selected={selected}
      padding={0}
      style={{ width: gridCellSize, height: gridCellSize }}
      icon={<Drawing node={icon.node} width="1.25em" height="1.25em" strokeWidth={1.5} />}
      aria-label={icon.label}
      onClick={() => {
        onSelect(icon);
      }}
      onMouseEnter={(event) => {
        onHover(icon, event.currentTarget);
      }}
      {...props}
    />
  );
}
