import { isDefined } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { composeAnchorHref } from "@/lib/destinations";
import type { SanityLink } from "@/types";

/**
 * Reads the host a web address points at, so a link to a file buried three folders deep still reads
 * as the site it came from. The subdomain everyone ignores goes with it.
 *
 * @param url - The address to read.
 * @returns The host, or undefined when the address cannot be read as one.
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
 * Describes where a link leads using only what the document already holds, which covers every
 * destination an author typed out in full.
 *
 * @param value - The link being authored.
 * @returns The description, or undefined when the destination is stored as a pointer.
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
 * Names the document a link leads to, for the two destinations stored as a pointer rather than as
 * something an author wrote.
 *
 * @param value - The link being authored.
 * @returns The document's identifier, or undefined when the destination holds none.
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
 * Builds the one line the closed control reads, putting what an author wrote first and where it
 * leads in brackets behind it. Either alone stands on its own.
 *
 * @param label - Text the author wrote.
 * @param detail - Where the link leads.
 * @returns The line, or undefined when neither is known.
 */
export function composeSummary(label: string | undefined, detail: string | undefined) {
  const written = stegaClean(label);
  if (isDefined(written) && isDefined(detail)) return `${written} (${detail})`;

  return written ?? detail;
}
