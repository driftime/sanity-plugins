import { defaultIconProps } from "@repo/lib/icons";
import { convertCase, isDefined } from "@repo/lib/utils";
import { CloseIcon } from "@sanity/icons/Close";
import { Button, Flex } from "@sanity/ui";
import { useEffect, useState } from "react";
import type { ObjectInputProps, ObjectSchemaType } from "sanity";
import { set, setIfMissing, unset } from "sanity";

import { Drawing } from "@/components/drawing";
import { Picker } from "@/components/picker/picker";
import { logger } from "@/config/defaults";
import { SquareDashedIcon } from "@/icons/square-dashed";
import type { LibraryIcon } from "@/lib/library";
import { requestLibrary, selectIcons } from "@/lib/library";
import { resolveIconDrawing, serializeIconDrawing } from "@/lib/nodes";
import { resolveIconOptions } from "@/lib/options";
import type { SanityIconConfig, SanityIconOptions } from "@/plugin";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

/** Compiled icon field type, with the field's own options. */
interface IconSchemaType extends ObjectSchemaType {
  options?: SanityIconOptions;
}

export type InputProps = ObjectInputProps<Partial<SanityIcon>, IconSchemaType>;

/**
 * Creates the patches that store an icon, with the library and style it was chosen from.
 *
 * @param icon - The icon.
 * @param library - Identifier of the library, or undefined when none is set.
 * @param style - Identifier of the style, or undefined for the library's default.
 * @returns The patches.
 */
function createSelectionPatches(icon: LibraryIcon, library: string | undefined, style: string | undefined) {
  return [
    setIfMissing({ _type: iconTypeName satisfies SanityIcon["_type"] }),
    isDefined(library)
      ? set(library, ["library" satisfies keyof SanityIcon])
      : unset(["library" satisfies keyof SanityIcon]),
    isDefined(style) ? set(style, ["style" satisfies keyof SanityIcon]) : unset(["style" satisfies keyof SanityIcon]),
    set(icon.name, ["name" satisfies keyof SanityIcon]),
    set(serializeIconDrawing(icon.drawing), ["node" satisfies keyof SanityIcon]),
  ];
}

/**
 * Creates the icon field input, bound to the plugin's configuration. A field's own icons replace the
 * plugin's rather than adding to them.
 *
 * @param config - The plugin configuration.
 * @returns The input component.
 */
export function createInput(config: SanityIconConfig) {
  function Input({ id, schemaType, value, onChange, readOnly }: InputProps) {
    const { library: storedLibrary, name, node } = value ?? {};

    const [open, setOpen] = useState(false);

    const { library, style, icons } = resolveIconOptions(schemaType.options, config);
    const selectedDrawing = resolveIconDrawing(node);
    const selectedName = storedLibrary === library ? name : undefined;
    const selectedLabel = isDefined(name) ? convertCase(name, "title") : undefined;
    const undrawnName = isDefined(node) ? undefined : name;

    // An initial value names an icon without its drawing, so the drawing is saved when the field is first shown.
    useEffect(() => {
      let active = true;

      async function saveDrawing() {
        if (!isDefined(undrawnName) || readOnly === true) return;

        const { icons: libraryIcons } = await requestLibrary(library, style);
        if (!active || !isDefined(libraryIcons)) return;

        const icon = selectIcons(libraryIcons, icons).find((candidate) => candidate.name === undrawnName);

        if (!isDefined(icon)) {
          logger.warn(
            `The icon field "${id}" starts with "${undrawnName}", which isn't one of its icons. Change its initialValue.`,
          );

          return;
        }

        onChange(createSelectionPatches(icon, library, style));
      }

      void saveDrawing();

      return () => {
        active = false;
      };
    }, [id, undrawnName, readOnly, library, style, icons, onChange]);

    function handleSelect(icon: LibraryIcon) {
      onChange(createSelectionPatches(icon, library, style));
      setOpen(false);
    }

    return (
      <Flex gap={2}>
        <Button
          id={id}
          type="button"
          mode="ghost"
          icon={
            isDefined(selectedDrawing) ? (
              <Drawing drawing={selectedDrawing} width="1em" height="1em" />
            ) : (
              <SquareDashedIcon {...defaultIconProps} />
            )
          }
          text={selectedLabel ?? "Select icon"}
          disabled={readOnly}
          onClick={() => {
            setOpen(true);
          }}
          aria-label={isDefined(selectedLabel) ? `${selectedLabel} currently selected` : "Select icon"}
        />
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
            aria-label="Clear the selected icon"
          />
        )}
        {open && (
          <Picker
            id={`${id}-library`}
            library={library}
            iconStyle={style}
            allowed={icons}
            selected={selectedName}
            onSelect={handleSelect}
            onClose={() => {
              setOpen(false);
            }}
            onClickOutside={() => {
              setOpen(false);
            }}
          />
        )}
      </Flex>
    );
  }

  return Input;
}
