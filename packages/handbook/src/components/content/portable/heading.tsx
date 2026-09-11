import { Text } from "@sanity/ui";
import type { TextProps } from "@sanity/ui";

export type PortableHeadingProps = Omit<TextProps, "as">;

export function PortableHeading(props: PortableHeadingProps) {
  return <Text as="h2" size={1} weight="medium" {...props} />;
}
