import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { ImagePreview } from "@/components/blocks/image/preview";
import { ImageIcon } from "@/icons/image";
import type { SanityHandbookImage } from "@/types";
import { imageTypeName } from "@/types";

export const imageType = defineType({
  name: imageTypeName satisfies SanityHandbookImage["_type"],
  type: "object",
  title: "Image",
  description: "Image with an optional caption and alternative text.",
  icon: createSanityIcon(ImageIcon),
  components: {
    preview: ImagePreview,
  },
  preview: {
    select: {
      caption: "caption",
      alt: "alt",
      url: "asset.asset.url",
    },
  },
  fields: [
    defineField({
      name: "asset" satisfies keyof SanityHandbookImage,
      type: "image",
      title: "Image",
      description: "Upload or select an image from the media library.",
      options: { hotspot: true },
    }),
    defineField({
      name: "caption" satisfies keyof SanityHandbookImage,
      type: "string",
      description: "Caption text displayed below the image, such as a credit or a note.",
    }),
    defineField({
      name: "alt" satisfies keyof SanityHandbookImage,
      type: "string",
      title: "Alternative Text",
      description: "Describes what the image shows for people who cannot see it. Don't repeat the caption here.",
    }),
  ],
});
