/** Whether the plugin is running in a development build, which decides whether it reports what it recovered from. */
export const isDevelopment = process.env["NODE_ENV"] === "development";
