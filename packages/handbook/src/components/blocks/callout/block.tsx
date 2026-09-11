import { PortableText } from "@portabletext/react";
import type { PortableTextComponents, PortableTextMarkComponentProps } from "@portabletext/react";
import type { ComponentProps } from "react";

import { CalloutContent } from "@/components/blocks/callout/content";
import { PortableCode } from "@/components/content/portable/code";
import { PortableLink } from "@/components/content/portable/link";
import { contentSpacing } from "@/config/layout";
import type { SanityHandbookCallout, SanityHandbookLink } from "@/types";

export type CalloutBlockProps = Omit<ComponentProps<typeof CalloutContent>, "variant" | "children"> & {
  value: SanityHandbookCallout;
};

/** Overrides for a callout body, which takes the card's own text styling and leaves paragraphs unwrapped. */
const components: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    code: ({ children }) => <PortableCode>{children}</PortableCode>,
    link: ({ children, value }: PortableTextMarkComponentProps<SanityHandbookLink>) => (
      <PortableLink href={value?.href}>{children}</PortableLink>
    ),
  },
};

export function CalloutBlock({ value, style, ...props }: CalloutBlockProps) {
  return (
    <CalloutContent variant={value.variant} style={{ marginBlock: contentSpacing.callout, ...style }} {...props}>
      <PortableText value={value.body} components={components} />
    </CalloutContent>
  );
}
