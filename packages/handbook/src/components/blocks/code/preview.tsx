import { isDefined } from "@repo/lib/utils";
import type { PreviewProps } from "sanity";

import { CodeContent } from "@/components/blocks/code/content";

export type CodePreviewProps = PreviewProps & {
  code?: string;
  language?: string;
};

export function CodePreview({ code, language }: CodePreviewProps) {
  if (!isDefined(code)) return null;

  return <CodeContent code={code} language={language} />;
}
