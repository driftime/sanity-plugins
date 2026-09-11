import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";
import { Pane } from "sanity/structure";

import { ContentPanel } from "@/components/content-panel";
import { contentFlex, contentMinimumWidth } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";
import { useSections } from "@/hooks/use-sections";

export type ContentProps = Omit<ComponentProps<typeof Pane>, "id">;

export function Content(props: ContentProps) {
  const { activeTab } = useHandbookContext();
  const sections = useSections();

  const entry = sections.flatMap((section) => section.entries).find(({ id }) => id === activeTab);

  return (
    <Pane id="handbook-content" flex={contentFlex} minWidth={contentMinimumWidth} {...props}>
      {isDefined(entry) && (
        <ContentPanel id={entry.id} title={entry.title} description={entry.description}>
          {entry.render()}
        </ContentPanel>
      )}
    </Pane>
  );
}
