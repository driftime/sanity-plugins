import type { BlockStyleProps } from "sanity";

import { PortableBlockquote } from "@/components/content/portable/blockquote";
import { PortableHeading } from "@/components/content/portable/heading";
import { PortableParagraph } from "@/components/content/portable/paragraph";

export function ParagraphStyle({ children }: BlockStyleProps) {
  return <PortableParagraph>{children}</PortableParagraph>;
}

export function HeadingStyle({ children }: BlockStyleProps) {
  return <PortableHeading>{children}</PortableHeading>;
}

export function BlockquoteStyle({ children }: BlockStyleProps) {
  return <PortableBlockquote>{children}</PortableBlockquote>;
}
