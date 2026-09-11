import { Box, Button, Stack, Text, useClickOutsideEvent } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import { useRef } from "react";
import type { ComponentProps, ReactNode } from "react";

export type FieldHintProps = Omit<ComponentProps<typeof Popover>, "content" | "open" | "children"> & {
  label: string;
  icon: ReactNode;
  open: boolean;
  children: string;
  onOpen: () => void;
  onClose: () => void;
};

export function FieldHint({ label, icon, open, children, onOpen, onClose, ...props }: FieldHintProps) {
  const buttonReference = useRef<HTMLButtonElement>(null);
  const popoverReference = useRef<HTMLDivElement>(null);

  useClickOutsideEvent(open ? onClose : undefined, () => [buttonReference.current, popoverReference.current]);

  return (
    <Popover
      open={open}
      placement="top"
      portal
      radius={2}
      shadow={2}
      content={
        <div ref={popoverReference}>
          <Box padding={3} style={{ maxWidth: 280 }}>
            <Stack gap={3}>
              <Text size={1} weight="semibold">
                {label}
              </Text>
              <Text size={1} muted>
                {children}
              </Text>
            </Stack>
          </Box>
        </div>
      }
      {...props}
    >
      <Button
        ref={buttonReference}
        aria-label={label}
        fontSize={2}
        icon={icon}
        mode="bleed"
        padding={1}
        onClick={open ? onClose : onOpen}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") onOpen();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") onClose();
        }}
      />
    </Popover>
  );
}
