import { isDefined, readPath } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { logger } from "@/config/defaults";
import type { SanityLinkDocument } from "@/types";

/**
 * One entry in a site's route table, pairing the path a document is served at with the GROQ that
 * fills the parameters in it. Keys beyond these two are kept as written and mean nothing here.
 *
 * @public
 */
export interface SanityLinkRouteDefinition {
  /** URL path pattern, in which every `[name]` segment is a parameter. */
  path: string;
  /** GROQ expression resolving each path parameter against the documents the route renders. */
  params?: Record<string, string>;
  /** Anything else a site attaches to a route, kept as written and read by nothing here. */
  [key: string]: unknown;
}

/**
 * Route definitions keyed by the document type each one renders.
 *
 * @public
 */
export type SanityLinkRoutes = Record<string, SanityLinkRouteDefinition>;

/**
 * Parameter names a path pattern declares, so `"/[category]/[slug]"` reads as `"category" | "slug"`.
 *
 */
export type SanityLinkRouteParamNames<TPath extends string> = TPath extends `${string}[${infer TParam}]${infer TRest}`
  ? TParam | SanityLinkRouteParamNames<TRest>
  : never;

/**
 * A route table checked against the patterns it declares, so every parameter a path names has a GROQ
 * expression and nothing else does.
 *
 * @public
 */
export type SanityCheckedLinkRoutes<TRoutes extends SanityLinkRoutes> = {
  [K in keyof TRoutes]: [SanityLinkRouteParamNames<TRoutes[K]["path"]>] extends [never]
    ? { params?: undefined }
    : {
        params: Record<SanityLinkRouteParamNames<TRoutes[K]["path"]>, string> & {
          [P in keyof TRoutes[K]["params"]]: P extends SanityLinkRouteParamNames<TRoutes[K]["path"]>
            ? string
            : { error: `"${P & string}" is not a parameter of "${TRoutes[K]["path"]}"` };
        };
      };
};

/**
 * Every route addressable without a document, each carrying the parameters its own path declares.
 *
 * @public
 */
export type SanityLinkRouteInput<TRoutes extends SanityLinkRoutes> = {
  [K in keyof TRoutes & string]: { _type: K } & Record<SanityLinkRouteParamNames<TRoutes[K]["path"]>, string>;
}[keyof TRoutes & string];

/**
 * Declares a route table, checking that every parameter a path names has a GROQ expression and
 * nothing else does.
 *
 * @param routes - Route definitions keyed by the document type each one renders.
 * @returns The route definitions as given.
 * @public
 */
export function defineLinkRoutes<const TRoutes extends SanityLinkRoutes>(
  routes: TRoutes & SanityCheckedLinkRoutes<TRoutes>,
) {
  return routes;
}

/**
 * Reads a route's parameter values off a fetched document: those a query projected into `_routeParams`
 * first, then any whose GROQ is a plain field path, read directly, so a query need only project the
 * parameters that follow a reference or compute a value.
 *
 * @param document - The document a route is being resolved for.
 * @param expressions - The GROQ expression each parameter is filled from.
 * @returns The parameter values that could be read.
 */
function readDocumentParams(document: SanityLinkDocument, expressions: Record<string, string>) {
  const projected = document._routeParams ?? {};

  return Object.fromEntries(
    Object.entries(expressions).map(([param, expression]) => {
      if (isDefined(projected[param])) return [param, projected[param]];
      if (!/^[A-Za-z_][\w.]*$/u.test(expression)) return [param, undefined];

      return [param, readPath(document, expression.split("."))];
    }),
  );
}

/**
 * Binds a site's route table to the functions that read it, so a path is declared once and both the
 * query filling its parameters and the resolver spending them follow the same declaration.
 *
 * @param routes - Route definitions keyed by the document type each one renders.
 * @returns An object holding the route resolver and the GROQ that feeds it.
 */
export function createRouteResolver<TRoutes extends SanityLinkRoutes>(routes: TRoutes) {
  const routeParamsFragment = Object.entries(routes)
    .flatMap(([type, route]) => {
      const projection = Object.entries(route.params ?? {})
        .map(([param, expression]) => `"${param}": ${expression}`)
        .join(", ");

      return isDefined(projection) ? [`_type == "${type}" => { "_routeParams": { ${projection} } }`] : [];
    })
    .join(", ");

  /**
   * Resolves a document, or a route named in code, into the path it is served at.
   *
   * @param destination - The document or route to resolve.
   * @returns The path, or undefined when the type has no route or a parameter has no value.
   */
  function resolveRoute(destination: SanityLinkRouteInput<TRoutes> | SanityLinkDocument) {
    const type: string = stegaClean(destination._type);
    const route = routes[type];

    if (!isDefined(route)) {
      logger.error(`No route is configured for the "${type}" type, so a link to it leads nowhere.`);

      return undefined;
    }

    const params: Record<string, unknown> =
      "_id" in destination ? readDocumentParams(destination, route.params ?? {}) : destination;

    let { path } = route;
    for (const [param, value] of Object.entries(params)) {
      if (typeof value === "string") path = path.replaceAll(`[${param}]`, stegaClean(value));
    }

    const unresolved = path.match(/\[[^\]]+\]/gu);

    if (isDefined(unresolved)) {
      logger.error(
        `Could not resolve ${unresolved.join(", ")} for the "${type}" route. The fetching query must spread \`routeParamsFragment\`, and the document must hold a value for every parameter.`,
      );

      return undefined;
    }

    return path;
  }

  return { resolveRoute, routeParamsFragment };
}
