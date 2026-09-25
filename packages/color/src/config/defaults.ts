import { createLogger } from "@repo/lib/logger";

import type { SanityColorStandard } from "@/lib/contrast";
import type { SanityColorPicker, SanityColorSource } from "@/plugin";

/** Package name, used as the prefix on every logged message. */
export const pluginName = "@driftime/sanity-plugin-color";

/** The package's logger. */
export const logger = createLogger(pluginName);

/** API version for the plugin's queries. */
export const apiVersion = "2026-01-01";

/** Colors authors can set when no pickers are configured. */
export const defaultPickers: SanityColorPicker[] = ["background", "text"];

/** Color sources when none are configured. Image swatches are left out because they need an image field. */
export const defaultSources: SanityColorSource[] = ["palette", "custom"];

/** Starting background for a custom color. */
export const defaultCustomBackground = "#ffffff";

/** Starting text color for a custom color. */
export const defaultCustomText = "#000000";

/** Conformance level used when none is configured. */
export const defaultStandard: SanityColorStandard = "AA";
