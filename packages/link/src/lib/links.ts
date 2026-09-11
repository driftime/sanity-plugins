import { isDevelopment } from "@repo/lib/environment";
import { isDefined, readPath } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { defaultTitleField, logger } from "@/config/defaults";
import { createLinkFragment } from "@/groq/fragments";
import { appendDestination, composeAnchorHref, composeEmailHref, composePhoneHref } from "@/lib/destinations";
import { isExpandedReference } from "@/lib/references";
import { createRouteResolver } from "@/lib/routes";
import type { SanityCheckedLinkRoutes, SanityLinkRouteInput, SanityLinkRoutes } from "@/lib/routes";
import { checkContainsActivePath, checkIsActivePath, createUrl, resolveRelativeHref } from "@/lib/urls";
import type { SanityLink, SanityLinkDestination, SanityLinkDocument } from "@/types";
import { linkDestinations } from "@/types";

/**
 * A hook run after a link has been resolved, one per kind of destination, receiving the address the
 * plugin built and the stored link it was built from. Returning nothing leaves the link pointing
 * nowhere, as an unresolvable route does.
 *
 * @public
 */
export type SanityLinkResolvers<TDocument extends SanityLinkDocument = SanityLinkDocument> = {
  [K in SanityLinkDestination]?: (
    href: string,
    link: Extract<SanityLink<TDocument>, { type: K }>,
  ) => string | undefined | Promise<string | undefined>;
};

/**
 * Resolvers checked against the destinations a link may point at, so a key naming anything else is
 * rejected rather than quietly never run.
 *
 */
export type SanityCheckedLinkResolvers<TResolvers, TDocument extends SanityLinkDocument = SanityLinkDocument> = {
  [K in keyof TResolvers]: K extends SanityLinkDestination
    ? (
        href: string,
        link: Extract<SanityLink<TDocument>, { type: K }>,
      ) => string | undefined | Promise<string | undefined>
    : never;
};

/**
 * Everything the resolver needs to know about a site before it can resolve a link against it. A site
 * whose documents carry more than the plugin reads narrows the document type as well.
 *
 * @public
 */
export interface SanityLinkResolverConfig<
  TRoutes extends SanityLinkRoutes = SanityLinkRoutes,
  TDocument extends SanityLinkDocument = SanityLinkDocument,
  TResolvers extends SanityLinkResolvers<TDocument> = SanityLinkResolvers<TDocument>,
> {
  /** Absolute address the site is served from, which decides what counts as leaving it. */
  baseUrl: string;
  /** Path patterns keyed by the document type each one renders. Page links lead nowhere when omitted. */
  routes?: TRoutes & SanityCheckedLinkRoutes<TRoutes>;
  /** Hooks having the last word on an address, one per kind of destination. */
  resolvers?: TResolvers & SanityCheckedLinkResolvers<TResolvers, TDocument>;
  /** Whether links leaving the site open in a new browser tab. Enabled when omitted. */
  openExternalInNewTab?: boolean;
  /** Where a page's title comes from, for the label an internal link borrows when none was written. */
  title?: SanityLinkTitleConfig<TDocument>;
}

/**
 * Where a page's title is read from, both by the fragment that fetches it and by the resolver that
 * labels a link with it.
 *
 * @public
 */
export interface SanityLinkTitleConfig<TDocument extends SanityLinkDocument = SanityLinkDocument> {
  /** Field the link fragment fetches from a page. Reads `title` when omitted. */
  field?: string;
  /** Reads the title from a fetched page. Reads `field` when omitted. */
  resolver?: (document: TDocument) => string | undefined;
}

/**
 * A link resolved into the parts an anchor is drawn from.
 *
 * @public
 */
export interface SanityResolvedLink {
  /** Address the link points at. */
  href?: string;
  /** Text a visitor reads, written by the author or borrowed from the destination. */
  label?: string;
  /** Whether the link serves a file rather than opening a page. */
  download?: boolean;
}

/**
 * A resolved link alongside the navigation state around it, all of which a site needs to draw the
 * link correctly rather than merely point it somewhere.
 *
 * @public
 */
export interface SanityLinkState {
  /** The link resolved into the parts an anchor is drawn from, absent when it leads nowhere usable. */
  resolvedLink: SanityResolvedLink | undefined;
  /** Whether the destination is a web address on another site. */
  isExternal: boolean;
  /** Whether the link should open in a new browser tab. */
  opensNewTab: boolean;
  /** Whether the destination names a location within a page rather than the page itself. */
  hasAnchor: boolean;
  /** Whether the destination is the page being read or one of the paths above it. */
  containsActivePath: boolean;
  /** Whether the destination is the page being read and nothing else. */
  isActivePath: boolean;
}

/**
 * What a resolution hands back, which is a promise when a declared resolver can only answer with one
 * and the navigation state itself otherwise. A resolver that might answer either way reads as the
 * synchronous form, since its declaration decides nothing.
 *
 * @public
 */
export type SanityLinkResolution<TResolvers> = [
  {
    [K in keyof TResolvers]-?: NonNullable<TResolvers[K]> extends (...args: never[]) => infer TAnswer
      ? [Exclude<TAnswer, PromiseLike<unknown>>] extends [never]
        ? true
        : never
      : never;
  }[keyof TResolvers],
] extends [never]
  ? SanityLinkState
  : Promise<SanityLinkState>;

/**
 * A link to resolve, taken from the first source declared, and the page it is being drawn on.
 *
 * @public
 */
export interface SanityResolveLinkProps<
  TRoutes extends SanityLinkRoutes = SanityLinkRoutes,
  TDocument extends SanityLinkDocument = SanityLinkDocument,
> {
  /** Stored link an author authored. */
  link?: SanityLink<TDocument> | null | undefined;
  /** Route named in code, for a destination no author authored. */
  route?: SanityLinkRouteInput<TRoutes> | null | undefined;
  /** Address to point at as it is. */
  href?: string | null | undefined;
  /** Path of the page being drawn, compared against the link to read its navigation state. Reading a navigation state without it throws in development. */
  pathname?: string;
}

/** A resolver read back from the table, where the key no longer says which link it receives. */
type UncorrelatedResolver = (href: string, link: never) => unknown;

/**
 * Answers a navigation state from the current path, or refuses when no path was given, since a state
 * read without one would silently render every link inactive. Production answers false instead of
 * throwing, so a missing path never takes a page down.
 *
 * @param pathname - Path of the page being drawn, or undefined when none was given.
 * @param state - Name of the state being read, for the message.
 * @param check - Reads the state from the path.
 * @returns Whether the state holds.
 * @throws In development, when the state is read without a pathname.
 */
function readActiveState(pathname: string | undefined, state: string, check: (pathname: string) => boolean) {
  if (isDefined(pathname)) return check(pathname);
  if (isDevelopment) {
    throw new Error(logger.format(`Reading \`${state}\` needs \`pathname\` to be passed to \`resolveLink\`.`));
  }

  return false;
}

/**
 * Builds the title reader used when a site gives a field but no resolver, so naming the field once
 * covers both the fragment and the label.
 *
 * @param field - Dotted path to the field a page's title lives in.
 * @returns A reader returning the title, or undefined when the document holds no readable one.
 */
function createTitleResolver(field: string) {
  return (document: SanityLinkDocument) => {
    const title = readPath(document, field.split("."));

    return typeof title === "string" ? title : undefined;
  };
}

/**
 * Reads the route table a configuration declared, standing an empty one in where it declared none so
 * that a table is read back either way.
 *
 * @param routes - The route definitions a configuration declared.
 * @returns The table as it was declared, or an empty table.
 */
function readRouteTable<TRoutes extends SanityLinkRoutes>(routes: TRoutes | undefined): TRoutes;
function readRouteTable(routes: SanityLinkRoutes | undefined) {
  return routes ?? {};
}

/**
 * Checks whether a resolver was declared to answer with a promise, which is known of it before it has
 * ever run.
 *
 * @param resolver - The resolver to check.
 * @returns True if the resolver was declared asynchronous.
 */
function isAsyncResolver(resolver: UncorrelatedResolver | undefined) {
  return isDefined(resolver) && resolver.constructor.name === "AsyncFunction";
}

/**
 * Reads which destination a stored link points at, clearing the stega characters a Sanity fetch leaves
 * on the value, so a link fetched in Presentation mode resolves the way it does anywhere else.
 *
 * @param link - The stored link to read.
 * @returns The destination, or undefined when the link stores none or one the plugin does not know.
 */
function readDestination(link: SanityLink) {
  const stored = stegaClean(link.type);
  if (!isDefined(stored)) return undefined;

  const destination = linkDestinations.find((candidate) => candidate === stored);
  if (!isDefined(destination)) {
    logger.error(
      `A link stores "${stored}" as its destination, which is not one the plugin resolves, so it leads nowhere.`,
    );
  }

  return destination;
}

/**
 * Checks whether a stored link points at a given destination, narrowing it to that destination's
 * fields. The comparison clears stega characters first, so it holds in Presentation mode too.
 *
 * @param link - The stored link to check.
 * @param destination - The destination to check for.
 * @returns True if the link points at that destination.
 */
function pointsAt<TDocument extends SanityLinkDocument, TDestination extends SanityLinkDestination>(
  link: SanityLink<TDocument>,
  destination: TDestination,
): link is Extract<SanityLink<TDocument>, { type: TDestination }> {
  return stegaClean(link.type) === destination;
}

/**
 * Adds the anchor and parameters an author wrote onto a page's address, once whatever decides that
 * address has had its say.
 *
 * @param link - The stored link the address was built from.
 * @param resolvedLink - The resolved link to finish.
 * @returns The resolved link carrying the author's additions, or undefined when it leads nowhere.
 */
function appendAuthoredDestination(link: SanityLink, resolvedLink: SanityResolvedLink | undefined) {
  if (!pointsAt(link, "page") || !isDefined(resolvedLink?.href)) return resolvedLink;

  const { anchor, searchParams } = link;

  return { ...resolvedLink, href: appendDestination(resolvedLink.href, anchor, searchParams) };
}

/**
 * Builds the state a link takes when it leads nowhere, so every unusable destination reads the same
 * way to the site drawing it.
 *
 * @returns Navigation state describing a link that points at nothing.
 */
function createEmptyLinkState(): SanityLinkState {
  return {
    resolvedLink: undefined,
    isExternal: false,
    opensNewTab: false,
    hasAnchor: false,
    containsActivePath: false,
    isActivePath: false,
  };
}

/**
 * Binds a site's routing and conventions to the resolver, so a link is resolved the same way
 * everywhere it is drawn.
 *
 * @param linkConfig - What the resolver needs to know about the site.
 * @returns An object holding the resolver, the route table, and the GROQ the two of them rely on.
 * @public
 * @throws If the base address is not an absolute one.
 */
export function defineLinkConfig<
  const TRoutes extends SanityLinkRoutes = SanityLinkRoutes,
  TDocument extends SanityLinkDocument = SanityLinkDocument,
  TResolvers extends SanityLinkResolvers<TDocument> = SanityLinkResolvers<TDocument>,
>(linkConfig: SanityLinkResolverConfig<TRoutes, TDocument, TResolvers>) {
  const {
    baseUrl,
    resolvers,
    openExternalInNewTab = true,
    title: { field: titleField = defaultTitleField, resolver: resolveTitle = createTitleResolver(titleField) } = {},
  } = linkConfig;

  const routes = readRouteTable(linkConfig.routes);

  // Reading a resolver by the type a link stores loses which link it was declared against, so calls go through `runResolver`.
  const declaredResolvers: Partial<Record<SanityLinkDestination, UncorrelatedResolver>> = {
    page: resolvers?.page,
    anchor: resolvers?.anchor,
    url: resolvers?.url,
    email: resolvers?.email,
    phone: resolvers?.phone,
    file: resolvers?.file,
  };

  // A resolver declared async is known to be one before it runs; one merely answering with a promise is known once it has.
  let isAsynchronous = Object.values(declaredResolvers).some((resolver) => isAsyncResolver(resolver));

  // Thrown rather than reported, because a base URL that cannot be read leaves every link on the site undecidable.
  const { origin } = (() => {
    try {
      return new URL(baseUrl);
    } catch {
      throw new TypeError(
        logger.format(`A link configuration needs an absolute base URL, and "${baseUrl}" is not one.`),
      );
    }
  })();

  const { resolveRoute, routeParamsFragment } = createRouteResolver(routes);
  const linkFragment = createLinkFragment(routeParamsFragment, titleField);

  /**
   * Resolves a stored link into the parts an anchor is drawn from, according to the kind of
   * destination it points at. A page's anchor and parameters are left off, since a resolver reads the
   * path before an author's additions rather than after them.
   *
   * @param link - The stored link to resolve.
   * @returns The resolved link, or undefined when it leads nowhere usable.
   */
  function composeLink(link: SanityLink<TDocument>): SanityResolvedLink | undefined {
    if (pointsAt(link, "page")) {
      const { reference, label } = link;
      if (!isExpandedReference(reference)) return undefined;

      const path = resolveRoute(reference);
      if (!isDefined(path)) return undefined;

      return { href: path, label: label ?? resolveTitle(reference) };
    }

    if (pointsAt(link, "anchor")) {
      const { anchor, label } = link;

      return { href: composeAnchorHref(anchor), label };
    }

    if (pointsAt(link, "url")) {
      const { url, label } = link;
      const address = stegaClean(url);
      const relativeHref = isDefined(address) ? resolveRelativeHref(address, origin) : undefined;

      // An address pointing back at this site is external in the authoring only, so it routes as internal.
      return { href: relativeHref ?? address, label };
    }

    if (pointsAt(link, "email")) {
      const { email, subject, label } = link;

      return { href: composeEmailHref(email, subject), label };
    }

    if (pointsAt(link, "phone")) {
      const { phone, label } = link;

      return { href: composePhoneHref(phone), label };
    }

    if (pointsAt(link, "file")) {
      const { file, label } = link;
      if (!isExpandedReference(file?.asset)) return undefined;

      const address = stegaClean(file.asset.url);
      const filename = stegaClean(file.asset.originalFilename);
      const href =
        isDefined(address) && isDefined(filename) ? `${address}?dl=${encodeURIComponent(filename)}` : address;

      return { href, label, download: true };
    }

    return undefined;
  }

  /**
   * Hands an address to the resolver its own destination declared, which has the last word on where
   * the link points.
   *
   * @param link - The stored link being resolved.
   * @param href - The address the plugin built.
   * @returns The address to use, undefined for a link leading nowhere, or a promise of either.
   */
  function runResolver(link: SanityLink<TDocument>, href: string): string | undefined | Promise<string | undefined> {
    if (pointsAt(link, "page")) {
      return resolvers?.page?.(href, link);
    }
    if (pointsAt(link, "anchor")) {
      return resolvers?.anchor?.(href, link);
    }
    if (pointsAt(link, "url")) {
      return resolvers?.url?.(href, link);
    }
    if (pointsAt(link, "email")) {
      return resolvers?.email?.(href, link);
    }
    if (pointsAt(link, "phone")) {
      return resolvers?.phone?.(href, link);
    }
    if (pointsAt(link, "file")) {
      return resolvers?.file?.(href, link);
    }

    return undefined;
  }

  /**
   * Reads how a resolved link stands against the page being drawn, which is what a site needs beyond
   * the address itself.
   *
   * @param resolvedLink - The resolved link to read.
   * @param pathname - Path of the page being drawn.
   * @returns The resolved link and the navigation state around it.
   */
  function readLinkState(resolvedLink: SanityResolvedLink | undefined, pathname: string | undefined): SanityLinkState {
    const url = createUrl(resolvedLink?.href, origin);

    if (!isDefined(url)) {
      if (isDefined(resolvedLink)) logger.error("Could not resolve an address from the given link, route, or href.");

      return createEmptyLinkState();
    }

    const isExternal = ["http:", "https:"].includes(url.protocol) && url.origin !== origin;

    return {
      resolvedLink,
      isExternal,
      opensNewTab: isExternal && resolvedLink?.download !== true && openExternalInNewTab,
      hasAnchor: isDefined(url.hash),
      // Getters, so a navigation state read without a pathname fails at the read rather than passing as inactive.
      get containsActivePath() {
        return readActiveState(pathname, "containsActivePath", (path) => checkContainsActivePath(url, path, origin));
      },
      get isActivePath() {
        return readActiveState(pathname, "isActivePath", (path) => checkIsActivePath(url, path, origin));
      },
    };
  }

  /**
   * Resolves a stored link, offering the address it built to the resolver that destination declared
   * before the author's own additions go back on.
   *
   * @param link - The stored link to resolve.
   * @param pathname - Path of the page being drawn.
   * @returns The navigation state, or a promise of it when the resolver answers with one.
   */
  function resolveStoredLink(
    link: SanityLink<TDocument>,
    pathname: string | undefined,
  ): SanityLinkState | Promise<SanityLinkState> {
    const destination = readDestination(link);
    if (!isDefined(destination)) return createEmptyLinkState();

    const composed = composeLink(link);
    const { href } = composed ?? {};

    if (!isDefined(href) || !isDefined(declaredResolvers[destination])) {
      return readLinkState(appendAuthoredDestination(link, composed), pathname);
    }

    /**
     * Puts a resolver's answer in place of the address the plugin built.
     *
     * @param answer - The address the resolver answered with.
     * @returns The navigation state around the resolved link.
     */
    function readAnsweredState(answer: string | undefined) {
      const resolved = isDefined(answer) ? { ...composed, href: answer } : undefined;

      return readLinkState(appendAuthoredDestination(link, resolved), pathname);
    }

    const answer = runResolver(link, href);
    if (!(answer instanceof Promise)) return readAnsweredState(answer);

    isAsynchronous = true;

    return answer.then((resolved) => readAnsweredState(resolved));
  }

  /**
   * Resolves a link from the first source given, reading both where it leads and how it should be
   * drawn against the page it appears on.
   *
   * @returns The resolved link and the navigation state around it, as a promise when any declared
   * resolver answers with one.
   */
  function resolveLink(props: SanityResolveLinkProps<TRoutes, TDocument>): SanityLinkResolution<TResolvers>;
  function resolveLink({ link, route, href, pathname }: SanityResolveLinkProps<TRoutes, TDocument>) {
    const state = ((): SanityLinkState | Promise<SanityLinkState> => {
      if (!isDefined([link, route, href])) return createEmptyLinkState();
      if (isDefined(link)) return resolveStoredLink(link, pathname);
      if (isDefined(route)) return readLinkState({ href: resolveRoute(route) }, pathname);

      return readLinkState({ href: stegaClean(href) ?? undefined }, pathname);
    })();

    return isAsynchronous ? Promise.resolve(state) : state;
  }

  return { resolveLink, resolveRoute, routes, routeParamsFragment, linkFragment };
}
