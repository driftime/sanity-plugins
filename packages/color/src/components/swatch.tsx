import type { ComponentProps } from "react";

export type SwatchProps = Omit<ComponentProps<"svg">, "children"> & { color: string | undefined };

export function Swatch({ color, ...props }: SwatchProps) {
  return (
    <svg
      data-sanity-icon="swatch"
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx={12.5}
        cy={12.5}
        r={8}
        fill={color ?? "none"}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
