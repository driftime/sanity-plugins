import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";

import { ImageContent } from "@/components/blocks/image/content";
import { contentSpacing } from "@/config/layout";
import type { SanityHandbookImage } from "@/types";

export type ImageBlockProps = Omit<ComponentProps<typeof ImageContent>, "url" | "alt" | "caption"> & {
  value: SanityHandbookImage;
};

export function ImageBlock({ value, style, ...props }: ImageBlockProps) {
  if (!isDefined(value.asset?.url)) return null;

  return (
    <ImageContent
      url={value.asset.url}
      alt={value.alt}
      caption={value.caption}
      style={{ marginBlock: contentSpacing.media, ...style }}
      {...props}
    />
  );
}
