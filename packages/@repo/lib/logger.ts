import { isDevelopment } from "./environment";

/** Console style for the prefix, in the blue the Studio uses for its own messages. */
const prefixStyle = "color: #2276fc";

/**
 * Creates a logger that prefixes messages with the plugin's name and only logs in development builds.
 * Browser consoles show the prefix in blue.
 *
 * @param name - The package name to prefix messages with.
 * @returns Functions that log progress, a warning, or an error, or format a message to throw.
 */
export function createLogger(name: string) {
  const prefix = `[${name}]`;

  /**
   * Prefixes a message with the package name.
   *
   * @param message - The message.
   * @returns The prefixed message.
   */
  function format(message: string) {
    return `${prefix} ${message}`;
  }

  return {
    /**
     * Logs progress worth seeing, such as what a build step did, in development builds only.
     *
     * @param message - What happened.
     */
    info(message: string) {
      if (isDevelopment) console.info(`%c${prefix}%c ${message}`, prefixStyle, "");
    },
    /**
     * Logs a warning about something the plugin recovered from, in development builds only.
     *
     * @param message - What happened and what to do about it.
     */
    warn(message: string) {
      if (isDevelopment) console.warn(`%c${prefix}%c ${message}`, prefixStyle, "");
    },
    /**
     * Logs an error the plugin couldn't recover from, in development builds only.
     *
     * @param message - What went wrong and what to do about it.
     */
    error(message: string) {
      if (isDevelopment) console.error(`%c${prefix}%c ${message}`, prefixStyle, "");
    },
    format,
  };
}
