import { Box, Text } from "@sanity/ui";
import type { BoxProps } from "@sanity/ui";

export type PortableBlockquoteProps = BoxProps & {
  muted?: boolean;
};

export function PortableBlockquote({ muted, children, style, ...props }: PortableBlockquoteProps) {
  return (
    <Box paddingY={1} paddingLeft={3} style={{ borderLeft: "2px solid var(--card-border-color)", ...style }} {...props}>
      <Text size={1} muted={muted} style={{ fontStyle: "italic" }}>
        {children}
      </Text>
    </Box>
  );
}
