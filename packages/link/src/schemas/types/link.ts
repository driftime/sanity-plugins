import { Field } from "@repo/components/field";
import { createSanityIcon } from "@repo/lib/icons";
import { convertCase, isDefined } from "@repo/lib/utils";
import { defineArrayMember, defineField, defineType } from "sanity";

import { Anchor } from "@/components/anchor";
import { Hidden } from "@/components/hidden";
import { createInput } from "@/components/input";
import { SearchParams } from "@/components/search-params";
import { defaultTitleField } from "@/config/defaults";
import { linkTypes } from "@/config/destinations";
import { LinkIcon } from "@/icons/link";
import { getLinkType, isLinkMark, isLinkType, showsField } from "@/lib/link-types";
import type { SanityLinkConfig } from "@/plugin";
import type {
  SanityEmailLink,
  SanityFileLink,
  SanityLink,
  SanityLinkDestination,
  SanityLinkSearchParam,
  SanityPageLink,
  SanityPhoneLink,
  SanityUrlLink,
} from "@/types";
import { linkTypeName, searchParamTypeName } from "@/types";

/**
 * Creates the object type a link is stored as, offering internal pages among the document types it
 * is given and borrowing a label from whichever field those documents hold their title in.
 *
 * @param config - Configuration the plugin was given.
 * @returns An object type definition for a stored link.
 */
export function createLinkType(config: SanityLinkConfig) {
  const { documentTypes, title: { field: titleField = defaultTitleField } = {} } = config;

  return defineType({
    name: linkTypeName satisfies SanityLink["_type"],
    type: "object",
    icon: createSanityIcon(LinkIcon),
    description: "Link to a page, a URL, an email address, a phone number, or a file.",
    // Deliberately the flat frame a primitive field gets, not the collapsible fieldset Sanity wraps an object in.
    components: { field: Field, input: createInput(titleField, config) },
    // The field naming the destination sits behind a tab, so requiring it would report where nobody looks.
    validation: (rule) =>
      rule.custom((value: Partial<SanityLink> | undefined) =>
        !isDefined(value) || isDefined(value.type) ? true : "Choose a destination.",
      ),
    preview: {
      select: {
        type: "type",
        title: `reference.${titleField}`,
        label: "label",
      },
      prepare(selection: { type?: SanityLinkDestination; title?: string; label?: string }) {
        const { type, title, label } = selection;
        const linkType = getLinkType(type);

        return {
          title: label ?? title ?? linkType?.label ?? "Link",
          media: createSanityIcon(linkType?.icon ?? LinkIcon),
        };
      },
    },
    fields: [
      defineField({
        name: "type" satisfies keyof SanityLink,
        type: "string",
        description: "Which kind of destination this link points at, chosen from the tabs above.",
        // Sanity drops an object whose every member is hidden, so this field is kept in the form and draws nothing.
        components: { field: Hidden },
      }),
      defineField({
        name: "reference" satisfies keyof SanityPageLink,
        type: "reference",
        description: "Page on this site to link to, which keeps working if its address changes.",
        to: documentTypes.map((type) => ({ type })),
        hidden: ({ parent }) => !showsField(parent, "reference"),
        validation: (rule) =>
          rule.custom((value, context) =>
            isLinkType(context.parent, "page") && !isDefined(value) ? "Choose the page this link opens." : true,
          ),
      }),
      defineField({
        name: "url" satisfies keyof SanityUrlLink,
        type: "url",
        title: "URL",
        description: "Full web address to link to, including the https:// in front of it.",
        hidden: ({ parent }) => !showsField(parent, "url"),
        validation: (rule) =>
          rule
            .uri({ scheme: ["http", "https"] })
            .custom((value, context) =>
              isLinkType(context.parent, "url") && !isDefined(value) ? "Enter the web address this link opens." : true,
            ),
      }),
      defineField({
        name: "email" satisfies keyof SanityEmailLink,
        type: "string",
        description: "Address a message opens to when a visitor follows this link.",
        hidden: ({ parent }) => !showsField(parent, "email"),
        validation: (rule) =>
          rule
            .email()
            .custom((value, context) =>
              isLinkType(context.parent, "email") && !isDefined(value)
                ? "Enter the address this link opens a message to."
                : true,
            ),
      }),
      defineField({
        name: "subject" satisfies keyof SanityEmailLink,
        type: "string",
        description: "Optional subject line, filled in for the visitor before they start writing.",
        hidden: ({ parent }) => !showsField(parent, "subject"),
      }),
      defineField({
        name: "phone" satisfies keyof SanityPhoneLink,
        type: "string",
        description: "Number to call, written however it reads best. Spacing is ignored.",
        hidden: ({ parent }) => !showsField(parent, "phone"),
        validation: (rule) =>
          rule
            .regex(/^\+?[\d\s()-]{6,}$/u, { name: "phone number" })
            .custom((value, context) =>
              isLinkType(context.parent, "phone") && !isDefined(value) ? "Enter the number this link calls." : true,
            ),
      }),
      defineField({
        name: "file" satisfies keyof SanityFileLink,
        type: "file",
        description: "File a visitor downloads, uploaded here so it stays with the link.",
        hidden: ({ parent }) => !showsField(parent, "file"),
        validation: (rule) =>
          rule.custom((value, context) =>
            isLinkType(context.parent, "file") && !isDefined(value) ? "Upload the file this link serves." : true,
          ),
      }),
      defineField({
        name: "anchor" satisfies keyof SanityPageLink,
        type: "string",
        description: "Section of the page to send the visitor to, named without its leading hash.",
        hidden: ({ parent }) => !showsField(parent, "anchor"),
        components: { input: Anchor },
        validation: (rule) =>
          rule.custom((value, context) => {
            if (!isDefined(value)) {
              return isLinkType(context.parent, "anchor") ? "Name the section this link scrolls to." : true;
            }

            return value === convertCase(value, "kebab")
              ? true
              : "Write the section name in lowercase, with hyphens instead of spaces.";
          }),
      }),
      defineField({
        name: "searchParams" satisfies keyof SanityPageLink,
        type: "array",
        title: "Search Parameters",
        description: "Extra values carried in the address, often recording where a visitor came from.",
        hidden: ({ parent }) => !showsField(parent, "searchParams"),
        components: { input: SearchParams },
        validation: (rule) =>
          rule.custom((value: SanityLinkSearchParam[] | undefined) =>
            !isDefined(value) || value.every(({ key, value: carried }) => !isDefined(carried) || isDefined(key))
              ? true
              : "Name every parameter that carries a value.",
          ),
        of: [
          defineArrayMember({
            name: searchParamTypeName satisfies SanityLinkSearchParam["_type"],
            type: "object",
            preview: {
              select: {
                key: "key" satisfies keyof SanityLinkSearchParam,
                value: "value" satisfies keyof SanityLinkSearchParam,
              },
              prepare(selection: { key?: string; value?: string }) {
                const { key, value } = selection;

                return { title: key ?? "Parameter", subtitle: value };
              },
            },
            fields: [
              defineField({
                name: "key" satisfies keyof SanityLinkSearchParam,
                type: "string",
                description: "Name this value is read under.",
              }),
              defineField({
                name: "value" satisfies keyof SanityLinkSearchParam,
                type: "string",
                description: "Value carried under that name.",
              }),
            ],
          }),
        ],
      }),
      defineField({
        name: "label" satisfies keyof SanityLink,
        type: "string",
        description: "Text a visitor clicks, which should still make sense out of context.",
        hidden: ({ parent }) => isLinkMark(parent) || !linkTypes.some(({ name }) => isLinkType(parent, name)),
        validation: (rule) =>
          rule.custom((value, context) => {
            const { parent } = context;
            if (isLinkMark(parent) || isLinkType(parent, "page")) return true;

            return linkTypes.some(({ name }) => isLinkType(parent, name)) && !isDefined(value)
              ? "Write the text a visitor clicks."
              : true;
          }),
      }),
    ],
  });
}
