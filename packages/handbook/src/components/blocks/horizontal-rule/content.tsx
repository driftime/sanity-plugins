import type { ComponentProps } from "react";

export type HorizontalRuleContentProps = ComponentProps<"hr">;

export function HorizontalRuleContent({ style, ...props }: HorizontalRuleContentProps) {
  return <hr style={{ border: "none", borderTop: "1px solid var(--card-border-color)", ...style }} {...props} />;
}
