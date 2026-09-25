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
 * Reads a color string from the value a validation rule receives.
 *
 * @param value - The stored object being validated.
 * @param field - The field to read.
 * @returns The color, or undefined when it isn't a string.
 */
function readColor(value: Record<string, unknown> | undefined, field: string) {
  const color = value?.[field];

  return typeof color === "string" ? color : undefined;
}

/**
 * Creates a contrast validator for a color field. Pairings unreadable at any size are errors, and
 * pairings readable only at large sizes are warnings.
 *
 * @param palette - The palette.
 * @param config - The plugin configuration.
 * @param severity - The severity this validator reports.
 * @returns The validator.
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

    // One rule is registered per severity, and each only reports verdicts of its own severity.
    return getVerdictSeverity(verdict) === severity ? detail : true;
  };
}

/**
 * Creates the color object type, offering the plugin's palette to fields that don't set their own.
 *
 * @param palette - The palette.
 * @param config - The plugin configuration.
 * @returns The color type.
 */
export function createColorType(palette: SanityColorPalette, config: SanityColorConfig) {
  const errorValidator = createColorValidator(palette, config, "error");
  const warningValidator = createColorValidator(palette, config, "warning");

  /**
   * Labels a color for the preview, falling back to its hex code when it isn't from the palette.
   *
   * @param value - The stored color.
   * @param hex - The resolved color, needed only for an image swatch.
   * @returns The label, or undefined when nothing is selected.
   */
  function getColorLabel(value: string | undefined, hex: string | undefined) {
    const resolved = resolveColorValue(value, palette, hex);

    return resolved?.label ?? resolved?.hex;
  }

  return defineType({
    name: colorTypeName satisfies SanityColor["_type"],
    type: "object",
    icon: createSanityIcon(PaletteIcon),
    description: "Background color and the text color on it.",
    // Uses a primitive field's flat frame on purpose, instead of Sanity's collapsible object fieldset.
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
        description: "Color behind the content.",
      }),
      defineField({
        name: "backgroundHex" satisfies keyof SanityColor,
        type: "string",
        description: "Hex value of the background's image swatch, set only when a swatch is chosen.",
        hidden: true,
      }),
      defineField({
        name: "text" satisfies keyof SanityColor,
        type: "string",
        description: "Color of the text on the background. Leave empty to pair one automatically.",
      }),
      defineField({
        name: "textHex" satisfies keyof SanityColor,
        type: "string",
        description: "Hex value of the text's image swatch, set only when a swatch is chosen.",
        hidden: true,
      }),
    ],
  });
}
