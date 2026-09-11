import { defineArrayMember, defineField } from "sanity";

import { CodeDecorator } from "@/components/decorators";
import { ListItemStyle } from "@/components/lists";
import { BlockquoteStyle, HeadingStyle, ParagraphStyle } from "@/components/styles";
import type { SanityHandbookBlockDefinition } from "@/plugin";
import { linkAnnotation } from "@/schemas/annotations/link";
import type { SanityHandbookGuide } from "@/types";
import { calloutTypeName, codeTypeName, horizontalRuleTypeName, imageTypeName, videoTypeName } from "@/types";

/**
 * Creates the Portable Text content field for Handbook guides, offering the built-in blocks alongside
 * any a consumer registered.
 *
 * @param customBlocks - Custom block definitions registered by the consumer.
 * @returns A field definition for the guide content array.
 */
export function createGuideContentField(customBlocks: SanityHandbookBlockDefinition[] = []) {
  return defineField({
    name: "content" satisfies keyof SanityHandbookGuide,
    type: "array",
    description: "Rich text with formatting, headings, lists, images, code blocks, and custom blocks.",
    of: [
      defineArrayMember({
        name: "block",
        type: "block",
        styles: [
          { title: "Paragraph", value: "normal", component: ParagraphStyle },
          { title: "Heading", value: "h2", component: HeadingStyle },
          { title: "Blockquote", value: "blockquote", component: BlockquoteStyle },
        ],
        lists: [
          { title: "Bullet", value: "bullet", component: ListItemStyle },
          { title: "Number", value: "number", component: ListItemStyle },
        ],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
            { title: "Strikethrough", value: "strike-through" },
            { title: "Code", value: "code", component: CodeDecorator },
          ],
          annotations: [linkAnnotation],
        },
      }),
      defineArrayMember({ name: imageTypeName, type: imageTypeName }),
      defineArrayMember({ name: videoTypeName, type: videoTypeName }),
      defineArrayMember({ name: codeTypeName, type: codeTypeName }),
      defineArrayMember({ name: calloutTypeName, type: calloutTypeName }),
      defineArrayMember({ name: horizontalRuleTypeName, type: horizontalRuleTypeName }),
      ...customBlocks.map((block) => defineArrayMember({ name: block.schema.name, type: block.schema.name })),
    ],
  });
}
