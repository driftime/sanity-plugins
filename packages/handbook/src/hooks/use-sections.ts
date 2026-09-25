import { isDefined } from "@repo/lib/utils";
import type { ComponentType, ReactNode } from "react";

import { useHandbookContext } from "@/contexts/handbook";
import { documentTypesSections } from "@/sections/document-types";
import { gettingStartedSections } from "@/sections/getting-started";
import { guidesSections } from "@/sections/guides";

/** A page in the sidebar and the panel it opens. */
interface Entry {
  /** ID shared by the sidebar row and its panel. */
  id: string;
  /** Label in the sidebar and heading of the panel. */
  title: string;
  /** Description below the panel heading. */
  description?: string;
  /** Icon next to the sidebar label. */
  icon?: ComponentType;
  /** Renders the panel's content, only while the entry is selected. */
  render: () => ReactNode;
}

/** A sidebar heading and the entries below it. */
interface Section {
  /** Heading text. */
  title: string;
  /** Entries in the section. */
  entries: Entry[];
}

/**
 * Lists every page in the Handbook, in sidebar order.
 *
 * @returns The built-in pages, the configured document roles, and the guide groups, as sections.
 */
export function useSections(): Section[] {
  const { roles, handbook, loading } = useHandbookContext();

  return [
    ...gettingStartedSections(),
    ...documentTypesSections(roles),
    ...(loading || !isDefined(handbook) ? [] : guidesSections(handbook)),
  ];
}
