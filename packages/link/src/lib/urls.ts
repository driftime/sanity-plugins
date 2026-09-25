import { isDefined } from "@repo/lib/utils";

/**
 * Parses an address as a URL, resolving a root-relative address against the site's origin.
 *
 * @param href - The address.
 * @param origin - The site's origin.
 * @returns The URL, or undefined when the address can't be parsed.
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
 * Converts an absolute URL on this site to a root-relative address, so it routes client-side instead of
 * reloading the page.
 *
 * @param href - The absolute URL.
 * @param origin - The site's origin.
 * @returns The root-relative address, or undefined when the URL is on another site.
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
 * Splits a path into its non-empty segments.
 *
 * @param path - The path.
 * @returns The segments.
 */
function splitSegments(path: string) {
  return path.split("/").filter((segment) => isDefined(segment));
}

/**
 * Checks whether a URL is the current page or one of its parent paths. The root only matches itself,
 * since it would otherwise match every page.
 *
 * @param url - The URL.
 * @param pathname - The current path.
 * @param origin - The site's origin.
 * @returns Whether the URL is the current page or one of its parent paths.
 */
export function checkContainsActivePath(url: URL, pathname: string, origin: string) {
  if (url.origin !== origin) return false;

  const linkSegments = splitSegments(url.pathname);
  const pageSegments = splitSegments(pathname);
  if (!isDefined(linkSegments)) return !isDefined(pageSegments);

  return linkSegments.every((segment, index) => pageSegments.at(index) === segment);
}

/**
 * Checks whether a URL is exactly the current page. A URL with an anchor never matches, since it points
 * to a location within a page.
 *
 * @param url - The URL.
 * @param pathname - The current path.
 * @param origin - The site's origin.
 * @returns Whether the URL is the current page.
 */
export function checkIsActivePath(url: URL, pathname: string, origin: string) {
  if (url.origin !== origin || isDefined(url.hash)) return false;

  return splitSegments(pathname).join("/") === splitSegments(url.pathname).join("/");
}
