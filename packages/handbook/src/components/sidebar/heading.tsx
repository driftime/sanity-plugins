import { Box, Card, Text } from "@sanity/ui";
import type { ComponentProps } from "react";

export type SidebarHeadingProps = ComponentProps<typeof Box> & {
  title: string;
};

export function SidebarHeading({ title, ...props }: SidebarHeadingProps) {
  return (
    <Box paddingY={2} {...props}>
      <Card padding={2}>
        <Text size={1} muted textOverflow="ellipsis" weight="semibold" style={{ cursor: "default", outline: "none" }}>
          {title}
        </Text>
      </Card>
    </Box>
  );
}
