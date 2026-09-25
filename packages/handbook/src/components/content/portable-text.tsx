import { PortableText as PortableTextReact } from "@portabletext/react";
import type {
  PortableTextComponentProps,
  PortableTextComponents,
  PortableTextMarkComponentProps,
  PortableTextTypeComponent,
  PortableTextTypeComponentProps,
} from "@portabletext/react";
import type { ComponentProps, ComponentType } from "react";
import type { PortableTextBlock, PortableTextListBlock, PortableTextObject } from "sanity";

import { CalloutBlock } from "@/components/blocks/callout/block";
import { CodeBlock } from "@/components/blocks/code/block";
import { HorizontalRuleBlock } from "@/components/blocks/horizontal-rule/block";
import { ImageBlock } from "@/components/blocks/image/block";
import { VideoBlock } from "@/components/blocks/video/block";
import { PortableBlockquote } from "@/components/content/portable/blockquote";
import { PortableCode } from "@/components/content/portable/code";
import { PortableHeading } from "@/components/content/portable/heading";
import { PortableLink } from "@/components/content/portable/link";
import { PortableList } from "@/components/content/portable/list";
import { PortableParagraph } from "@/components/content/portable/paragraph";
import { contentSpacing } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";
import type { SanityHandbookLink, SanityKeyedArray } from "@/types";
import { calloutTypeName, codeTypeName, horizontalRuleTypeName, imageTypeName, videoTypeName } from "@/types";

/**
 * Works out the vertical space around a list, which is smaller for nested lists.
 *
 * @param level - Nesting depth, starting at 1.
 * @returns The space in pixels.
 */
function listSpacing(level: number) {
  return level > 1 ? contentSpacing.nestedList : contentSpacing.list;
}

/**
 * Components for each block style, mark, and embedded type in a guide. Marks and list items not listed
 * here are left to the library's defaults on purpose.
 */
const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <PortableHeading style={{ marginBlockStart: contentSpacing.heading, marginBlockEnd: 4 }}>
        {children}
      </PortableHeading>
    ),
    normal: ({ children }) => (
      <PortableParagraph muted style={{ marginBlock: contentSpacing.paragraph }}>
        {children}
      </PortableParagraph>
    ),
    blockquote: ({ children }) => (
      <PortableBlockquote muted style={{ marginBlock: contentSpacing.blockquote }}>
        {children}
      </PortableBlockquote>
    ),
  },
  list: {
    bullet: ({ children, value }: PortableTextComponentProps<PortableTextListBlock>) => (
      <PortableParagraph muted style={{ marginBlock: listSpacing(value.level) }}>
        <PortableList>{children}</PortableList>
      </PortableParagraph>
    ),
    number: ({ children, value }: PortableTextComponentProps<PortableTextListBlock>) => (
      <PortableParagraph muted style={{ marginBlock: listSpacing(value.level) }}>
        <PortableList ordered>{children}</PortableList>
      </PortableParagraph>
    ),
  },
  marks: {
    code: ({ children }) => <PortableCode>{children}</PortableCode>,
    link: ({ children, value }: PortableTextMarkComponentProps<SanityHandbookLink>) => (
      <PortableLink href={value?.href}>{children}</PortableLink>
    ),
  },
};

/**
 * Wraps a block component for Portable Text, passing only the block's value. Otherwise the library's
 * other props would reach the DOM.
 *
 * @param Component - The block component.
 * @returns A component Portable Text can render the type with.
 */
function blockRenderer<Value extends PortableTextObject>(Component: ComponentType<{ value: Value }>) {
  return function Block({ value }: PortableTextTypeComponentProps<Value>) {
    return <Component value={value} />;
  };
}

export type PortableTextProps = ComponentProps<"div"> & {
  value: SanityKeyedArray<PortableTextBlock>;
};

export function PortableText({ value, ...props }: PortableTextProps) {
  const { blocks } = useHandbookContext();

  const types: Record<string, PortableTextTypeComponent> = {
    [imageTypeName]: blockRenderer(ImageBlock),
    [videoTypeName]: blockRenderer(VideoBlock),
    [codeTypeName]: blockRenderer(CodeBlock),
    [calloutTypeName]: blockRenderer(CalloutBlock),
    [horizontalRuleTypeName]: blockRenderer(HorizontalRuleBlock),
  };
  for (const block of blocks) types[block.schema.name] = blockRenderer(block.component);

  return (
    <div {...props}>
      <PortableTextReact value={value} components={{ ...components, types }} />
    </div>
  );
}
