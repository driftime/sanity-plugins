import { isDefined } from "@repo/lib/utils";

import { defineLinkConfig } from "@/lib/links";
import type { SanityLinkState } from "@/lib/links";

/** Asserts that two types are each other's, so a conditional return is measured rather than widened. */
type Expect<TActual, TExpected> = [TActual] extends [TExpected]
  ? [TExpected] extends [TActual]
    ? true
    : never
  : never;

const { resolveLink, routes } = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: {
    home: { path: "/", sitemap: { priority: 1 } },
    page: { path: "/[slug]", params: { slug: "slug.current" } },
  },
});

/** A route definition keeps the keys the plugin does not interpret. */
export const sitemapSurvives: { priority: number } = routes.home.sitemap;

/** A route named in code carries the parameters its own path declares. */
export const routeResolves = resolveLink({ route: { _type: "page", slug: "about" }, pathname: "/" });

export const parameterMissing = resolveLink({
  // @ts-expect-error A route missing a parameter its path declares cannot be resolved.
  route: { _type: "page" },
  pathname: "/",
});

export const expressionMissing = defineLinkConfig({
  baseUrl: "https://acme.com",
  // @ts-expect-error A path declaring a parameter needs a GROQ expression for it.
  routes: { page: { path: "/[slug]" } },
});

export const expressionUnwanted = defineLinkConfig({
  baseUrl: "https://acme.com",
  // @ts-expect-error A parameter the path does not declare has nothing to fill.
  routes: { page: { path: "/[slug]", params: { slug: "slug.current", category: "category->slug.current" } } },
});

const synchronous = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: { page: { path: "/[slug]", params: { slug: "slug.current" } } },
  resolvers: { url: (href) => href.replace("http://", "https://") },
});

const withoutResolvers = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: { page: { path: "/[slug]", params: { slug: "slug.current" } } },
});

/** A configuration declaring no resolvers at all resolves at once. */
export const resolvesSynchronouslyByDefault: Expect<
  ReturnType<typeof withoutResolvers.resolveLink>,
  SanityLinkState
> = true;

/** A configuration whose resolvers all answer at once resolves at once. */
export const resolvesSynchronously: Expect<ReturnType<typeof synchronous.resolveLink>, SanityLinkState> = true;

const asynchronous = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: { page: { path: "/[slug]", params: { slug: "slug.current" } } },
  resolvers: {
    url: (href) => href,
    file: async (href, link) => {
      const asset = await Promise.resolve(link.file?.asset);

      // @ts-expect-error A file link holds no reference to a document.
      void link.reference;

      return isDefined(asset) ? href : undefined;
    },
  },
});

/** One resolver answering with a promise makes every resolution answer with one. */
export const resolvesAsynchronously: Expect<
  ReturnType<typeof asynchronous.resolveLink>,
  Promise<SanityLinkState>
> = true;

export const destinationUnknown = defineLinkConfig({
  baseUrl: "https://acme.com",
  // @ts-expect-error A resolver must name one of the destinations a link can point at.
  resolvers: { bogus: (href: string) => href },
});

const titled = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: { page: { path: "/[slug]", params: { slug: "slug.current" } } },
  title: { field: "name", resolver: (document) => document.title },
});
titled.resolveLink({ route: { _type: "page", slug: "about" }, pathname: "/" });

titled.resolveLink({ route: { _type: "page", slug: "about" } });
