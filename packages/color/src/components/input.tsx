import { isDefined } from "@repo/lib/utils";
import { CloseIcon } from "@sanity/icons/Close";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useEffect } from "react";
import type { ObjectInputProps } from "sanity";
import { set, setIfMissing, unset, useFormValue } from "sanity";

import { Picker } from "@/components/picker/picker";
import { Preview } from "@/components/picker/preview";
import { logger } from "@/config/defaults";
import { useImagePalette } from "@/hooks/use-image-palette";
import { parseColor } from "@/lib/formats";
import { resolveImageReference } from "@/lib/image";
import { resolveColorOptions } from "@/lib/options";
import type { SanityColorPalette } from "@/lib/palette";
import { resolveColor } from "@/lib/resolve";
import { createColorSwatch, resolveColorSwatch } from "@/lib/swatches";
import type { ColorSchemaType, SanityColorConfig } from "@/plugin";
import type { SanityColor, SanityColorSwatchName } from "@/types";
import { colorTypeName } from "@/types";

export type InputProps = ObjectInputProps<Partial<SanityColor>, ColorSchemaType>;

/**
 * Creates the input a color field is drawn with, holding the palette and the slots the plugin was
 * configured with so a field naming its own replaces them rather than adding to them.
 *
 * @param palette - The palette bound to the helpers reading it.
 * @param config - Configuration every field falls back to.
 * @returns The input component.
 */
export function createInput(palette: SanityColorPalette, config: SanityColorConfig) {
  function Input({ id, path, schemaType, value, onChange, readOnly }: InputProps) {
    const { background, backgroundHex, text, textHex } = value ?? {};
    const { pickers, sources, colors, image, custom, preview } = resolveColorOptions(schemaType.options, config);

    const wantsImage = sources.includes("image");
    const imageField = image.field;

    // Read unconditionally, since a field naming no image must still not change the hooks it calls.
    const parent = useFormValue(path.slice(0, -1));
    const imagePalette = useImagePalette(wantsImage ? resolveImageReference(parent, imageField) : undefined);

    const resolved = resolveColor({ ...value, _type: colorTypeName }, palette);

    const drifted = (["background", "text"] as const).flatMap((field) => {
      const swatch = resolveColorSwatch(field === "background" ? background : text);
      if (!isDefined(imagePalette) || !isDefined(swatch)) return [];

      const current = parseColor(imagePalette[swatch]?.background)?.hex;
      const stored = field === "background" ? backgroundHex : textHex;
      const hexField = field === "background" ? "backgroundHex" : "textHex";

      return isDefined(current) && current !== stored ? [set(current, [hexField])] : [];
    });

    useEffect(() => {
      if (wantsImage === isDefined(imageField)) return;

      logger.warn(
        wantsImage
          ? `The color field "${id}" names image as a source but no image to read it from. Set options.image.field.`
          : `The color field "${id}" names an image to read but not image as a source. Add it to options.sources.`,
      );
    }, [id, wantsImage, imageField]);

    useEffect(() => {
      if (!isDefined(drifted)) return;

      onChange(drifted);
    }, [drifted, onChange]);

    function handleSelect(field: "background" | "text", selected: string | undefined, swatch?: SanityColorSwatchName) {
      const hexField = field === "background" ? "backgroundHex" : "textHex";

      if (!isDefined(selected)) {
        onChange(field === "background" ? unset() : [unset([field]), unset([hexField])]);

        return;
      }

      onChange([
        setIfMissing({ _type: colorTypeName satisfies SanityColor["_type"] }),
        set(isDefined(swatch) ? createColorSwatch(swatch) : selected, [field]),
        isDefined(swatch) ? set(selected, [hexField]) : unset([hexField]),
      ]);
    }

    return (
      <Stack gap={2}>
        {pickers.length === 0 && (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>This field has no colors to set. Name at least one picker in its options.</Text>
          </Card>
        )}
        <Flex gap={2} align="center" wrap="wrap">
          {pickers.includes("background") && (
            <Picker
              id={`${id}-background`}
              palette={palette}
              value={background}
              hex={backgroundHex}
              placeholder="No background"
              imagePalette={imagePalette}
              sources={sources}
              colors={colors}
              swatches={image.swatches}
              initialCustom={custom.initial.background}
              readOnly={readOnly}
              onSelect={(selected, swatch) => {
                handleSelect("background", selected, swatch);
              }}
            />
          )}
          {pickers.includes("text") && (
            <Picker
              id={`${id}-text`}
              palette={palette}
              value={text}
              hex={textHex}
              placeholder="Automatic text"
              imagePalette={imagePalette}
              sources={sources}
              colors={colors}
              swatches={image.swatches}
              initialCustom={custom.initial.text}
              readOnly={readOnly}
              onSelect={(selected, swatch) => {
                handleSelect("text", selected, swatch);
              }}
            />
          )}
          {!isDefined(preview.text) && isDefined(resolved.background) && (
            <Preview background={resolved.background.hex} text={resolved.text?.hex}>
              {undefined}
            </Preview>
          )}
          {isDefined(value) && (
            <Button
              type="button"
              mode="ghost"
              tone="critical"
              icon={<CloseIcon />}
              text="Clear"
              disabled={readOnly}
              onClick={() => {
                onChange(unset());
              }}
              aria-label="Clear the selected colors"
            />
          )}
        </Flex>
        {isDefined(preview.text) && isDefined(resolved.background) && (
          <Preview background={resolved.background.hex} text={resolved.text?.hex}>
            {preview.text}
          </Preview>
        )}
      </Stack>
    );
  }

  return Input;
}
