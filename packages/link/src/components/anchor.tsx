import { defaultIconProps } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import { TextInput } from "@sanity/ui";
import type { ChangeEvent } from "react";
import type { StringInputProps } from "sanity";
import { set, unset } from "sanity";

import { HashIcon } from "@/icons/hash";

export type AnchorProps = StringInputProps;

export function Anchor({ elementProps, value, onChange, readOnly }: AnchorProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;

    onChange(isDefined(next) ? set(next) : unset());
  }

  // The prefix slot sizes to its content, so the hash goes in the icon slot to match the field height.
  return (
    <TextInput
      {...elementProps}
      icon={<HashIcon {...defaultIconProps} width="0.8em" height="0.8em" />}
      value={value ?? ""}
      readOnly={readOnly}
      onChange={handleChange}
      placeholder="our-values"
    />
  );
}
