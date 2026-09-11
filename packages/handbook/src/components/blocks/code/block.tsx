import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";

import { CodeContent } from "@/components/blocks/code/content";
import { contentSpacing } from "@/config/layout";
import type { SanityHandbookCode } from "@/types";

export type CodeBlockProps = Omit<ComponentProps<typeof CodeContent>, "code" | "language"> & {
  value: SanityHandbookCode;
};

export function CodeBlock({ value, style, ...props }: CodeBlockProps) {
  if (!isDefined(value.code)) return null;

  return (
    <CodeContent
      code={value.code}
      language={value.language}
      style={{ marginBlock: contentSpacing.media, ...style }}
      {...props}
    />
  );
}
