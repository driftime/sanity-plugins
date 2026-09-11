import { Text } from "@sanity/ui";
import type { BlockListItemProps } from "sanity";

export function ListItemStyle({ children }: BlockListItemProps) {
  return (
    <Text size={1} style={{ marginTop: "0.375em" }}>
      {children}
    </Text>
  );
}
