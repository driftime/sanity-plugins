import { defaultIconProps } from "@repo/lib/icons";
import { Box, Card, Flex, Text } from "@sanity/ui";
import type { CardProps, CardTone } from "@sanity/ui";
import type { ComponentProps, ComponentType, ReactNode } from "react";

import { InfoIcon } from "@/icons/info";
import { LightbulbIcon } from "@/icons/lightbulb";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import type { SanityHandbookCalloutVariant } from "@/types";

/** Icon and card tone for a callout variant. */
interface CalloutVariantStyle {
  /** Icon for the variant. */
  icon: ComponentType<ComponentProps<"svg">>;
  /** Card tone for the variant. */
  tone: CardTone;
}

export type CalloutContentProps = Omit<CardProps, "tone"> & {
  variant: SanityHandbookCalloutVariant;
  children: ReactNode;
};

/** Icon and tone for each callout variant. */
const presentation: Record<SanityHandbookCalloutVariant, CalloutVariantStyle> = {
  tip: { icon: LightbulbIcon, tone: "positive" },
  info: { icon: InfoIcon, tone: "primary" },
  warning: { icon: TriangleAlertIcon, tone: "caution" },
};

export function CalloutContent({ variant, children, ...props }: CalloutContentProps) {
  const { icon: Icon, tone } = presentation[variant];

  return (
    <Card padding={4} radius={2} tone={tone} {...props}>
      <Flex align="flex-start" gap={3}>
        <Box flex="none" style={{ marginTop: "-2px", fontSize: "16px", color: "var(--card-icon-color)" }}>
          <Icon {...defaultIconProps} />
        </Box>
        <Text size={1} style={{ color: "var(--card-icon-color)" }}>
          {children}
        </Text>
      </Flex>
    </Card>
  );
}
