import { isDefined } from "@repo/lib/utils";

import { defaultDestinations, linkTypes } from "@/config/destinations";
import { getLinkType } from "@/lib/link-types";
import type { SanityLinkConfig, SanityLinkOptions } from "@/plugin";
import type { SanityLinkDestination } from "@/types";

/** One destination as the Studio offers it, for passing an already-narrowed set around. */
export type LinkType = (typeof linkTypes)[number];

/**
 * Settles what a link field offers. The list says what is on and replaces whatever the plugin was
 * given, so one line tells you the whole answer.
 *
 * @param options - Options the field itself was given.
 * @param config - Configuration the plugin was given.
 * @returns The settings the field runs on.
 */
export function resolveLinkOptions(options: SanityLinkOptions | undefined, config: SanityLinkConfig) {
  return {
    destinations: options?.destinations ?? config.destinations ?? defaultDestinations,
  };
}

/**
 * Narrows the destinations to those on offer, in the order they were named. A name this version does
 * not recognise is skipped, and a set that leaves nothing offers them all rather than a field with
 * nowhere to point.
 *
 * @param destinations - Destinations to offer.
 * @returns The destinations on offer, of which there is always at least one.
 */
export function getOfferedLinkTypes(destinations: SanityLinkDestination[]): [LinkType, ...LinkType[]] {
  const [offered, ...rest] = [...new Set(destinations)].flatMap((name) => {
    const linkType = getLinkType(name);

    return isDefined(linkType) ? [linkType] : [];
  });

  const [everything, ...others] = linkTypes;

  return isDefined(offered) ? [offered, ...rest] : [everything, ...others];
}
