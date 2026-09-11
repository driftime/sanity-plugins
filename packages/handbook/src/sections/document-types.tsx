import { DocumentedField } from "@/components/documentation/field";
import { contentSpacing } from "@/config/layout";
import { resolveDescription, resolveIcon, resolveTitle } from "@/lib/display";
import type { SanityHandbookDocumentRole } from "@/plugin";

/**
 * Builds a section for each configured document role.
 *
 * @param roles - Document roles from the plugin configuration.
 * @returns One section per role, holding an entry per document type.
 */
export function documentTypesSections(roles: SanityHandbookDocumentRole[]) {
  return roles.map(({ title, documents }) => ({
    title,
    entries: documents.map((document) => ({
      id: document.name,
      title: resolveTitle(document),
      description: resolveDescription(document),
      icon: resolveIcon(document),
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: contentSpacing.section }}>
          {document.fields.map((field) => (
            <DocumentedField key={field.name} field={field} />
          ))}
        </div>
      ),
    })),
  }));
}
