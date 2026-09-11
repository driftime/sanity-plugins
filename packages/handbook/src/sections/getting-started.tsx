import { createSanityIcon } from "@repo/lib/icons";

import { BookTextIcon } from "@/icons/book-text";
import { LayoutGridIcon } from "@/icons/layout-grid";
import { DocumentTypesOverview } from "@/pages/document-types-overview";
import { HowToUse } from "@/pages/how-to-use";

/**
 * Builds the section holding the plugin's own introductory pages.
 *
 * @returns A single section listing the built-in pages, in the order they are shown.
 */
export function gettingStartedSections() {
  return [
    {
      title: "Getting Started",
      entries: [
        {
          id: "how-to-use-this-handbook",
          title: "How to use the Handbook",
          description:
            "A guide to navigating the Handbook, reading the documentation for each field, and making sense of its examples, hints, and nested structure.",
          icon: createSanityIcon(BookTextIcon),
          render: () => <HowToUse />,
        },
        {
          id: "document-types",
          title: "Document Types",
          description:
            "An overview of all document types, organized by role. Select a document type to view its fields, descriptions, and examples.",
          icon: createSanityIcon(LayoutGridIcon),
          render: () => <DocumentTypesOverview />,
        },
      ],
    },
  ];
}
