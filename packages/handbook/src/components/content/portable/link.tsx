import type { ComponentProps } from "react";

export type PortableLinkProps = ComponentProps<"a">;

export function PortableLink({ children, style, ...props }: PortableLinkProps) {
  return (
    <a target="_blank" rel="noopener noreferrer" style={{ color: "var(--card-link-fg-color)", ...style }} {...props}>
      {children}
    </a>
  );
}
