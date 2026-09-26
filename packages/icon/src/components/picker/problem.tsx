import { WarningOutlineIcon } from "@sanity/icons/WarningOutline";
import { Card, Flex, Stack, Text } from "@sanity/ui";
import type { ComponentProps } from "react";

import type { LibraryProblem } from "@/lib/library";

export type CodeTextProps = Omit<ComponentProps<"span">, "children"> & {
  text: string;
};

export function CodeText({ text, ...props }: CodeTextProps) {
  const parts = text.split("`");

  return (
    <span {...props}>
      {parts.map((part, index) => {
        const start = parts.slice(0, index).join("`").length;

        return index % 2 === 1 ? <code key={start}>{part}</code> : part;
      })}
    </span>
  );
}

export type ProblemProps = Omit<ComponentProps<typeof Card>, "children"> & {
  problem: LibraryProblem;
};

export function Problem({ problem, ...props }: ProblemProps) {
  return (
    <Card tone="caution" padding={4} radius={2} border {...props}>
      <Flex gap={3}>
        <Text size={1}>
          <WarningOutlineIcon />
        </Text>
        <Stack gap={3}>
          <Text size={1} weight="medium">
            <CodeText text={problem.title} />
          </Text>
          <Text size={1} muted>
            <CodeText text={problem.description} />
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}
