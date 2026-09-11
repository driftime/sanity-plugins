import { createSanityIcon } from "@repo/lib/icons";
import { defineField, defineType } from "sanity";

import { CodePreview } from "@/components/blocks/code/preview";
import { CodeIcon } from "@/icons/code";
import type { SanityHandbookCode } from "@/types";
import { codeTypeName } from "@/types";

export const codeType = defineType({
  name: codeTypeName satisfies SanityHandbookCode["_type"],
  type: "object",
  title: "Code",
  description: "Syntax-highlighted code block with language selection.",
  icon: createSanityIcon(CodeIcon),
  components: {
    preview: CodePreview,
  },
  preview: {
    select: {
      code: "code",
      language: "language",
    },
  },
  fields: [
    defineField({
      name: "code" satisfies keyof SanityHandbookCode,
      type: "text",
      description: "The source code to display.",
    }),
    defineField({
      name: "language" satisfies keyof SanityHandbookCode,
      type: "string",
      description: "Programming language used for syntax highlighting.",
      options: {
        list: [
          { title: "CSS", value: "css" },
          { title: "GROQ", value: "groq" },
          { title: "HTML", value: "html" },
          { title: "JavaScript", value: "javascript" },
          { title: "JSON", value: "json" },
          { title: "Plain Text", value: "text" },
          { title: "React", value: "tsx" },
          { title: "Shell", value: "shell" },
          { title: "TypeScript", value: "typescript" },
        ],
      },
    }),
  ],
});
