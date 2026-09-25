import { isDefined } from "@repo/lib/utils";
import { Stack, Text } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import type { ComponentProps } from "react";

import type { LibraryIcon } from "@/lib/library";

/** Icon under the cursor and the cell showing it. */
export interface HoveredIcon {
  /** Icon in the cell. */
  icon: LibraryIcon;
  /** Cell the tooltip points at. */
  element: HTMLElement;
}

/**
 * Gap between the tooltip and its cell, set through margins because `@sanity/ui` offers no other way.
 * Only the top is set, since the tooltip always appears above the cell.
 */
const tooltipMargins: [number, number, number, number] = [-4, 0, 0, 0];

export type TooltipProps = Omit<ComponentProps<typeof Popover>, "open" | "referenceElement" | "content"> & {
  hovered: HoveredIcon | undefined;
};

export function Tooltip({ hovered, ...props }: TooltipProps) {
  return (
    <Popover
      open={isDefined(hovered)}
      referenceElement={hovered?.element ?? null}
      placement="top"
      portal
      padding={3}
      __unstable_margins={tooltipMargins}
      style={{ pointerEvents: "none" }}
      content={
        isDefined(hovered) && (
          <Stack gap={3} style={{ maxWidth: "16rem" }}>
            <Text size={1} weight="medium">
              {hovered.icon.label}
            </Text>
            {isDefined(hovered.icon.tags) && (
              <Text size={1} muted>
                {hovered.icon.tags}
              </Text>
            )}
          </Stack>
        )
      }
      {...props}
    />
  );
}
