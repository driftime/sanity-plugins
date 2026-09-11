import { convertCase, isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import type { SanityLinkSearchParam } from "@/types";

/**
 * Reads an internal link's parameters as the pairs a query string is built from, dropping any row
 * that names no key so a half-written parameter never reaches an address.
 *
 * @param searchParams - The stored parameters.
 * @returns The parameters that name a key, or undefined when none do.
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
 * Builds the address that opens a message to a chosen inbox.
 *
 * @param email - The address the message is sent to.
 * @param subject - The subject the message opens with.
 * @returns The address, or undefined when no inbox was named.
 */
export function composeEmailHref(email: string | undefined, subject: string | undefined) {
  const address = stegaClean(email);
  if (!isDefined(address)) return undefined;

  const line = stegaClean(subject);

  return isDefined(line) ? `mailto:${address}?subject=${encodeURIComponent(line)}` : `mailto:${address}`;
}

/**
 * Builds the address that starts a call to a chosen number. Spacing an author wrote for legibility is
 * dropped, since a dialler reads none of it.
 *
 * @param phone - The number the call is placed to.
 * @returns The address, or undefined when no number was named.
 */
export function composePhoneHref(phone: string | undefined) {
  const number = stegaClean(phone);
  if (!isDefined(number)) return undefined;

  return `tel:${number.replaceAll(/\s+/gu, "")}`;
}

/**
 * Appends the anchor and query string an author added onto the address a route resolved to, merging
 * with any parameters the route already carried.
 *
 * @param href - The address the route resolved to.
 * @param anchor - Section of the destination page to arrive at.
 * @param searchParams - Query string parameters to append.
 * @returns The address carrying the anchor and parameters, in the same absolute or relative form it arrived in.
 */
export function appendDestination(
  href: string,
  anchor: string | undefined,
  searchParams: SanityLinkSearchParam[] | undefined,
) {
  const params = readSearchParams(searchParams);
  const hash = stegaClean(anchor);
  if (!isDefined(params) && !isDefined(hash)) return href;

  // Stands in for the site's own origin, so a relative address can be parsed and rebuilt as one.
  const placeholder = "http://append.invalid";

  try {
    const url = new URL(href, placeholder);

    // An author's own parameter wins over one the route already carried, having been written later.
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
    if (isDefined(hash)) url.hash = convertCase(hash, "kebab");

    return url.origin === placeholder ? url.pathname + url.search + url.hash : url.href;
  } catch {
    return href;
  }
}

/**
 * Builds the address that moves a visitor within the page they are already reading.
 *
 * @param anchor - Section of the page to arrive at.
 * @returns The address, or undefined when no section was named.
 */
export function composeAnchorHref(anchor: string | undefined) {
  const hash = stegaClean(anchor);
  if (!isDefined(hash)) return undefined;

  return `#${convertCase(hash, "kebab")}`;
}
