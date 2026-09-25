import { createSanityIcon } from "@repo/lib/icons";

import { BookTextIcon } from "@/icons/book-text";
import { LayoutGridIcon } from "@/icons/layout-grid";
import { DocumentTypesOverview } from "@/pages/document-types-overview";
import { HowToUse } from "@/pages/how-to-use";

/**
 * Builds the section for the plugin's introductory pages.
 *
 * @returns One section listing the built-in pages.
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
            "How to find your way around the Handbook, read the documentation for each field, and understand its examples, hints, and subfields.",
          icon: createSanityIcon(BookTextIcon),
          render: () => <HowToUse />,
        },
        {
          id: "document-types",
          title: "Document Types",
          description:
            "A list of every document type, grouped by role. Select a document type to see its fields, descriptions, and examples.",
          icon: createSanityIcon(LayoutGridIcon),
          render: () => <DocumentTypesOverview />,
        },
      ],
    },
  ];
}
