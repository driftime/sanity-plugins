import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";

import { VideoContent } from "@/components/blocks/video/content";
import { contentSpacing } from "@/config/layout";
import type { SanityHandbookVideo } from "@/types";

export type VideoBlockProps = Omit<ComponentProps<typeof VideoContent>, "url" | "caption"> & {
  value: SanityHandbookVideo;
};

export function VideoBlock({ value, style, ...props }: VideoBlockProps) {
  if (!isDefined(value.asset?.url)) return null;

  return (
    <VideoContent
      url={value.asset.url}
      caption={value.caption}
      style={{ marginBlock: contentSpacing.media, ...style }}
      {...props}
    />
  );
}
