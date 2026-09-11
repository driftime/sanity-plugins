import { Card } from "@sanity/ui";
import type { CardProps } from "@sanity/ui";
import { Code } from "@sanity/ui/code";

export type CodeContentProps = CardProps & {
  code: string;
  language?: string;
};

export function CodeContent({ code, language, style, ...props }: CodeContentProps) {
  return (
    <Card padding={4} radius={2} tone="transparent" style={{ overflowX: "auto", ...style }} {...props}>
      <Code size={1} language={language}>
        {code}
      </Code>
    </Card>
  );
}
