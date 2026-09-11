import { isDefined } from "@repo/lib/utils";

import { logger } from "@/config/defaults";
import type { SanityLinkReference } from "@/types";

/**
 * Checks whether a query expanded a reference into the document it points at. Resolution reports an
 * unexpanded one rather than working around it, because the fix belongs in the query.
 *
 * @param reference - The reference to check.
 * @returns True if the reference holds the document itself.
 */
export function isExpandedReference<T extends object>(reference: SanityLinkReference<T> | undefined): reference is T {
  if (!isDefined(reference)) return false;

  if ("_ref" in reference) {
    logger.error(
      `Reference "${reference._ref}" has not been expanded. See: https://www.sanity.io/docs/content-lake/how-queries-work#k8ca3cefc3a31`,
    );

    return false;
  }

  return true;
}
