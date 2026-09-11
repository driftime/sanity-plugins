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
import { resolveIconNode, serializeIconNode } from "@/lib/nodes";
import { resolveIconOptions } from "@/lib/options";
import type { SanityIconConfig, SanityIconOptions } from "@/plugin";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

/** Compiled shape of an icon field, carrying the options the field itself was given. */
interface IconSchemaType extends ObjectSchemaType {
  options?: SanityIconOptions;
}

export type InputProps = ObjectInputProps<Partial<SanityIcon>, IconSchemaType>;

/**
 * Creates the input an icon field is drawn with, holding the configuration the plugin was given so a
 * field naming its own icons replaces them rather than adding to them.
 *
 * @param config - Configuration every field falls back to.
 * @returns The input component.
 */
export function createInput(config: SanityIconConfig) {
  function Input({ id, schemaType, value, onChange, readOnly }: InputProps) {
    const { name, node } = value ?? {};

    const [open, setOpen] = useState(false);

    const { icons } = resolveIconOptions(schemaType.options, config);
    const selectedNode = resolveIconNode(node);
    const selectedLabel = isDefined(name) ? convertCase(name, "sentence") : undefined;

    function handleSelect(icon: LibraryIcon) {
      onChange([
        setIfMissing({ _type: iconTypeName satisfies SanityIcon["_type"] }),
        set(icon.name, ["name" satisfies keyof SanityIcon]),
        set(serializeIconNode(icon.node), ["node" satisfies keyof SanityIcon]),
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
            isDefined(selectedNode) ? (
              <Drawing node={selectedNode} {...defaultIconProps} />
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
            aria-label="Clear the currently selected icon"
          />
        )}
        {open && (
          <Picker
            id={`${id}-library`}
            allowed={icons}
            selected={name}
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
