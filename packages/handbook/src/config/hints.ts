import type { ComponentProps, ComponentType } from "react";

import { InfoIcon } from "@/icons/info";
import { LightbulbIcon } from "@/icons/lightbulb";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import type { SanityHandbookMetadata } from "@/plugin";

/** A kind of field hint: the metadata property it comes from and how it's shown. */
interface HintKind {
  /** Property in the field's handbook metadata that holds the hint. */
  name: keyof Pick<SanityHandbookMetadata, "tip" | "info" | "caution">;
  /** Heading above the hint, and the icon's accessible label. */
  label: string;
  /** Icon for the hint kind. */
  icon: ComponentType<ComponentProps<"svg">>;
}

/** Hint kinds, in display order. */
export const hintKinds: HintKind[] = [
  { name: "tip", label: "Tip", icon: LightbulbIcon },
  { name: "info", label: "Information", icon: InfoIcon },
  { name: "caution", label: "Caution", icon: TriangleAlertIcon },
];
