import { isDefined } from "@repo/lib/utils";
import { Card, Flex, Text } from "@sanity/ui";
import type { ComponentProps } from "react";

/** Size of the specimen a pairing is shown as, matching the height of the controls beside it. */
const specimenSize = 32;

export type PreviewProps = Omit<ComponentProps<typeof Card>, "children"> & {
  background: string | undefined;
  text: string | undefined;
  children: string | undefined;
};

export function Preview({ background, text, children, ...props }: PreviewProps) {
  if (isDefined(children)) {
    return (
      <Card border padding={3} radius={2} style={{ background, color: text }} {...props}>
        <Text size={1} style={{ color: "inherit" }}>
          {children}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      border
      radius={2}
      style={{ background, color: text, width: specimenSize, height: specimenSize, boxSizing: "border-box" }}
      {...props}
    >
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Text size={1} weight="semibold" style={{ color: "inherit" }}>
          Aa
        </Text>
      </Flex>
    </Card>
  );
}
