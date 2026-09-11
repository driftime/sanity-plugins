import { isDefined } from "@repo/lib/utils";

import type { SanityLinkDestination } from "@/types";

/**
 * Builds the GROQ that expands a link's destinations, so the document behind a page link and the
 * asset behind a file link both arrive with the link itself.
 *
 * @param routeParamsFragment - GROQ resolving route parameters onto the document a page link points at.
 * @param titleField - Field an internal link borrows its label from when none was written.
 * @returns GROQ conditional projections covering every destination that needs expanding.
 */
export function createLinkFragment(routeParamsFragment: string, titleField: string) {
  const reference = ["_id", "_type", titleField, routeParamsFragment].filter((part) => isDefined(part)).join(", ");

  return [
    `type == "${"page" satisfies SanityLinkDestination}" => { ..., reference-> { ${reference} } }`,
    `type == "${"file" satisfies SanityLinkDestination}" => { ..., file { ..., asset-> } }`,
  ].join(", ");
}
