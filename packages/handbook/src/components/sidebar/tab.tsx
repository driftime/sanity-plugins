import { ChevronRightIcon } from "@sanity/icons/ChevronRight";
import { Box, Text } from "@sanity/ui";
import type { CSSProperties, ComponentProps, ComponentType } from "react";
import { PreviewCard, SanityDefaultPreview } from "sanity";

import { useHandbookContext } from "@/contexts/handbook";

export type SidebarTabProps = Omit<ComponentProps<typeof PreviewCard>, "as" | "id" | "style"> & {
  id: string;
  label: string;
  icon?: ComponentType;
  style?: CSSProperties;
};

export function SidebarTab({ id, label, icon: Icon, style, ...props }: SidebarTabProps) {
  const { activeTab, setActiveTab, setSidebarExpanded } = useHandbookContext();
  const selected = activeTab === id;

  return (
    <PreviewCard
      id={id}
      as="button"
      data-as="button"
      selected={selected}
      marginBottom={1}
      radius={2}
      sizing="border"
      tabIndex={-1}
      tone="inherit"
      onClick={() => {
        setActiveTab(id);
        setSidebarExpanded(false);
      }}
      style={{ cursor: "pointer", ...style }}
      aria-controls={`panel-${id}`}
      __unstable_focusRing
      {...props}
    >
      <SanityDefaultPreview
        status={
          <Box style={{ opacity: 0.5 }}>
            <Text muted size={1}>
              <ChevronRightIcon />
            </Text>
          </Box>
        }
        icon={Icon}
        layout="compact"
        title={label}
      />
    </PreviewCard>
  );
}
