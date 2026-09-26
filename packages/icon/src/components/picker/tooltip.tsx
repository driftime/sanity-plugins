import { isDefined } from "@repo/lib/utils";
import { Stack, Text } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import type { CSSProperties, ComponentProps } from "react";

import type { LibraryIcon } from "@/lib/library";
import { splitMatches } from "@/lib/library";

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

/** Underlines a search match in place of the browser's highlighter-pen look, keeping the text's own colour. */
const matchStyle: CSSProperties = {
  background: "none",
  color: "inherit",
  textDecorationLine: "underline",
  textUnderlineOffset: "0.2em",
};

export type HighlightProps = Omit<ComponentProps<"span">, "children"> & {
  text: string;
  query: string;
};

export function Highlight({ text, query, ...props }: HighlightProps) {
  return (
    <span {...props}>
      {splitMatches(text, query).map((part) =>
        part.match ? (
          <mark key={part.start} style={matchStyle}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </span>
  );
}

export type TooltipProps = Omit<ComponentProps<typeof Popover>, "open" | "referenceElement" | "content"> & {
  hovered: HoveredIcon | undefined;
  query: string;
};

export function Tooltip({ hovered, query, ...props }: TooltipProps) {
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
              <Highlight text={hovered.icon.label} query={query} />
            </Text>
            {isDefined(hovered.icon.tags) && (
              <Text size={1} muted>
                <Highlight text={hovered.icon.tags} query={query} />
              </Text>
            )}
          </Stack>
        )
      }
      {...props}
    />
  );
}
