import { isDefined } from "@repo/lib/utils";

import { defaultDestinations, linkTypes } from "@/config/destinations";
import { getLinkType } from "@/lib/link-types";
import type { SanityLinkConfig, SanityLinkOptions } from "@/plugin";
import type { SanityLinkDestination } from "@/types";

/** A kind of destination, as offered in the Studio. */
export type LinkType = (typeof linkTypes)[number];

/**
 * Resolves the destinations a field offers. A field's own list replaces the plugin's.
 *
 * @param options - The field's options.
 * @param config - The plugin configuration.
 * @returns The field's settings.
 */
export function resolveLinkOptions(options: SanityLinkOptions | undefined, config: SanityLinkConfig) {
  return {
    destinations: options?.destinations ?? config.destinations ?? defaultDestinations,
  };
}

/**
 * Narrows the destinations to those offered, in the order given. Unknown names are skipped, and if none
 * remain, every destination is offered so the field always has one.
 *
 * @param destinations - The destinations to offer.
 * @returns The offered destinations, always at least one.
 */
export function getOfferedLinkTypes(destinations: SanityLinkDestination[]): [LinkType, ...LinkType[]] {
  const [offered, ...rest] = [...new Set(destinations)].flatMap((name) => {
    const linkType = getLinkType(name);

    return isDefined(linkType) ? [linkType] : [];
  });

  const [everything, ...others] = linkTypes;

  return isDefined(offered) ? [offered, ...rest] : [everything, ...others];
}
