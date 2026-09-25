import { convertCase, isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import type { SanityLinkSearchParam } from "@/types";

/**
 * Reads a page link's parameters as key–value pairs, skipping rows without a name.
 *
 * @param searchParams - The stored parameters.
 * @returns The named parameters, or undefined when there are none.
 */
function readSearchParams(searchParams: SanityLinkSearchParam[] | undefined) {
  if (!isDefined(searchParams)) return undefined;

  const entries = searchParams.flatMap(({ key, value }) => {
    const name = stegaClean(key);

    return isDefined(name) ? [[name, stegaClean(value) ?? ""] as const] : [];
  });

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/**
 * Builds a `mailto:` address.
 *
 * @param email - The recipient's address.
 * @param subject - The subject line.
 * @returns The address, or undefined when there's no recipient.
 */
export function composeEmailHref(email: string | undefined, subject: string | undefined) {
  const address = stegaClean(email);
  if (!isDefined(address)) return undefined;

  const line = stegaClean(subject);

  return isDefined(line) ? `mailto:${address}?subject=${encodeURIComponent(line)}` : `mailto:${address}`;
}

/**
 * Builds a `tel:` address, removing any spaces.
 *
 * @param phone - The phone number.
 * @returns The address, or undefined when there's no number.
 */
export function composePhoneHref(phone: string | undefined) {
  const number = stegaClean(phone);
  if (!isDefined(number)) return undefined;

  return `tel:${number.replaceAll(/\s+/gu, "")}`;
}

/**
 * Adds an author's anchor and query parameters to a route's address, merging with any parameters it
 * already has.
 *
 * @param href - The route's address.
 * @param anchor - The section to link to.
 * @param searchParams - The query parameters to add.
 * @returns The address with the anchor and parameters, absolute or relative as it was given.
 */
export function appendDestination(
  href: string,
  anchor: string | undefined,
  searchParams: SanityLinkSearchParam[] | undefined,
) {
  const params = readSearchParams(searchParams);
  const hash = stegaClean(anchor);
  if (!isDefined(params) && !isDefined(hash)) return href;

  // Placeholder origin, so a relative address can be parsed and then rebuilt as relative.
  const placeholder = "http://append.invalid";

  try {
    const url = new URL(href, placeholder);

    // An author's parameter overrides the route's parameter of the same name.
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
    if (isDefined(hash)) url.hash = convertCase(hash, "kebab");

    return url.origin === placeholder ? url.pathname + url.search + url.hash : url.href;
  } catch {
    return href;
  }
}

/**
 * Builds an in-page `#` address.
 *
 * @param anchor - The section to link to.
 * @returns The address, or undefined when there's no section.
 */
export function composeAnchorHref(anchor: string | undefined) {
  const hash = stegaClean(anchor);
  if (!isDefined(hash)) return undefined;

  return `#${convertCase(hash, "kebab")}`;
}
