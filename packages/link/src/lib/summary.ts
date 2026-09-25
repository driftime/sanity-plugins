import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { composeAnchorHref } from "@/lib/destinations";
import type { SanityLink } from "@/types";

/**
 * Reads a URL's host name, without a leading `www.`.
 *
 * @param url - The URL.
 * @returns The host name, or undefined when the URL can't be parsed.
 */
function getDomain(url: string | undefined) {
  const address = stegaClean(url);
  if (!isDefined(address)) return undefined;

  try {
    return new URL(address).hostname.replace(/^www\./u, "");
  } catch {
    return undefined;
  }
}

/**
 * Describes where a link leads using only values stored on the link itself.
 *
 * @param value - The link being edited.
 * @returns The description, or undefined when the destination is a reference.
 */
export function getLocalDetail(value: Partial<SanityLink> | undefined) {
  if (!isDefined(value)) return undefined;

  if (value.type === "anchor") return composeAnchorHref(value.anchor);
  if (value.type === "url") return getDomain(value.url);
  if (value.type === "email") return stegaClean(value.email);
  if (value.type === "phone") return stegaClean(value.phone);

  return undefined;
}

/**
 * Reads the ID of the document or asset a page or file link points to.
 *
 * @param value - The link being edited.
 * @returns The ID, or undefined when there isn't one.
 */
export function getReferencedId(value: Partial<SanityLink> | undefined) {
  if (!isDefined(value)) return undefined;

  if (value.type === "page") {
    const { reference } = value;

    return isDefined(reference) && "_ref" in reference ? reference._ref : undefined;
  }

  if (value.type === "file") {
    const asset = value.file?.asset;

    return isDefined(asset) && "_ref" in asset ? asset._ref : undefined;
  }

  return undefined;
}

/**
 * Builds the one-line summary on the link button: the label, then the destination in brackets. Either
 * one works alone.
 *
 * @param label - The link text.
 * @param detail - The destination description.
 * @returns The summary, or undefined when neither is known.
 */
export function composeSummary(label: string | undefined, detail: string | undefined) {
  const written = stegaClean(label);
  if (isDefined(written) && isDefined(detail)) return `${written} (${detail})`;

  return written ?? detail;
}
