import { isDevelopment } from "./environment";

/** Style the prefix is drawn with in a browser console, matching the blue the Studio uses for its own. */
const prefixStyle = "color: #2276fc";

/**
 * Creates the logger a package reports through, so every message names the plugin it came from and
 * only a development build hears it. In a browser console the name is drawn in blue, the way the
 * Studio's own messages are; a terminal ignores the styling and prints it plain.
 *
 * @param name - Name of the package the messages come from.
 * @returns Functions that warn, report an error, or word a message for throwing.
 */
export function createLogger(name: string) {
  const prefix = `[${name}]`;

  /**
   * Words a message so it names the package it came from.
   *
   * @param message - The message to word.
   * @returns The message with the package name in front.
   */
  function format(message: string) {
    return `${prefix} ${message}`;
  }

  return {
    /**
     * Reports something the plugin recovered from, in development only.
     *
     * @param message - What was recovered from and what to do about it.
     */
    warn(message: string) {
      if (isDevelopment) console.warn(`%c${prefix}%c ${message}`, prefixStyle, "");
    },
    /**
     * Reports something the plugin could not recover from, in development only.
     *
     * @param message - What went wrong and what to do about it.
     */
    error(message: string) {
      if (isDevelopment) console.error(`%c${prefix}%c ${message}`, prefixStyle, "");
    },
    format,
  };
}
