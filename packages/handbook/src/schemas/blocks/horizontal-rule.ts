import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { HorizontalRulePreview } from "@/components/blocks/horizontal-rule/preview";
import { SeparatorHorizontalIcon } from "@/icons/separator-horizontal";
import type { SanityHandbookHorizontalRule } from "@/types";
import { horizontalRuleTypeName } from "@/types";

export const horizontalRuleType = defineType({
  name: horizontalRuleTypeName satisfies SanityHandbookHorizontalRule["_type"],
  type: "object",
  title: "Horizontal Rule",
  description: "Visual divider between sections of content.",
  icon: createSanityIcon(SeparatorHorizontalIcon),
  components: {
    preview: HorizontalRulePreview,
  },
  preview: {
    prepare() {
      return {
        title: "Horizontal Rule",
      };
    },
  },
  fields: [
    // Sanity rejects an object type declaring no fields, and a rule has nothing of its own to store.
    defineField({
      name: "style",
      type: "string",
      description: "Reserved. A horizontal rule carries no authored content.",
      hidden: true,
    }),
  ],
});
