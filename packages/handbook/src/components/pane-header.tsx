import { isDefined } from "@repo/lib/utils";
import { Box, Card, Flex, Layer, LayerProvider, Text, useElementSize, useTheme_v2 } from "@sanity/ui";
import { useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { PaneContext } from "sanity/_singletons";

import { collapsedPaneWidth } from "@/config/layout";

export type PaneHeaderProps = ComponentProps<"div"> & {
  title: string;
  backButton?: ReactNode;
};

export function PaneHeader({ title, backButton, style, ...props }: PaneHeaderProps) {
  const { color } = useTheme_v2();
  const pane = useContext(PaneContext);
  const paneSize = useElementSize(pane?.rootElement ?? null);

  const collapsed = pane?.collapsed ?? false;
  const isLast = pane?.isLast ?? false;
  const paneHeight = paneSize?.border.height ?? 0;
  const collapsedWidth = paneHeight > 0 ? paneHeight : window.innerHeight;
  const { bg, fg } = color.selectable.default.enabled;

  function handleTitleClick() {
    if (collapsed) return;
    pane?.collapse();
  }

  function handleLayoutClick() {
    if (!collapsed) return;
    pane?.expand();
  }

  return (
    <LayerProvider zOffset={100}>
      <Layer
        data-collapsed={collapsed ? "" : undefined}
        style={{ lineHeight: 0, position: "sticky", top: 0, ...style }}
        {...props}
      >
        <Card tone="inherit" data-collapsed={collapsed ? "" : undefined}>
          <Flex
            direction="column"
            gap={3}
            onClick={handleLayoutClick}
            padding={3}
            sizing="border"
            style={{
              width: collapsed ? collapsedWidth : undefined,
              transform: collapsed ? "rotate(90deg)" : undefined,
              transformOrigin: `calc(${collapsedPaneWidth}px / 2)`,
            }}
          >
            <Flex align="flex-start" gap={3}>
              {isDefined(backButton) && <Box flex="none">{backButton}</Box>}
              <Card
                flex={1}
                onClick={handleTitleClick}
                padding={2}
                paddingLeft={isDefined(backButton) ? 1 : 2}
                tabIndex={isLast && !collapsed ? -1 : 0}
                style={{ backgroundColor: bg, minWidth: 0 }}
                __unstable_focusRing
              >
                <Flex align="center" gap={1}>
                  <Text
                    size={1}
                    textOverflow="ellipsis"
                    weight="semibold"
                    style={{ color: fg, cursor: "default", minWidth: 0, outline: "none" }}
                  >
                    {title}
                  </Text>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        </Card>
      </Layer>
    </LayerProvider>
  );
}
