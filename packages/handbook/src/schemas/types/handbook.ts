import { createSanityIcon } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import { defineArrayMember, defineField, defineType } from "sanity";

import { BookTextIcon } from "@/icons/book-text";
import { ListPlusIcon } from "@/icons/list-plus";
import type { SanityHandbook, SanityHandbookGuideGroup } from "@/types";
import { guideTypeName, handbookTypeName } from "@/types";

export const handbookType = defineType({
  name: handbookTypeName satisfies SanityHandbook["_type"],
  type: "document",
  title: "Handbook",
  description: "Groups of guides shown in the Handbook sidebar, in order.",
  icon: createSanityIcon(BookTextIcon),
  preview: {
    prepare() {
      return {
        title: "Handbook",
      };
    },
  },
  fields: [
    defineField({
      name: "groups" satisfies keyof SanityHandbook,
      type: "array",
      description:
        "Groups of guides shown in the Handbook sidebar, in order. Each group has a title and a list of guides, also in order.",
      of: [
        defineArrayMember({
          name: "group",
          type: "object",
          description: "Sidebar section holding a list of guides.",
          icon: createSanityIcon(ListPlusIcon),
          fields: [
            defineField({
              name: "title" satisfies keyof SanityHandbookGuideGroup,
              type: "string",
              description: "Heading shown above the group in the sidebar.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "guides" satisfies keyof SanityHandbookGuideGroup,
              type: "array",
              description: "Guides in the group, in order. Drag to reorder.",
              of: [
                defineArrayMember({
                  name: "guide",
                  type: "reference",
                  to: [{ type: guideTypeName }],
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: "title",
              guide0: "guides.0.title",
              guide1: "guides.1.title",
              guide2: "guides.2.title",
            },
            prepare(selection: { title?: string; guide0?: string; guide1?: string; guide2?: string }) {
              const { title, guide0, guide1, guide2 } = selection;

              const all = [guide0, guide1, guide2].filter((guide): guide is string => isDefined(guide));
              const shown = all.slice(0, 2);
              const hasMore = isDefined(guide2);

              function formatSubtitle() {
                if (!isDefined(shown)) return "No guides selected";
                if (hasMore) return `${shown.join(", ")}, and others`;
                return shown.join(" and ");
              }

              return {
                title: title ?? "Group",
                subtitle: formatSubtitle(),
              };
            },
          },
        }),
      ],
    }),
  ],
});
