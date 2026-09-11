import type { ComponentProps } from "react";

export type PortableCodeProps = ComponentProps<"code">;

export function PortableCode({ style, ...props }: PortableCodeProps) {
  return (
    <code
      style={{
        paddingBlock: 2,
        paddingInline: 4,
        fontSize: "0.875em",
        backgroundColor: "var(--card-code-bg-color)",
        borderRadius: 2,
        ...style,
      }}
      {...props}
    />
  );
}
