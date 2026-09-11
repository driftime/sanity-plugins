import { isDefined } from "@repo/lib/utils";
import type { ComponentProps } from "react";

import { Caption } from "@/components/caption";

export type VideoContentProps = ComponentProps<"div"> & {
  url: string;
  caption?: string;
};

export function VideoContent({ url, caption, ...props }: VideoContentProps) {
  return (
    <div {...props}>
      <video
        src={url}
        controls
        style={{ display: "block", maxWidth: "100%", borderRadius: 4, WebkitTransform: "translateZ(0)" }}
      >
        <track kind="captions" label={caption ?? "Video"} />
      </video>
      {isDefined(caption) && <Caption>{caption}</Caption>}
    </div>
  );
}
