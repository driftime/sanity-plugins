import { isDefined } from "@repo/lib/utils";

/**
 * Creates a URL from an address, resolving a root-relative one against the site it belongs to.
 *
 * @param href - The address to read.
 * @param origin - Origin the site is served from.
 * @returns The URL, or undefined when the address cannot be read as one.
 */
export function createUrl(href: string | undefined, origin: string) {
  if (!isDefined(href)) return undefined;

  try {
    return new URL(href, origin);
  } catch {
    return undefined;
  }
}

/**
 * Reduces an absolute address pointing back at the site to a root-relative one, so an address an
 * author pasted in full still routes on the client rather than reloading the page.
 *
 * @param href - The absolute address to reduce.
 * @param origin - Origin the site is served from.
 * @returns A root-relative address, or undefined when the address points elsewhere.
 */
export function resolveRelativeHref(href: string, origin: string) {
  try {
    const url = new URL(href);
    if (url.origin !== origin) return undefined;

    return url.pathname + url.search + url.hash;
  } catch {
    return undefined;
  }
}

/**
 * Splits a path into the segments that carry it, discarding the empty ones a leading or trailing
 * slash leaves behind.
 *
 * @param path - The path to split.
 * @returns The segments the path is built from.
 */
function splitSegments(path: string) {
  return path.split("/").filter((segment) => isDefined(segment));
}

/**
 * Checks whether a URL covers the page being read, matching every segment it declares against the
 * start of the current path. The root is compared exactly, since it precedes every path and would
 * otherwise cover every page on the site.
 *
 * @param url - The URL to compare.
 * @param pathname - Path of the page being read.
 * @param origin - Origin the site is served from.
 * @returns Whether the URL is the current page or one of the paths above it.
 */
export function checkContainsActivePath(url: URL, pathname: string, origin: string) {
  if (url.origin !== origin) return false;

  const linkSegments = splitSegments(url.pathname);
  const pageSegments = splitSegments(pathname);
  if (!isDefined(linkSegments)) return !isDefined(pageSegments);

  return linkSegments.every((segment, index) => pageSegments.at(index) === segment);
}

/**
 * Checks whether a URL points at the page being read and nothing else. An address carrying an anchor
 * names a location within a page rather than the page itself, so it is never the page already open.
 *
 * @param url - The URL to compare.
 * @param pathname - Path of the page being read.
 * @param origin - Origin the site is served from.
 * @returns Whether the URL matches the current page exactly.
 */
export function checkIsActivePath(url: URL, pathname: string, origin: string) {
  if (url.origin !== origin || isDefined(url.hash)) return false;

  return splitSegments(pathname).join("/") === splitSegments(url.pathname).join("/");
}
