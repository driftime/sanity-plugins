import type { CSSProperties, ComponentProps } from "react";

// `ref` is omitted because the rendered element varies, so no single ref type fits.
export type PortableListProps = Omit<ComponentProps<"ul">, "ref"> & {
  ordered?: boolean;
};

export function PortableList({ ordered = false, style, ...props }: PortableListProps) {
  const listStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    margin: 0,
    paddingLeft: "1.25em",
    ...style,
  };

  if (ordered) return <ol style={listStyle} {...props} />;

  return <ul style={listStyle} {...props} />;
}
