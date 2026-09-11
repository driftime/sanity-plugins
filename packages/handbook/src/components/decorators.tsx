import type { BlockDecoratorProps } from "sanity";

import { PortableCode } from "@/components/content/portable/code";

export function CodeDecorator({ children }: BlockDecoratorProps) {
  return <PortableCode>{children}</PortableCode>;
}
