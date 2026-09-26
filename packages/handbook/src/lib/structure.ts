import { createSanityIcon } from "@repo/lib/icons";
import type { CurrentUser } from "sanity";
import type { StructureBuilder } from "sanity/structure";

import { BookOpenTextIcon } from "@/icons/book-open-text";
import { BookTextIcon } from "@/icons/book-text";
import { isPermittedEditor } from "@/lib/editors";
import { guideTypeName, handbookTypeName } from "@/types";

/**
 * Creates Structure tool items for the Handbook documents, or none when the current user can't edit them.
 *
 * @param structureBuilder - The structure builder.
 * @param context - The structure context, with the current user.
 * @param editors - Email addresses of the editors, defaulting to the configured list.
 * @returns List items for the Handbook document and the guides list, oldest guide first.
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
      .child(
        documentTypeList(guideTypeName)
          .title("Handbook Guides")
          .defaultOrdering([{ field: "_createdAt", direction: "asc" }]),
      ),
  ];
}
