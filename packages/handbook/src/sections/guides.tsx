import { createSanityIcon } from "@repo/lib/icons";

import { PortableText } from "@/components/content/portable-text";
import { BookOpenTextIcon } from "@/icons/book-open-text";
import type { SanityHandbook } from "@/types";

/**
 * Builds a sidebar section for each guide group.
 *
 * @param handbook - The Handbook document.
 * @returns One section per group, with an entry per guide.
 */
export function guidesSections(handbook: SanityHandbook) {
  return handbook.groups.map(({ title, guides }) => ({
    title,
    entries: guides.map((guide) => ({
      id: guide._key,
      title: guide.title,
      description: guide.description,
      icon: createSanityIcon(BookOpenTextIcon),
      render: () => <PortableText value={guide.content} />,
    })),
  }));
}
