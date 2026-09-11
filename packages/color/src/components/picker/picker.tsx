import { convertCase, isDefined } from "@repo/lib/utils";
import { ChevronDownIcon } from "@sanity/icons/ChevronDown";
import { ColorWheelIcon } from "@sanity/icons/ColorWheel";
import { RemoveCircleIcon } from "@sanity/icons/RemoveCircle";
import { Box, Button, Flex, Text } from "@sanity/ui";
import { Menu, MenuButton, MenuDivider, MenuItem } from "@sanity/ui/menu";
import type { ComponentProps } from "react";

import { Hex } from "@/components/picker/hex";
import { Swatch } from "@/components/swatch";
import { parseColor } from "@/lib/formats";
import type { SanityColorPalette } from "@/lib/palette";
import { resolveColorValue } from "@/lib/resolve";
import { getAvailableSwatches } from "@/lib/swatches";
import type { SanityColorSource } from "@/plugin";
import type { SanityColorSwatchName, SanityImagePalette } from "@/types";

type HeadingProps = ComponentProps<typeof Text> & { children: string };

function Heading({ children, ...props }: HeadingProps) {
  return (
    <Box paddingX={3} paddingTop={3} paddingBottom={2}>
      <Text size={1} weight="medium" muted {...props}>
        {children}
      </Text>
    </Box>
  );
}

export type PickerProps = Omit<ComponentProps<typeof Flex>, "children" | "onSelect"> & {
  id: string;
  palette: SanityColorPalette;
  value: string | undefined;
  hex: string | undefined;
  placeholder: string;
  sources: SanityColorSource[];
  colors: string[] | undefined;
  imagePalette: SanityImagePalette | undefined;
  swatches: SanityColorSwatchName[];
  initialCustom: string;
  readOnly: boolean | undefined;
  onSelect: (value: string | undefined, swatch?: SanityColorSwatchName) => void;
};

export function Picker({
  id,
  palette,
  value,
  hex,
  placeholder,
  sources,
  colors,
  imagePalette,
  swatches: allowedSwatches,
  initialCustom,
  readOnly,
  onSelect,
  ...props
}: PickerProps) {
  const resolved = resolveColorValue(value, palette, hex);
  const selected = resolved?.hex;
  const isCustom = isDefined(resolved) && !isDefined(resolved.name) && !isDefined(resolved.swatch);

  const offered = (sources.includes("palette") ? Object.entries(palette) : [])
    .filter(([name, entry]) => entry.hidden !== true && (!isDefined(colors) || colors.includes(name)))
    .map(([name, entry]) => ({ name, entry, color: parseColor(entry.value)?.hex }));

  const allowCustom = sources.includes("custom");
  const swatches = sources.includes("image") ? getAvailableSwatches(imagePalette, allowedSwatches) : [];

  const swatchLabel = isDefined(resolved?.swatch) ? convertCase(resolved.swatch, "sentence") : undefined;
  const selectedLabel = resolved?.label ?? swatchLabel ?? (isCustom ? "Custom" : undefined) ?? placeholder;

  return (
    <Flex gap={2} align="center" wrap="wrap" {...props}>
      <MenuButton
        id={id}
        button={
          <Button
            type="button"
            mode="ghost"
            icon={<Swatch color={selected} />}
            iconRight={ChevronDownIcon}
            text={selectedLabel}
            disabled={readOnly}
            aria-label={`${selectedLabel} currently selected`}
          />
        }
        menu={
          <Menu>
            <MenuItem
              icon={<RemoveCircleIcon />}
              text={placeholder}
              onClick={() => {
                onSelect(undefined);
              }}
            />
            {offered.length > 0 && <MenuDivider />}
            {offered.length > 0 && <Heading>Palette</Heading>}
            {offered.map(({ name, entry, color }) => (
              <MenuItem
                key={name}
                icon={<Swatch color={color} />}
                text={entry.label}
                pressed={name === resolved?.name}
                onClick={() => {
                  onSelect(name);
                }}
              />
            ))}
            {swatches.length > 0 && <MenuDivider />}
            {swatches.length > 0 && <Heading>Image palette</Heading>}
            {swatches.map(({ name, background }) => (
              <MenuItem
                key={name}
                icon={<Swatch color={background} />}
                text={convertCase(name, "sentence")}
                pressed={name === resolved?.swatch}
                onClick={() => {
                  onSelect(parseColor(background)?.hex, name);
                }}
              />
            ))}
            {allowCustom && <MenuDivider />}
            {allowCustom && (
              <MenuItem
                icon={<ColorWheelIcon />}
                text="Custom"
                pressed={isCustom}
                onClick={() => {
                  onSelect(parseColor(initialCustom)?.hex);
                }}
              />
            )}
          </Menu>
        }
      />
      {allowCustom && isCustom && isDefined(selected) && (
        <Hex value={selected} readOnly={readOnly} onSelect={onSelect} />
      )}
    </Flex>
  );
}
