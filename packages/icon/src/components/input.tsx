import { defaultIconProps } from "@repo/lib/icons";
import { convertCase, isDefined } from "@repo/lib/utils";
import { CloseIcon } from "@sanity/icons/Close";
import { Button, Flex } from "@sanity/ui";
import { useState } from "react";
import type { ObjectInputProps, ObjectSchemaType } from "sanity";
import { set, setIfMissing, unset } from "sanity";

import { Drawing } from "@/components/drawing";
import { Picker } from "@/components/picker/picker";
import { SquareDashedIcon } from "@/icons/square-dashed";
import type { LibraryIcon } from "@/lib/library";
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

    function handleSelect(icon: LibraryIcon) {
      onChange([
        setIfMissing({ _type: iconTypeName satisfies SanityIcon["_type"] }),
        isDefined(library)
          ? set(library, ["library" satisfies keyof SanityIcon])
          : unset(["library" satisfies keyof SanityIcon]),
        isDefined(style)
          ? set(style, ["style" satisfies keyof SanityIcon])
          : unset(["style" satisfies keyof SanityIcon]),
        set(icon.name, ["name" satisfies keyof SanityIcon]),
        set(serializeIconDrawing(icon.drawing), ["node" satisfies keyof SanityIcon]),
      ]);

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
