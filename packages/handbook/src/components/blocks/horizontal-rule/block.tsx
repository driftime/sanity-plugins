import type { ComponentProps } from "react";

import { HorizontalRuleContent } from "@/components/blocks/horizontal-rule/content";
import { contentSpacing } from "@/config/layout";
import type { SanityHandbookHorizontalRule } from "@/types";

export type HorizontalRuleBlockProps = ComponentProps<typeof HorizontalRuleContent> & {
  value: SanityHandbookHorizontalRule;
};

export function HorizontalRuleBlock({ value: _value, style, ...props }: HorizontalRuleBlockProps) {
  return <HorizontalRuleContent style={{ marginBlock: contentSpacing.rule, ...style }} {...props} />;
}
