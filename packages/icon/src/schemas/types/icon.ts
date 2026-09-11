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
 * Creates the object type an icon is stored as, offering the icons it is given to every field that
 * does not name its own.
 *
 * @param config - Configuration every field falls back to.
 * @returns An object type definition for a stored icon.
 */
export function createIconType(config: SanityIconConfig) {
  return defineType({
    name: iconTypeName satisfies SanityIcon["_type"],
    type: "object",
    icon: createSanityIcon(SquareDashedIcon),
    description: "Icon chosen from the Lucide library.",
    // Deliberately the flat frame a primitive field gets, not the collapsible fieldset Sanity wraps an object in.
    components: { field: Field, input: createInput(config) },
    validation: (rule) =>
      rule.custom((value: Partial<SanityIcon> | undefined) =>
        !isDefined(value?.name) || isDefined(value.node) ? true : "Select the icon again so its drawing is stored.",
      ),
    preview: {
      select: {
        name: "name",
        node: "node",
      },
      prepare(selection: { name?: string; node?: string }) {
        const { name, node } = selection;

        return {
          title: isDefined(name) ? convertCase(name, "sentence") : "No icon",
          media: createIconPreview({ _type: iconTypeName, name, node }),
        };
      },
    },
    fields: [
      defineField({
        name: "name" satisfies keyof SanityIcon,
        type: "string",
        description: "Name of the chosen icon in the library it was taken from.",
      }),
      defineField({
        name: "node" satisfies keyof SanityIcon,
        type: "text",
        description: "Shapes the icon is drawn from, written when the icon is chosen.",
      }),
    ],
  });
}
