import type { ComponentProps, ComponentType } from "react";
import { CommandList } from "sanity";
import { Pane, PaneContent } from "sanity/structure";

import { PaneHeader } from "@/components/pane-header";
import { SidebarHeading } from "@/components/sidebar/heading";
import { SidebarTab } from "@/components/sidebar/tab";
import { sidebarItemHeight, sidebarMaximumWidth, sidebarMinimumWidth, sidebarWidth } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";
import { useSections } from "@/hooks/use-sections";

/** A heading above a group of sidebar tabs. */
interface SidebarHeadingItem {
  /** Marks the item as a heading. */
  type: "heading";
  /** Heading text. */
  title: string;
}

/** A sidebar row that opens the content panel with the same ID. */
interface SidebarTabItem {
  /** Marks the item as a tab. */
  type: "tab";
  /** ID shared by the sidebar row and its panel. */
  id: string;
  /** Label in the sidebar. */
  label: string;
  /** Icon next to the sidebar label. */
  icon?: ComponentType;
}

/** An item in the sidebar's flat list. */
type SidebarItem = SidebarHeadingItem | SidebarTabItem;

// `CommandList` clones what this returns to set `tabIndex`, so a wrapper component would swallow it.
function renderItem(item: SidebarItem) {
  if (item.type === "heading") return <SidebarHeading title={item.title} />;

  return <SidebarTab id={item.id} label={item.label} icon={item.icon} />;
}

export type SidebarProps = Omit<ComponentProps<typeof Pane>, "id">;

export function Sidebar(props: SidebarProps) {
  const { sidebarTitle } = useHandbookContext();
  const sections = useSections();

  const items = sections.flatMap(({ title, entries }): SidebarItem[] => [
    { type: "heading", title },
    ...entries.map((entry): SidebarItem => ({ type: "tab", id: entry.id, label: entry.title, icon: entry.icon })),
  ]);

  function getItemDisabled(virtualIndex: number) {
    return items[virtualIndex]?.type === "heading";
  }

  return (
    <Pane
      id="handbook-sidebar"
      currentMaxWidth={sidebarWidth}
      minWidth={sidebarMinimumWidth}
      maxWidth={sidebarMaximumWidth}
      {...props}
    >
      <PaneHeader title={sidebarTitle} />
      <PaneContent overflow="auto">
        <CommandList
          activeItemDataAttr="data-hovered"
          ariaLabel={sidebarTitle}
          canReceiveFocus
          getItemDisabled={getItemDisabled}
          itemHeight={sidebarItemHeight}
          items={items}
          onlyShowSelectionWhenActive
          paddingBottom={1}
          paddingX={3}
          renderItem={renderItem}
          wrapAround={false}
        />
      </PaneContent>
    </Pane>
  );
}
