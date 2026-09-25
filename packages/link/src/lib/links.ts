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
 * Functions that adjust a resolved link, one per kind of destination. Each receives the address the plugin
 * built and the stored link. Returning undefined makes the link resolve to nothing, as an unresolvable
 * route does.
 *
 * @public
 */
export type SanityLinkResolvers<TDocument extends SanityLinkDocument = SanityLinkDocument> = {
  [K in SanityLinkDestination]?: (
    href: string,
    link: Extract<SanityLink<TDocument>, { type: K }>,
  ) => string | undefined | Promise<string | undefined>;
};

/** Resolvers type-checked against the kinds of destination, so a misspelt key is an error instead of never running. */
export type SanityCheckedLinkResolvers<TResolvers, TDocument extends SanityLinkDocument = SanityLinkDocument> = {
  [K in keyof TResolvers]: K extends SanityLinkDestination
    ? (
        href: string,
        link: Extract<SanityLink<TDocument>, { type: K }>,
      ) => string | undefined | Promise<string | undefined>
    : never;
};

/**
 * Site settings the link resolver needs. A site whose documents hold more fields can narrow the document
 * type.
 *
 * @public
 */
export interface SanityLinkResolverConfig<
  TRoutes extends SanityLinkRoutes = SanityLinkRoutes,
  TDocument extends SanityLinkDocument = SanityLinkDocument,
  TResolvers extends SanityLinkResolvers<TDocument> = SanityLinkResolvers<TDocument>,
> {
  /** Absolute URL the site is served from, used to tell internal links from external ones. */
  baseUrl: string;
  /** Path patterns keyed by document type. Without them, page links resolve to nothing. */
  routes?: TRoutes & SanityCheckedLinkRoutes<TRoutes>;
  /** Functions that can adjust the resolved address, one per kind of destination. */
  resolvers?: TResolvers & SanityCheckedLinkResolvers<TResolvers, TDocument>;
  /** Whether external links open in a new tab. Defaults to `true`. */
  openExternalInNewTab?: boolean;
  /** Where a page's title is read from, for the text of page links without a label. */
  title?: SanityLinkTitleConfig<TDocument>;
}

/**
 * Where a page's title is read from, by both the link fragment and the resolver.
 *
 * @public
 */
export interface SanityLinkTitleConfig<TDocument extends SanityLinkDocument = SanityLinkDocument> {
  /** Field holding a page's title. Defaults to `title`. */
  field?: string;
  /** Reads the title from a fetched page. Defaults to reading `field`. */
  resolver?: (document: TDocument) => string | undefined;
}

/**
 * A link resolved into the parts needed to render it.
 *
 * @public
 */
export interface SanityResolvedLink {
  /** Address the link points to. */
  href?: string;
  /** Link text, written by the author or taken from the destination. */
  label?: string;
  /** Whether the link downloads a file instead of opening a page. */
  download?: boolean;
}

/**
 * A resolved link and its navigation state.
 *
 * @public
 */
export interface SanityLinkState {
  /** The resolved link, or undefined when it leads nowhere. */
  resolvedLink: SanityResolvedLink | undefined;
  /** Whether the destination is on another site. */
  isExternal: boolean;
  /** Whether the link should open in a new tab. */
  opensNewTab: boolean;
  /** Whether the destination is a location within a page. */
  hasAnchor: boolean;
  /** Whether the destination is the current page or one of its parent paths. */
  containsActivePath: boolean;
  /** Whether the destination is exactly the current page. */
  isActivePath: boolean;
}

/**
 * What resolving a link returns: a promise when a resolver is declared to return one, and the navigation
 * state otherwise. A resolver that may return either counts as synchronous, since its declaration
 * doesn't say.
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
 * The link to resolve, taken from the first source given, and the current page.
 *
 * @public
 */
export interface SanityResolveLinkProps<
  TRoutes extends SanityLinkRoutes = SanityLinkRoutes,
  TDocument extends SanityLinkDocument = SanityLinkDocument,
> {
  /** Stored link. */
  link?: SanityLink<TDocument> | null | undefined;
  /** Route declared in code, for a link no author wrote. */
  route?: SanityLinkRouteInput<TRoutes> | null | undefined;
  /** Address to use as it is. */
  href?: string | null | undefined;
  /** Path of the current page, needed for the navigation state. Reading it without this throws in development. */
  pathname?: string;
}

/** A resolver read from the table by key, which loses the link type it was declared for. */
type UncorrelatedResolver = (href: string, link: never) => unknown;

/**
 * Reads a navigation state from the current path. Without a path it throws in development, since every
 * link would otherwise appear inactive, and returns false in production so a page never breaks.
 *
 * @param pathname - The current path.
 * @param state - Name of the state, for the error message.
 * @param check - Reads the state from the path.
 * @returns Whether the state holds.
 * @throws In development, when there's no pathname.
 */
function readActiveState(pathname: string | undefined, state: string, check: (pathname: string) => boolean) {
  if (isDefined(pathname)) return check(pathname);
  if (isDevelopment) {
    throw new Error(logger.format(`Pass \`pathname\` to \`resolveLink\` to read \`${state}\`.`));
  }

  return false;
}

/**
 * Creates a title reader for a field path, used when a site sets a field but no resolver.
 *
 * @param field - Dotted path to the title field.
 * @returns A function that reads the title, or undefined when it isn't a string.
 */
function createTitleResolver(field: string) {
  return (document: SanityLinkDocument) => {
    const title = readPath(document, field.split("."));

    return typeof title === "string" ? title : undefined;
  };
}

/**
 * Returns the configured route table, or an empty one.
 *
 * @param routes - The configured routes.
 * @returns The route table.
 */
function readRouteTable<TRoutes extends SanityLinkRoutes>(routes: TRoutes | undefined): TRoutes;
function readRouteTable(routes: SanityLinkRoutes | undefined) {
  return routes ?? {};
}

/**
 * Checks whether a resolver is declared `async`, which is known before it runs.
 *
 * @param resolver - The resolver to check.
 * @returns Whether the resolver is declared `async`.
 */
function isAsyncResolver(resolver: UncorrelatedResolver | undefined) {
  return isDefined(resolver) && resolver.constructor.name === "AsyncFunction";
}

/**
 * Reads a stored link's destination, removing stega characters first so links resolve the same way in
 * Presentation mode.
 *
 * @param link - The stored link.
 * @returns The destination, or undefined when it's missing or unknown.
 */
function readDestination(link: SanityLink) {
  const stored = stegaClean(link.type);
  if (!isDefined(stored)) return undefined;

  const destination = linkDestinations.find((candidate) => candidate === stored);
  if (!isDefined(destination)) {
    logger.error(`A link has the unknown destination "${stored}", so it resolves to nothing.`);
  }

  return destination;
}

/**
 * Checks whether a stored link points at a destination, narrowing it to that destination's fields. It
 * removes stega characters first, so it works in Presentation mode.
 *
 * @param link - The stored link.
 * @param destination - The destination.
 * @returns True if the link points at that destination.
 */
function pointsAt<TDocument extends SanityLinkDocument, TDestination extends SanityLinkDestination>(
  link: SanityLink<TDocument>,
  destination: TDestination,
): link is Extract<SanityLink<TDocument>, { type: TDestination }> {
  return stegaClean(link.type) === destination;
}

/**
 * Adds the author's anchor and parameters to a page link's address, after any resolver has run.
 *
 * @param link - The stored link.
 * @param resolvedLink - The resolved link.
 * @returns The resolved link with the additions, or undefined when it leads nowhere.
 */
function appendAuthoredDestination(link: SanityLink, resolvedLink: SanityResolvedLink | undefined) {
  if (!pointsAt(link, "page") || !isDefined(resolvedLink?.href)) return resolvedLink;

  const { anchor, searchParams } = link;

  return { ...resolvedLink, href: appendDestination(resolvedLink.href, anchor, searchParams) };
}

/**
 * Creates the navigation state for a link that leads nowhere.
 *
 * @returns The empty navigation state.
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
 * Binds a site's routes and settings to the link resolver, so links resolve the same way everywhere.
 *
 * @param linkConfig - The site settings.
 * @returns The link and route resolvers, the route table, and the GROQ fragments they rely on.
 * @public
 * @throws When the base URL isn't absolute.
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

  // Reading a resolver by link type loses the type it was declared for, so calls go through `runResolver`.
  const declaredResolvers: Partial<Record<SanityLinkDestination, UncorrelatedResolver>> = {
    page: resolvers?.page,
    anchor: resolvers?.anchor,
    url: resolvers?.url,
    email: resolvers?.email,
    phone: resolvers?.phone,
    file: resolvers?.file,
  };

  // An `async` resolver is known before it runs; one that just returns a promise is known once it has.
  let isAsynchronous = Object.values(declaredResolvers).some((resolver) => isAsyncResolver(resolver));

  // Thrown rather than logged, because no link can be resolved without a readable base URL.
  const { origin } = (() => {
    try {
      return new URL(baseUrl);
    } catch {
      throw new TypeError(logger.format(`The base URL "${baseUrl}" isn't an absolute URL.`));
    }
  })();

  const { resolveRoute, routeParamsFragment } = createRouteResolver(routes);
  const linkFragment = createLinkFragment(routeParamsFragment, titleField);

  /**
   * Resolves a stored link into its parts according to its destination. A page link's anchor and
   * parameters are added later, so resolvers see the path without them.
   *
   * @param link - The stored link.
   * @returns The resolved link, or undefined when it leads nowhere.
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

      // A URL pointing back at this site is treated as internal.
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
   * Passes an address to the resolver for the link's destination, which decides the final address.
   *
   * @param link - The stored link.
   * @param href - The address the plugin built.
   * @returns The final address, undefined for a link that leads nowhere, or a promise of either.
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
   * Works out a resolved link's navigation state relative to the current page.
   *
   * @param resolvedLink - The resolved link.
   * @param pathname - The current path.
   * @returns The resolved link and its navigation state.
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
      // Getters, so reading the state without a pathname fails there instead of passing as inactive.
      get containsActivePath() {
        return readActiveState(pathname, "containsActivePath", (path) => checkContainsActivePath(url, path, origin));
      },
      get isActivePath() {
        return readActiveState(pathname, "isActivePath", (path) => checkIsActivePath(url, path, origin));
      },
    };
  }

  /**
   * Resolves a stored link, passing the built address to its destination's resolver before adding the
   * author's anchor and parameters.
   *
   * @param link - The stored link.
   * @param pathname - The current path.
   * @returns The navigation state, or a promise of it when the resolver returns one.
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
     * Replaces the built address with the resolver's answer.
     *
     * @param answer - The resolver's address.
     * @returns The navigation state.
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
   * Resolves a link from the first source given, returning where it leads and its navigation state on the
   * current page.
   *
   * @param props - The link source and the current path.
   * @returns The resolved link and its navigation state, as a promise when any resolver returns one.
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
