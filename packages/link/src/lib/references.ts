import { isDefined } from "@repo/lib/utils";

import { logger } from "@/config/defaults";
import type { SanityLinkReference } from "@/types";

/**
 * Checks whether a query expanded a Sanity reference into the document it points to, logging an error in
 * development when it did not.
 *
 * @param reference - The reference to check.
 * @returns True if the reference is expanded.
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
