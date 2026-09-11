import { isDefined } from "@repo/lib/utils";
import { TextInput } from "@sanity/ui";
import type { ChangeEvent, ComponentProps } from "react";
import { useState } from "react";

import { parseColor } from "@/lib/formats";

export type HexProps = Omit<ComponentProps<typeof TextInput>, "value" | "onChange" | "onSelect"> & {
  value: string;
  onSelect: (value: string | undefined) => void;
};

export function Hex({ value, onSelect, ...props }: HexProps) {
  // Separate from the stored colour so a half-typed code is not overwritten by the last valid one.
  const [draft, setDraft] = useState<string>();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const entered = event.currentTarget.value;
    setDraft(entered);

    const parsed = parseColor(entered);
    if (isDefined(parsed)) onSelect(parsed.hex);
  }

  return (
    <TextInput
      value={draft ?? value}
      onChange={handleChange}
      fontSize={1}
      maxLength={7}
      style={{ width: "6rem" }}
      aria-label="Custom color as a hex code"
      {...props}
    />
  );
}
