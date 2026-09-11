import { isDefined } from "@repo/lib/utils";
import type { ComponentType, ReactNode } from "react";

import { useHandbookContext } from "@/contexts/handbook";
import { documentTypesSections } from "@/sections/document-types";
import { gettingStartedSections } from "@/sections/getting-started";
import { guidesSections } from "@/sections/guides";

/** A selectable page, pairing its sidebar row with the panel that row opens. */
interface Entry {
  /** Identifier shared by the sidebar row and its panel. */
  id: string;
  /** Label shown in the sidebar and as the panel heading. */
  title: string;
  /** Description shown beneath the panel heading. */
  description?: string;
  /** Icon component shown beside the sidebar label. */
  icon?: ComponentType;
  /** Builds the panel's content, called only while the entry is active. */
  render: () => ReactNode;
}

/** A titled run of entries, drawn as a sidebar heading and the rows beneath it. */
interface Section {
  /** Text shown above the entries it introduces. */
  title: string;
  /** Entries belonging to the section. */
  entries: Entry[];
}

/**
 * Composes every page the Handbook shows, in sidebar order.
 *
 * @returns Sections from the built-in pages, the configured document roles, and the authored guides.
 */
export function useSections(): Section[] {
  const { roles, handbook, loading } = useHandbookContext();

  return [
    ...gettingStartedSections(),
    ...documentTypesSections(roles),
    ...(loading || !isDefined(handbook) ? [] : guidesSections(handbook)),
  ];
}
