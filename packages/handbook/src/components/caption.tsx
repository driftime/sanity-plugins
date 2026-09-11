import { Box, Text } from "@sanity/ui";
import type { BoxProps } from "@sanity/ui";

export type CaptionProps = BoxProps & {
  children: string;
};

export function Caption({ children, ...props }: CaptionProps) {
  return (
    <Box marginTop={3} {...props}>
      <Text size={1} muted style={{ fontStyle: "italic" }}>
        {children}
      </Text>
    </Box>
  );
}
