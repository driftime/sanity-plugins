import { useCurrentUser } from "sanity";

import { isPermittedEditor } from "@/lib/editors";

/**
 * Checks whether the current user can edit Handbook documents. Without an editors list, everyone can.
 *
 * @param editors - Email addresses of the editors, defaulting to the configured list.
 * @returns Whether the current user can edit Handbook documents.
 * @public
 */
export function useIsHandbookEditor(editors?: string[]) {
  const user = useCurrentUser();

  return isPermittedEditor(editors, user?.email);
}
