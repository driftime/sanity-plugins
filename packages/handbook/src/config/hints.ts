import type { ComponentProps, ComponentType } from "react";

import { InfoIcon } from "@/icons/info";
import { LightbulbIcon } from "@/icons/lightbulb";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import type { SanityHandbookMetadata } from "@/plugin";

/** A kind of hint a field can carry, pairing its metadata property with how it is presented. */
interface HintKind {
  /** Property on the field's handbook metadata holding the hint text. */
  name: keyof Pick<SanityHandbookMetadata, "tip" | "info" | "caution">;
  /** Heading shown above the hint text, and the icon's accessible label. */
  label: string;
  /** Icon identifying the kind wherever the hint appears. */
  icon: ComponentType<ComponentProps<"svg">>;
}

/** Hint kinds a field can carry, in the order they are displayed. */
export const hintKinds: HintKind[] = [
  { name: "tip", label: "Tip", icon: LightbulbIcon },
  { name: "info", label: "Information", icon: InfoIcon },
  { name: "caution", label: "Caution", icon: TriangleAlertIcon },
];
