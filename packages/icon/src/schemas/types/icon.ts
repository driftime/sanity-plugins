import { Field } from "@repo/components/field";
import { createSanityIcon } from "@repo/lib/icons";
import { convertCase, isDefined } from "@repo/lib/utils";
import { defineField, defineType } from "sanity";

import { createInput } from "@/components/input";
import { SquareDashedIcon } from "@/icons/square-dashed";
import { createIconPreview } from "@/lib/preview";
import type { SanityIconConfig } from "@/plugin";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

/**
 * Creates the icon object type, offering the plugin's icons to fields that don't set their own.
 *
 * @param config - The plugin configuration.
 * @returns The icon type.
 */
export function createIconType(config: SanityIconConfig) {
  return defineType({
    name: iconTypeName satisfies SanityIcon["_type"],
    type: "object",
    icon: createSanityIcon(SquareDashedIcon),
    description: "Icon chosen from an icon library.",
    // Uses a primitive field's flat frame on purpose, instead of Sanity's collapsible object fieldset.
    components: { field: Field, input: createInput(config) },
    validation: (rule) =>
      rule.custom((value: Partial<SanityIcon> | undefined) =>
        !isDefined(value?.name) || isDefined(value.node) ? true : "Select the icon again to save its drawing.",
      ),
    preview: {
      select: {
        name: "name",
        node: "node",
      },
      prepare(selection: { name?: string; node?: string }) {
        const { name, node } = selection;

        return {
          title: isDefined(name) ? convertCase(name, "title") : "No icon",
          media: createIconPreview({ _type: iconTypeName, name, node }),
        };
      },
    },
    fields: [
      defineField({
        name: "library" satisfies keyof SanityIcon,
        type: "string",
        description: "Identifier of the library the icon came from.",
      }),
      defineField({
        name: "style" satisfies keyof SanityIcon,
        type: "string",
        description: "Identifier of the library style the icon came from.",
      }),
      defineField({
        name: "name" satisfies keyof SanityIcon,
        type: "string",
        description: "Name of the icon in its library.",
      }),
      defineField({
        name: "node" satisfies keyof SanityIcon,
        type: "text",
        description: "Shapes the icon is drawn from, saved when it's chosen.",
      }),
    ],
  });
}
