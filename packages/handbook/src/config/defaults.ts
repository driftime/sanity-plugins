import { createLogger } from "@repo/lib/logger";

/** Package name, used as the prefix on every logged message. */
export const pluginName = "@driftime/sanity-plugin-handbook";

/** The package's logger. */
export const logger = createLogger(pluginName);

/** API version for the plugin's queries. */
export const apiVersion = "2026-01-01";

/** Default title in the Studio's tool menu and at the top of the sidebar. */
export const defaultTitle = "Handbook";

/** Title shown for documents without one. */
export const defaultDocumentTitle = "Untitled";

/** Message shown for fields without a description. */
export const defaultUndocumentedFieldMessage =
  "This field isn't documented yet. Ask your development team for guidance.";
