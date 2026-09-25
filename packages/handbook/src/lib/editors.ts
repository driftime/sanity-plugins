import { isDefined } from "@repo/lib/utils";

/** Editors from the plugin configuration, so the structure helper doesn't need them passed again. */
let configuredEditors: string[] | undefined = undefined;

/**
 * Stores the editors from the plugin configuration. A Studio with several workspaces keeps only the last
 * workspace's list, so pass the list explicitly there.
 *
 * @param editors - Email addresses of the editors.
 */
export function setConfiguredEditors(editors: string[] | undefined) {
  configuredEditors = editors;
}

/**
 * Checks whether an email address belongs to an editor. Without an editors list, everyone is an editor.
 *
 * @param editors - Email addresses of the editors, defaulting to the configured list.
 * @param email - The email address to check.
 * @returns Whether the address belongs to an editor.
 */
export function isPermittedEditor(editors: string[] | undefined, email: string | undefined) {
  const permitted = editors ?? configuredEditors;

  if (!isDefined(permitted)) return true;
  if (!isDefined(email)) return false;

  return permitted.includes(email);
}
