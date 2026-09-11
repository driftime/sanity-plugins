import type { ComponentProps, ComponentType } from "react";
import { CommandList } from "sanity";
import { Pane, PaneContent } from "sanity/structure";

import { PaneHeader } from "@/components/pane-header";
import { SidebarHeading } from "@/components/sidebar/heading";
import { SidebarTab } from "@/components/sidebar/tab";
import { sidebarItemHeight, sidebarMaximumWidth, sidebarMinimumWidth, sidebarWidth } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";
import { useSections } from "@/hooks/use-sections";

/** A non-selectable heading introducing the run of sidebar tabs beneath it. */
interface SidebarHeadingItem {
  /** Marks this entry as a heading rather than a tab. */
  type: "heading";
  /** Text shown above the tabs it introduces. */
  title: string;
}

/** A selectable sidebar row bound to a content panel of the same identifier. */
interface SidebarTabItem {
  /** Marks this entry as a tab rather than a heading. */
  type: "tab";
  /** Identifier shared with the content panel the tab selects. */
  id: string;
  /** Display label in the sidebar. */
  label: string;
  /** Icon component shown beside the label. */
  icon?: ComponentType;
}

/** An entry in the flat list the sidebar renders. */
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
