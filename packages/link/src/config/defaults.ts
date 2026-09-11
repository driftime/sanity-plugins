import { createLogger } from "@repo/lib/logger";

/** Name the package is published under, which every message it reports carries. */
export const pluginName = "@driftime/sanity-plugin-link";

/** Logger every message the package reports goes through. */
export const logger = createLogger(pluginName);

/** Field an internal link borrows its label from, and a preview its title from, when none is configured. */
export const defaultTitleField = "title";
