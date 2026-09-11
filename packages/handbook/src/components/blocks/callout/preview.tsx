import { Stack } from "@sanity/ui";
import type { PreviewProps } from "sanity";

import { CalloutContent } from "@/components/blocks/callout/content";
import type { SanityHandbookCallout, SanityHandbookCalloutVariant } from "@/types";

export type CalloutPreviewProps = PreviewProps & {
  variant?: SanityHandbookCalloutVariant;
  body?: SanityHandbookCallout["body"];
};

export function CalloutPreview({ variant, body }: CalloutPreviewProps) {
  return (
    <CalloutContent variant={variant ?? "tip"}>
      <Stack gap={3}>
        {body?.map(({ _key, children }) => (
          <div key={_key} style={{ whiteSpace: "pre-wrap" }}>
            {children.map((child) => child.text).join("")}
          </div>
        ))}
      </Stack>
    </CalloutContent>
  );
}
