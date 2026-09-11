import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { VideoPreview } from "@/components/blocks/video/preview";
import { FilmIcon } from "@/icons/film";
import type { SanityHandbookVideo } from "@/types";
import { videoTypeName } from "@/types";

export const videoType = defineType({
  name: videoTypeName satisfies SanityHandbookVideo["_type"],
  type: "object",
  title: "Video",
  description: "Video with an optional caption.",
  icon: createSanityIcon(FilmIcon),
  components: {
    preview: VideoPreview,
  },
  preview: {
    select: {
      caption: "caption",
      url: "asset.asset.url",
    },
  },
  fields: [
    defineField({
      name: "asset" satisfies keyof SanityHandbookVideo,
      type: "file",
      title: "Video",
      description: "Upload or select a video from the media library.",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "caption" satisfies keyof SanityHandbookVideo,
      type: "string",
      description: "Caption text displayed below the video, such as a credit or a note.",
    }),
  ],
});
