import { createLogger } from "@repo/lib/logger";

/** Package name, used as the prefix on every logged message. */
export const pluginName = "@driftime/sanity-plugin-icon";

/** The package's logger. */
export const logger = createLogger(pluginName);
