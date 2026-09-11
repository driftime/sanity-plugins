import { createLogger } from "@repo/lib/logger";

/** Name the package is published under, which every message it reports carries. */
export const pluginName = "@driftime/sanity-plugin-handbook";

/** Logger every message the package reports goes through. */
export const logger = createLogger(pluginName);

/** Dataset API version every query the plugin runs is pinned to. */
export const apiVersion = "2026-01-01";

/** Title shown in the Studio tool navigation and at the top of the sidebar. */
export const defaultTitle = "Handbook";

/** Fallback title displayed wherever a document has no title of its own. */
export const defaultDocumentTitle = "Untitled";

/** Fallback message shown when a field has no description. */
export const defaultUndocumentedFieldMessage =
  "This field has not been documented yet. Contact your development team for guidance.";
