import { isDefined } from "@repo/lib/utils";
import { Stack, Text } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import type { ComponentProps } from "react";

import type { LibraryIcon } from "@/lib/library";

/** The icon a tooltip is describing, paired with the cell it points at. */
export interface HoveredIcon {
  /** Icon the cell holds. */
  icon: LibraryIcon;
  /** Cell the tooltip anchors itself to. */
  element: HTMLElement;
}

/**
 * Gap between a tooltip and the cell it points at, given as margins because that is the only lever
 * `@sanity/ui` offers for it. Top only, since a tooltip always sits above.
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
