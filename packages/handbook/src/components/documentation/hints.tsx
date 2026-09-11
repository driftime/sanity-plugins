import { defaultIconProps } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import { Flex } from "@sanity/ui";
import type { FlexProps } from "@sanity/ui";
import { useState } from "react";

import { FieldHint } from "@/components/documentation/hint";
import { hintKinds } from "@/config/hints";
import type { SanityHandbookMetadata } from "@/plugin";

export type FieldHintsProps = FlexProps & Pick<SanityHandbookMetadata, "tip" | "info" | "caution">;

export function FieldHints({ tip, info, caution, ...props }: FieldHintsProps) {
  const [openHint, setOpenHint] = useState<string | undefined>(undefined);

  const hints = { tip, info, caution };

  function closeHint() {
    setOpenHint(undefined);
  }

  return (
    <Flex align="center" gap={2} {...props}>
      {hintKinds.flatMap(({ name, label, icon: Icon }) => {
        const hint = hints[name];
        if (!isDefined(hint)) return [];

        return (
          <FieldHint
            key={name}
            label={label}
            icon={<Icon {...defaultIconProps} />}
            open={openHint === name}
            onOpen={() => {
              setOpenHint(name);
            }}
            onClose={closeHint}
          >
            {hint}
          </FieldHint>
        );
      })}
    </Flex>
  );
}
