import { createSanityIcon } from "@repo/lib/icons";
import type { CurrentUser } from "sanity";
import type { StructureBuilder } from "sanity/structure";

import { BookOpenTextIcon } from "@/icons/book-open-text";
import { BookTextIcon } from "@/icons/book-text";
import { isPermittedEditor } from "@/lib/editors";
import { guideTypeName, handbookTypeName } from "@/types";

/**
 * Creates the Structure tool items for Handbook documents, yielding nothing when the current user is
 * not permitted to edit them.
 *
 * @param structureBuilder - The Sanity Structure builder instance.
 * @param context - The Structure context carrying the current user.
 * @param editors - Email addresses permitted to edit, defaulting to the configured list.
 * @returns The list items for the Handbook singleton and the guides list.
 * @public
 */
export function handbookStructure(
  structureBuilder: StructureBuilder,
  context: { currentUser: CurrentUser | null },
  editors?: string[],
) {
  if (!isPermittedEditor(editors, context.currentUser?.email)) return [];

  const { listItem, document, documentTypeList } = structureBuilder;

  return [
    listItem()
      .title("Handbook")
      .icon(createSanityIcon(BookTextIcon))
      .child(document().id(handbookTypeName).schemaType(handbookTypeName).title("Handbook")),
    listItem()
      .title("Handbook Guides")
      .icon(createSanityIcon(BookOpenTextIcon))
      .child(documentTypeList(guideTypeName).title("Handbook Guides")),
  ];
}
