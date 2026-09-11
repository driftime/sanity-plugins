import { useCurrentUser } from "sanity";

import { isPermittedEditor } from "@/lib/editors";

/**
 * Checks whether the current user is permitted to edit Handbook content, treating an absent list as
 * unrestricted access.
 *
 * @param editors - Email addresses permitted to edit, defaulting to the configured list.
 * @returns Whether the current user can edit Handbook documents.
 * @public
 */
export function useIsHandbookEditor(editors?: string[]) {
  const user = useCurrentUser();

  return isPermittedEditor(editors, user?.email);
}
