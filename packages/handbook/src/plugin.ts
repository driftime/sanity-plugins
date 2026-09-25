import { createSanityIcon } from "@repo/lib/icons";
import type { ComponentType } from "react";
import { definePlugin } from "sanity";
import type { DocumentDefinition, PortableTextObject, SchemaTypeDefinition } from "sanity";

import { defaultTitle, defaultUndocumentedFieldMessage, pluginName } from "@/config/defaults";
import { documentTypes, singletonTypes } from "@/config/documents";
import type { HandbookProviderConfig } from "@/contexts/handbook";
import { BookTextIcon } from "@/icons/book-text";
import { HandbookTool } from "@/layouts/tool";
import { isPermittedEditor, setConfiguredEditors } from "@/lib/editors";
import { calloutType } from "@/schemas/blocks/callout";
import { codeType } from "@/schemas/blocks/code";
import { horizontalRuleType } from "@/schemas/blocks/horizontal-rule";
import { imageType } from "@/schemas/blocks/image";
import { videoType } from "@/schemas/blocks/video";
import { createGuideType } from "@/schemas/types/guide";
import { handbookType } from "@/schemas/types/handbook";

declare module "@sanity/types" {
  interface FieldDefinitionBase {
    /** Handbook documentation for the field. */
    handbook?: SanityHandbookMetadata;
  }

  // oxlint-disable-next-line no-shadow -- Module augmentation intentionally redeclares the imported type.
  interface DocumentDefinition {
    /** Handbook documentation for the document type. */
    handbook?: SanityHandbookMetadata;
  }
}

/**
 * Documentation added to a field or document definition, shown in the Handbook.
 *
 * @public
 */
export interface SanityHandbookMetadata {
  /** Title to show instead of the schema title. */
  title?: string;
  /** Description shown below the field or document heading. */
  description?: string;
  /** Example value for the field. */
  example?: string;
  /** Tip, shown as a hint icon. */
  tip?: string;
  /** Extra information, shown as a hint icon. */
  info?: string;
  /** Warning, shown as a hint icon. */
  caution?: string;
}

/**
 * A group of document types with the same role in the content model, shown as one sidebar section.
 *
 * @public
 */
export interface SanityHandbookDocumentRole {
  /** Role title. */
  title: string;
  /** Short description of the role. */
  description?: string;
  /** Document definitions in the role. */
  documents: DocumentDefinition[];
}

/**
 * A custom Portable Text block for guides: its schema and the component that renders it.
 *
 * @public
 */
export interface SanityHandbookBlockDefinition {
  /** Schema type definition for the block. */
  schema: SchemaTypeDefinition;
  /** Component that renders the block in the Handbook. */
  component: ComponentType<{ value: PortableTextObject }>;
}

/**
 * Plugin configuration. Only `roles` is required.
 *
 * @public
 */
export interface SanityHandbookConfig {
  /** Title in the Studio's tool menu. Defaults to `"Handbook"`. */
  title?: string;
  /** Heading at the top of the sidebar. Defaults to `"Handbook"`. */
  sidebarTitle?: string;
  /** Document roles, each shown as a section in the sidebar. */
  roles: SanityHandbookDocumentRole[];
  /** Custom Portable Text blocks for guides. Defaults to none. */
  blocks?: SanityHandbookBlockDefinition[];
  /** Email addresses of the people who can edit Handbook documents. Defaults to everyone. */
  editors?: string[];
  /** Message shown for fields without a description. Defaults to a prompt to ask the development team. */
  undocumentedFieldMessage?: string;
}

/**
 * Adds a Handbook tool to Sanity Studio, with documentation generated from the schema and guides written
 * in the Studio.
 *
 * @param config - The plugin configuration.
 * @returns The plugin.
 * @public
 */
export const handbookPlugin = definePlugin<SanityHandbookConfig>((config) => {
  const { title, sidebarTitle, roles, blocks, editors, undocumentedFieldMessage } = config;

  setConfiguredEditors(editors);

  const resolved: HandbookProviderConfig = {
    sidebarTitle: sidebarTitle ?? defaultTitle,
    roles,
    blocks: blocks ?? [],
    undocumentedFieldMessage: undocumentedFieldMessage ?? defaultUndocumentedFieldMessage,
  };

  const guideType = createGuideType(resolved.blocks);

  return {
    name: pluginName,
    schema: {
      types: [
        handbookType,
        guideType,
        imageType,
        videoType,
        codeType,
        calloutType,
        horizontalRuleType,
        ...resolved.blocks.map((block) => block.schema),
      ],
    },
    document: {
      newDocumentOptions: (templateItems, { creationContext, currentUser }) => {
        if (creationContext.type !== "global" && creationContext.type !== "structure") {
          return templateItems;
        }

        const hiddenTypes = isPermittedEditor(editors, currentUser?.email) ? singletonTypes : documentTypes;

        return templateItems.filter(
          ({ templateId }) =>
            ![...hiddenTypes].some((type) => templateId === type || templateId.startsWith(`${type}-`)),
        );
      },
      actions: (actionComponents, { schemaType }) => {
        if (singletonTypes.has(schemaType)) {
          return actionComponents.filter(({ action }) => !["delete", "duplicate", "unpublish"].includes(action ?? ""));
        }

        return actionComponents;
      },
    },
    tools: [
      {
        name: "handbook",
        title: title ?? defaultTitle,
        icon: createSanityIcon(BookTextIcon),
        component: HandbookTool,
        options: resolved,
      },
    ],
  };
});
