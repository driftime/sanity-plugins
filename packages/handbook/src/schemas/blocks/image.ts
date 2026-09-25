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
      description: "Image to show.",
      options: { hotspot: true },
    }),
    defineField({
      name: "caption" satisfies keyof SanityHandbookImage,
      type: "string",
      description: "Text shown below the image, such as a credit.",
    }),
    defineField({
      name: "alt" satisfies keyof SanityHandbookImage,
      type: "string",
      title: "Alternative Text",
      description: "Description of the image for people who can't see it. Don't repeat the caption.",
    }),
  ],
});
