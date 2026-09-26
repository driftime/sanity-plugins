import { colorPlugin } from "@driftime/sanity-plugin-color";
import { handbookPlugin, handbookStructure } from "@driftime/sanity-plugin-handbook";
import { iconPlugin } from "@driftime/sanity-plugin-icon";
import { linkPlugin } from "@driftime/sanity-plugin-link";
import { defineConfig } from "sanity";
import type { DocumentDefinition } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import type { StructureResolver } from "sanity/structure";

import { dataset, projectId } from "@/environment";
import { home, navigation, page, palette, schemaTypes, settings, templates } from "@/schema";

/**
 * Builds the sidebar to match the Studio in the screenshots: the singletons, the pages, the globals, and the Handbook.
 *
 * @param structureBuilder - The structure builder.
 * @param context - The structure context, with the schema and the current user.
 * @returns The sidebar.
 */
function structure(...[structureBuilder, context]: Parameters<StructureResolver>) {
  const { list, listItem, document, documentTypeListItem, divider } = structureBuilder;

  /**
   * Builds a sidebar item that opens a single document.
   *
   * @param item - The document schema.
   * @returns The sidebar item.
   */
  function createDocumentItem(item: DocumentDefinition) {
    const { name, icon } = item;
    const title = context.schema.get(name)?.title ?? name;

    return listItem().id(name).title(title).icon(icon).child(document().id(name).schemaType(name).title(title));
  }

  return list()
    .title("Content")
    .items([
      createDocumentItem(home),
      divider(),
      documentTypeListItem(page.name),
      divider(),
      ...[navigation, templates, settings].map((global) => createDocumentItem(global)),
      divider(),
      ...handbookStructure(structureBuilder, context),
    ]);
}

export default defineConfig({
  name: "sanity-plugin-suite",
  title: "Sanity Plugin Suite",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Only here so the navigation bar matches the Studio in the screenshots.
    presentationTool({ previewUrl: "/" }),
    handbookPlugin({
      roles: [
        { title: "Singletons", description: "Document types that exist as a single instance.", documents: [home] },
        { title: "Collections", description: "Document types with multiple entries.", documents: [page] },
        {
          title: "Globals",
          description: "Document types shared across the site.",
          documents: [navigation, templates, settings],
        },
      ],
    }),
    iconPlugin({ library: "lucide" }),
    colorPlugin({ palette }),
    linkPlugin({ documentTypes: [home.name, page.name] }),
  ],
});
