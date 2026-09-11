import { createSanityIcon } from "@repo/lib/icons";
import { defineArrayMember, defineField } from "sanity";

import { LinkIcon } from "@/icons/link";
import type { SanityHandbookLink } from "@/types";

export const linkAnnotation = defineArrayMember({
  name: "link" satisfies SanityHandbookLink["_type"],
  type: "object",
  description: "Link applied to the selected text.",
  icon: createSanityIcon(LinkIcon),
  preview: {
    select: {
      href: "href",
    },
    prepare(selection: { href?: string }) {
      const { href } = selection;

      return {
        title: href ?? "Link",
      };
    },
  },
  fields: [
    defineField({
      name: "href" satisfies keyof SanityHandbookLink,
      type: "url",
      title: "URL",
      description: "Web address destination for this link. Supports http, https, mailto, and tel schemes.",
      validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
  ],
});
