import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { defaultDocumentTitle } from "@/config/defaults";
import { BookOpenTextIcon } from "@/icons/book-open-text";
import type { SanityHandbookBlockDefinition } from "@/plugin";
import { createGuideContentField } from "@/schemas/fields/content";
import type { SanityHandbookGuide } from "@/types";
import { guideTypeName } from "@/types";

/**
 * Creates the guide document type, with a content field offering the built-in blocks and any custom ones.
 *
 * @param customBlocks - Custom blocks added by the site.
 * @returns The guide document type.
 */
export function createGuideType(customBlocks: SanityHandbookBlockDefinition[] = []) {
  return defineType({
    name: guideTypeName satisfies SanityHandbookGuide["_type"],
    type: "document",
    title: "Handbook Guide",
    description: "Handbook page written in rich text.",
    icon: createSanityIcon(BookOpenTextIcon),
    preview: {
      select: {
        title: "title",
        description: "description",
      },
      prepare(selection: { title?: string; description?: string }) {
        const { title, description } = selection;

        return {
          title: title ?? defaultDocumentTitle,
          subtitle: description,
        };
      },
    },
    fields: [
      defineField({
        name: "title" satisfies keyof SanityHandbookGuide,
        type: "string",
        description: "Title shown in the Handbook sidebar and as the guide heading.",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "description" satisfies keyof SanityHandbookGuide,
        type: "string",
        description: "Short introduction shown below the heading.",
      }),
      createGuideContentField(customBlocks),
    ],
  });
}
