import { isDefined } from "@repo/lib/utils";

/** Editors the plugin was configured with, so the Structure helper need not be handed them a second time. */
let configuredEditors: string[] | undefined = undefined;

/**
 * Records the editors a plugin instance was configured with. A Studio running more than one workspace
 * keeps only the list from the workspace configured last, so those cases pass the list explicitly.
 *
 * @param editors - Email addresses permitted to edit Handbook documents.
 */
export function setConfiguredEditors(editors: string[] | undefined) {
  configuredEditors = editors;
}

/**
 * Checks whether an email address is permitted to edit, treating an absent list as unrestricted access.
 *
 * @param editors - Email addresses permitted to edit, defaulting to the configured list.
 * @param email - The email address to check.
 * @returns Whether the email is permitted to edit.
 */
export function isPermittedEditor(editors: string[] | undefined, email: string | undefined) {
  const permitted = editors ?? configuredEditors;

  if (!isDefined(permitted)) return true;
  if (!isDefined(email)) return false;

  return permitted.includes(email);
}
