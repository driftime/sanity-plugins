import { isDefined } from "@repo/lib/utils";

import type { SanityLinkDestination } from "@/types";

/**
 * Builds the GROQ that expands a link's destination, so a page link's document and a file link's asset
 * arrive with the link.
 *
 * @param routeParamsFragment - GROQ that adds route parameters to a linked page.
 * @param titleField - The field a linked page's title is read from.
 * @returns GROQ conditional projections for the destinations that need expanding.
 */
export function createLinkFragment(routeParamsFragment: string, titleField: string) {
  const reference = ["_id", "_type", titleField, routeParamsFragment].filter((part) => isDefined(part)).join(", ");

  return [
    `type == "${"page" satisfies SanityLinkDestination}" => { ..., reference-> { ${reference} } }`,
    `type == "${"file" satisfies SanityLinkDestination}" => { ..., file { ..., asset-> } }`,
  ].join(", ");
}
