import type { PreviewProps } from "sanity";

import { HorizontalRuleContent } from "@/components/blocks/horizontal-rule/content";

export type HorizontalRulePreviewProps = PreviewProps;

export function HorizontalRulePreview(_props: HorizontalRulePreviewProps) {
  return <HorizontalRuleContent style={{ marginBlock: 8 }} />;
}
