import { isDefined } from "@repo/lib/utils";
import { useTheme_v2 } from "@sanity/ui";
import { useState } from "react";
import type { Tool } from "sanity";
import { PaneLayout } from "sanity/structure";

import { toolMinimumWidth } from "@/config/layout";
import { HandbookProvider } from "@/contexts/handbook";
import type { HandbookProviderConfig } from "@/contexts/handbook";
import { Panes } from "@/layouts/panes";

export interface HandbookToolProps {
  tool: Tool<HandbookProviderConfig>;
}

export function HandbookTool({ tool: { options } }: HandbookToolProps) {
  const { media } = useTheme_v2();
  const [layoutCollapsed, setLayoutCollapsed] = useState(false);

  function handleCollapse() {
    setLayoutCollapsed(true);
  }

  function handleExpand() {
    setLayoutCollapsed(false);
  }

  if (!isDefined(options)) return null;

  return (
    <HandbookProvider {...options}>
      <PaneLayout
        flex={1}
        height={layoutCollapsed ? undefined : "fill"}
        minWidth={media[1]}
        onCollapse={handleCollapse}
        onExpand={handleExpand}
        style={{ minHeight: "100%", minWidth: `${toolMinimumWidth}px` }}
      >
        <Panes />
      </PaneLayout>
    </HandbookProvider>
  );
}
