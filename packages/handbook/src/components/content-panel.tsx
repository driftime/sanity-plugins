import { isDefined } from "@repo/lib/utils";
import { ArrowLeftIcon } from "@sanity/icons/ArrowLeft";
import { Box, Button, Heading, Stack, Text } from "@sanity/ui";
import { useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { PaneLayoutContext } from "sanity/_singletons";
import { PaneContent } from "sanity/structure";

import { PaneHeader } from "@/components/pane-header";
import { contentPaddingBlockEnd, contentPaddingBlockStart, contentPaddingInline, contentWidth } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";

export type ContentPanelProps = Omit<ComponentProps<typeof PaneContent>, "id" | "title"> & {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function ContentPanel({ id, title, description, children, ...props }: ContentPanelProps) {
  const { setSidebarExpanded } = useHandbookContext();
  const paneLayout = useContext(PaneLayoutContext);

  return (
    <>
      <PaneHeader
        title={title}
        backButton={
          paneLayout?.collapsed === true && (
            <Button
              aria-label="Back"
              icon={ArrowLeftIcon}
              mode="bleed"
              onClick={() => {
                setSidebarExpanded(true);
              }}
            />
          )
        }
      />
      <PaneContent id={`panel-${id}`} aria-labelledby={id} overflow="auto" {...props}>
        <Box
          style={{
            maxWidth: contentWidth,
            boxSizing: "border-box",
            marginInline: "auto",
            paddingInline: contentPaddingInline,
            paddingBlockStart: contentPaddingBlockStart,
            paddingBlockEnd: contentPaddingBlockEnd,
          }}
        >
          <Stack marginBottom={6} gap={5}>
            <Heading as="h2" size={4}>
              {title}
            </Heading>
            {isDefined(description) && (
              <Text size={1} muted>
                {description}
              </Text>
            )}
          </Stack>
          {children}
        </Box>
      </PaneContent>
    </>
  );
}
