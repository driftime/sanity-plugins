import { createLogger } from "@repo/lib/logger";

/** Package name, used as the prefix on every logged message. */
export const pluginName = "@driftime/sanity-plugin-link";

/** The package's logger. */
export const logger = createLogger(pluginName);

/** Field a linked page's title is read from, for labels and previews, when none is configured. */
export const defaultTitleField = "title";
