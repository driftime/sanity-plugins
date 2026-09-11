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
    handbook?: SanityHandbookMetadata;
  }

  // oxlint-disable-next-line no-shadow -- Module augmentation intentionally redeclares the imported type.
  interface DocumentDefinition {
    handbook?: SanityHandbookMetadata;
  }
}

/**
 * Documentation a schema author attaches to a field or document, shown wherever the Handbook renders it.
 *
 * @public
 */
export interface SanityHandbookMetadata {
  /** Display title override for the field or document. */
  title?: string;
  /** Description shown beneath the field or document heading. */
  description?: string;
  /** Illustrative example value for the field. */
  example?: string;
  /** Helpful tip displayed as a popover hint. */
  tip?: string;
  /** Informational note displayed as a popover hint. */
  info?: string;
  /** Warning displayed as a popover hint. */
  caution?: string;
}

/**
 * A named part a set of document types plays in the content model, shown as one sidebar section.
 *
 * @public
 */
export interface SanityHandbookDocumentRole {
  /** Display title for the document role. */
  title: string;
  /** Brief description of the role's purpose. */
  description?: string;
  /** Document definitions filling this role. */
  documents: DocumentDefinition[];
}

/**
 * A Portable Text block a consumer adds to guide content, pairing its schema with how it renders.
 *
 * @public
 */
export interface SanityHandbookBlockDefinition {
  /** Sanity schema type definition for the custom block. */
  schema: SchemaTypeDefinition;
  /** React component for rendering the block in the Handbook viewer. */
  component: ComponentType<{ value: PortableTextObject }>;
}

/**
 * Everything the plugin accepts, of which only the document roles are required.
 *
 * @public
 */
export interface SanityHandbookConfig {
  /** Title shown in the Studio tool navigation. `"Handbook"` when omitted. */
  title?: string;
  /** Heading displayed at the top of the sidebar. `"Handbook"` when omitted. */
  sidebarTitle?: string;
  /** Document roles, each shown as a labelled section in the sidebar. */
  roles: SanityHandbookDocumentRole[];
  /** Custom Portable Text block definitions for guide content. None when omitted. */
  blocks?: SanityHandbookBlockDefinition[];
  /** Email addresses permitted to edit Handbook documents. Everyone when omitted. */
  editors?: string[];
  /** Fallback message shown when a field has no description. A prompt to ask the development team when omitted. */
  undocumentedFieldMessage?: string;
}

/**
 * Creates a Handbook tool for Sanity Studio, generating documentation from document type schemas
 * alongside the Portable Text guides authored in the dataset.
 *
 * @param config - Plugin configuration.
 * @returns Sanity plugin definition.
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
