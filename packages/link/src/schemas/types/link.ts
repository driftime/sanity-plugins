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
 * Creates the link object type, with page links to the configured document types.
 *
 * @param config - The plugin configuration.
 * @returns The link type.
 */
export function createLinkType(config: SanityLinkConfig) {
  const { documentTypes, title: { field: titleField = defaultTitleField } = {} } = config;

  return defineType({
    name: linkTypeName satisfies SanityLink["_type"],
    type: "object",
    icon: createSanityIcon(LinkIcon),
    description: "Link to a page, a URL, an email address, a phone number, or a file.",
    // Uses a primitive field's flat frame on purpose, instead of Sanity's collapsible object fieldset.
    components: { field: Field, input: createInput(titleField, config) },
    // Validated here rather than on the hidden `type` field, where the error would never be seen.
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
        description: "Kind of destination, chosen from the tabs.",
        // Sanity drops an object whose fields are all hidden, so this field stays in the form but renders nothing.
        components: { field: Hidden },
      }),
      defineField({
        name: "reference" satisfies keyof SanityPageLink,
        type: "reference",
        description: "Page on this site to link to, which stays linked if its address changes.",
        to: documentTypes.map((type) => ({ type })),
        hidden: ({ parent }) => !showsField(parent, "reference"),
        validation: (rule) =>
          rule.custom((value, context) =>
            isLinkType(context.parent, "page") && !isDefined(value) ? "Choose the page to link to." : true,
          ),
      }),
      defineField({
        name: "url" satisfies keyof SanityUrlLink,
        type: "url",
        title: "URL",
        description: "Full web address, including https://.",
        hidden: ({ parent }) => !showsField(parent, "url"),
        validation: (rule) =>
          rule
            .uri({ scheme: ["http", "https"] })
            .custom((value, context) =>
              isLinkType(context.parent, "url") && !isDefined(value) ? "Enter the web address." : true,
            ),
      }),
      defineField({
        name: "email" satisfies keyof SanityEmailLink,
        type: "string",
        description: "Email address the link opens a message to.",
        hidden: ({ parent }) => !showsField(parent, "email"),
        validation: (rule) =>
          rule
            .email()
            .custom((value, context) =>
              isLinkType(context.parent, "email") && !isDefined(value) ? "Enter the email address." : true,
            ),
      }),
      defineField({
        name: "subject" satisfies keyof SanityEmailLink,
        type: "string",
        description: "Subject line filled in for the visitor.",
        hidden: ({ parent }) => !showsField(parent, "subject"),
      }),
      defineField({
        name: "phone" satisfies keyof SanityPhoneLink,
        type: "string",
        description: "Phone number to call. Spaces are ignored.",
        hidden: ({ parent }) => !showsField(parent, "phone"),
        validation: (rule) =>
          rule
            .regex(/^\+?[\d\s()-]{6,}$/u, { name: "phone number" })
            .custom((value, context) =>
              isLinkType(context.parent, "phone") && !isDefined(value) ? "Enter the phone number." : true,
            ),
      }),
      defineField({
        name: "file" satisfies keyof SanityFileLink,
        type: "file",
        description: "File the visitor downloads.",
        hidden: ({ parent }) => !showsField(parent, "file"),
        validation: (rule) =>
          rule.custom((value, context) =>
            isLinkType(context.parent, "file") && !isDefined(value) ? "Upload the file to link to." : true,
          ),
      }),
      defineField({
        name: "anchor" satisfies keyof SanityPageLink,
        type: "string",
        description: "Section of the page to link to. Leave out the leading #.",
        hidden: ({ parent }) => !showsField(parent, "anchor"),
        components: { input: Anchor },
        validation: (rule) =>
          rule.custom((value, context) => {
            if (!isDefined(value)) {
              return isLinkType(context.parent, "anchor") ? "Enter the section to link to." : true;
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
        description: "Query parameters added to the address, such as campaign tracking values.",
        hidden: ({ parent }) => !showsField(parent, "searchParams"),
        components: { input: SearchParams },
        validation: (rule) =>
          rule.custom((value: SanityLinkSearchParam[] | undefined) =>
            !isDefined(value) || value.every(({ key, value: carried }) => !isDefined(carried) || isDefined(key))
              ? true
              : "Add a name to every parameter that has a value.",
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
                description: "Parameter name.",
              }),
              defineField({
                name: "value" satisfies keyof SanityLinkSearchParam,
                type: "string",
                description: "Parameter value.",
              }),
            ],
          }),
        ],
      }),
      defineField({
        name: "label" satisfies keyof SanityLink,
        type: "string",
        description: "Text the visitor clicks. Write it so it makes sense on its own.",
        hidden: ({ parent }) => isLinkMark(parent) || !linkTypes.some(({ name }) => isLinkType(parent, name)),
        validation: (rule) =>
          rule.custom((value, context) => {
            const { parent } = context;
            if (isLinkMark(parent) || isLinkType(parent, "page")) return true;

            return linkTypes.some(({ name }) => isLinkType(parent, name)) && !isDefined(value)
              ? "Enter the link text."
              : true;
          }),
      }),
    ],
  });
}
