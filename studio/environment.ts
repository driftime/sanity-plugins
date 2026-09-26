import { isDefined } from "@repo/lib/utils";

/**
 * Reads a required environment variable.
 *
 * @param value - The variable's value.
 * @param error - The message to throw when it is empty or unset.
 * @returns The value.
 * @throws When the value is empty or unset.
 */
function ensure(value: string | undefined, error: string) {
  if (!isDefined(value)) throw new Error(error);

  return value;
}

/** Sanity project ID. */
export const projectId = ensure(
  process.env["SANITY_STUDIO_PROJECT_ID"],
  "The `SANITY_STUDIO_PROJECT_ID` environment variable is required.",
);

/** Sanity dataset name. */
export const dataset = ensure(
  process.env["SANITY_STUDIO_DATASET"],
  "The `SANITY_STUDIO_DATASET` environment variable is required.",
);
