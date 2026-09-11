import { Text } from "@sanity/ui";
import type { TextProps } from "@sanity/ui";

export type PortableParagraphProps = TextProps;

export function PortableParagraph(props: PortableParagraphProps) {
  return <Text size={1} {...props} />;
}
