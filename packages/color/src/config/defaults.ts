import { createLogger } from "@repo/lib/logger";

import type { SanityColorStandard } from "@/lib/contrast";
import type { SanityColorPicker, SanityColorSource } from "@/plugin";

/** Name the package is published under, which every message it reports carries. */
export const pluginName = "@driftime/sanity-plugin-color";

/** Logger every message the package reports goes through. */
export const logger = createLogger(pluginName);

/** Dataset API version every query the plugin runs is pinned to. */
export const apiVersion = "2026-01-01";

/** Colors an author may set where nothing narrows them. */
export const defaultPickers: SanityColorPicker[] = ["background", "text"];

/**
 * Where colors may come from where nothing narrows them. Image swatches are absent because they
 * need a field to read before they can offer anything.
 */
export const defaultSources: SanityColorSource[] = ["palette", "custom"];

/** Background a custom selection starts from. */
export const defaultCustomBackground = "#ffffff";

/** Text color a custom selection starts from. */
export const defaultCustomText = "#000000";

/** Conformance level a pairing is judged against where nothing names one. */
export const defaultStandard: SanityColorStandard = "AA";
