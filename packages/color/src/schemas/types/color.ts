import { Field } from "@repo/components/field";
import { createSanityIcon } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import type { ValidationContext } from "sanity";
import { defineField, defineType, isObjectSchemaType } from "sanity";

import { createInput } from "@/components/input";
import { PaletteIcon } from "@/icons/palette";
import { resolveColorOptions } from "@/lib/options";
import type { SanityColorPalette } from "@/lib/palette";
import { createColorPreview } from "@/lib/preview";
import { getContrastReport, getVerdictSeverity } from "@/lib/report";
import { resolveColor, resolveColorValue } from "@/lib/resolve";
import type { ColorSchemaType, SanityColorConfig } from "@/plugin";
import type { SanityColor } from "@/types";
import { colorTypeName } from "@/types";

/**
 * Reads a color as a string, narrowing what a validation rule receives untyped.
 *
 * @param value - The stored object the rule is validating.
 * @param field - The color to read from it.
 * @returns The color, or undefined when nothing readable is stored.
 */
function readColor(value: Record<string, unknown> | undefined, field: string) {
  const color = value?.[field];

  return typeof color === "string" ? color : undefined;
}

/**
 * Builds the contrast rule for a color field. Only a pairing no reader could make out is rejected;
 * one legible as a heading is reported as a warning.
 *
 * @param palette - The palette bound to the helpers reading it.
 * @param config - Configuration every field falls back to.
 * @param severity - The severity this validator speaks at.
 * @returns The validator, ready for a rule to wrap.
 */
function createColorValidator(palette: SanityColorPalette, config: SanityColorConfig, severity: "error" | "warning") {
  return (value: Record<string, unknown> | undefined, context: ValidationContext) => {
    const schemaType: ColorSchemaType | undefined = isObjectSchemaType(context.type) ? context.type : undefined;

    const { standard } = resolveColorOptions(schemaType?.options, config);
    if (standard === "off") return true;

    const { ratio } = resolveColor(
      {
        _type: colorTypeName,
        background: readColor(value, "background" satisfies keyof SanityColor),
        text: readColor(value, "text" satisfies keyof SanityColor),
      },
      palette,
    );

    if (!isDefined(ratio)) return true;

    const { verdict, detail } = getContrastReport(ratio, standard);

    // Both severities are registered as rules, so each only speaks when the verdict is its own.
    return getVerdictSeverity(verdict) === severity ? detail : true;
  };
}

/**
 * Creates the object type a color is stored as, offering the palette it is given to every field
 * that does not name its own.
 *
 * @param palette - The palette bound to the helpers reading it.
 * @param config - Configuration every field falls back to.
 * @returns An object type definition for a stored color.
 */
export function createColorType(palette: SanityColorPalette, config: SanityColorConfig) {
  const errorValidator = createColorValidator(palette, config, "error");
  const warningValidator = createColorValidator(palette, config, "warning");

  /**
   * Names a chosen color for the preview, falling back to its hex where it came from outside the
   * palette and so has no name of its own.
   *
   * @param value - The color to describe.
   * @param hex - What it resolved to, needed only where it names an image swatch.
   * @returns The color's label, or undefined when nothing is selected.
   */
  function getColorLabel(value: string | undefined, hex: string | undefined) {
    const resolved = resolveColorValue(value, palette, hex);

    return resolved?.label ?? resolved?.hex;
  }

  return defineType({
    name: colorTypeName satisfies SanityColor["_type"],
    type: "object",
    icon: createSanityIcon(PaletteIcon),
    description: "Background color and the text placed on it.",
    // Deliberately the flat frame a primitive field gets, not the collapsible fieldset Sanity wraps an object in.
    components: { field: Field, input: createInput(palette, config) },
    validation: (rule) => [rule.custom(errorValidator), rule.custom(warningValidator).warning()],
    preview: {
      select: {
        background: "background",
        backgroundHex: "backgroundHex",
        text: "text",
        textHex: "textHex",
      },
      prepare(selection: { background?: string; backgroundHex?: string; text?: string; textHex?: string }) {
        const { background, backgroundHex, text, textHex } = selection;
        const textLabel = getColorLabel(text, textHex);
        const resolved = resolveColorValue(background, palette, backgroundHex);

        return {
          title: getColorLabel(background, backgroundHex) ?? "No background",
          subtitle: isDefined(textLabel) ? `${textLabel} text` : "Automatic text",
          media: createColorPreview(resolved?.hex),
        };
      },
    },
    fields: [
      defineField({
        name: "background" satisfies keyof SanityColor,
        type: "string",
        description: "Color painted behind the content.",
      }),
      defineField({
        name: "backgroundHex" satisfies keyof SanityColor,
        type: "string",
        description: "Color the background swatch resolved to, written only where one was chosen.",
        hidden: true,
      }),
      defineField({
        name: "text" satisfies keyof SanityColor,
        type: "string",
        description: "Color of the text on it. Leave empty to take the pairing the palette sets.",
      }),
      defineField({
        name: "textHex" satisfies keyof SanityColor,
        type: "string",
        description: "Color the text swatch resolved to, written only where one was chosen.",
        hidden: true,
      }),
    ],
  });
}
