import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { defaultDocumentTitle } from "@/config/defaults";
import { BookOpenTextIcon } from "@/icons/book-open-text";
import type { SanityHandbookBlockDefinition } from "@/plugin";
import { createGuideContentField } from "@/schemas/fields/content";
import type { SanityHandbookGuide } from "@/types";
import { guideTypeName } from "@/types";

/**
 * Creates the document type a single guide is authored as, with its content field offering the
 * built-in blocks alongside any a consumer registered.
 *
 * @param customBlocks - Custom block definitions registered by the consumer.
 * @returns A document type definition for Handbook guides.
 */
export function createGuideType(customBlocks: SanityHandbookBlockDefinition[] = []) {
  return defineType({
    name: guideTypeName satisfies SanityHandbookGuide["_type"],
    type: "document",
    title: "Handbook Guide",
    description: "Handbook page authored with rich text, images, and custom blocks.",
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
        description: "Appears in the Handbook sidebar and as the guide heading.",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "description" satisfies keyof SanityHandbookGuide,
        type: "string",
        description: "Short introduction text displayed below the guide heading.",
      }),
      createGuideContentField(customBlocks),
    ],
  });
}
