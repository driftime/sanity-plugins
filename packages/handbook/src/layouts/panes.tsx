import { isDefined } from "@repo/lib/utils";
import { useContext } from "react";
import { PaneLayoutContext } from "sanity/_singletons";

import { useHandbookContext } from "@/contexts/handbook";
import { Content } from "@/layouts/content";
import { Sidebar } from "@/layouts/sidebar";

export function Panes() {
  const { activeTab, sidebarExpanded } = useHandbookContext();
  const paneLayout = useContext(PaneLayoutContext);

  const hasContent = isDefined(activeTab);

  if (paneLayout?.collapsed === true) {
    return sidebarExpanded || !hasContent ? <Sidebar /> : <Content />;
  }

  return (
    <>
      <Sidebar />
      {hasContent && <Content />}
    </>
  );
}
