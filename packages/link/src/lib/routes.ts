import { isDefined, readPath } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

import { logger } from "@/config/defaults";
import type { SanityLinkDocument } from "@/types";

/**
 * A route: the path a document type is served at and the GROQ that fills its parameters. Other keys are
 * kept as written and ignored.
 *
 * @public
 */
export interface SanityLinkRouteDefinition {
  /** URL path pattern, where each `[name]` segment is a parameter. */
  path: string;
  /** GROQ expression for each path parameter. */
  params?: Record<string, string>;
  /** Anything else the site stores on a route, ignored by the plugin. */
  [key: string]: unknown;
}

/**
 * Route definitions keyed by document type.
 *
 * @public
 */
export type SanityLinkRoutes = Record<string, SanityLinkRouteDefinition>;

/** Parameter names in a path pattern, so `"/[category]/[slug]"` gives `"category" | "slug"`. */
export type SanityLinkRouteParamNames<TPath extends string> = TPath extends `${string}[${infer TParam}]${infer TRest}`
  ? TParam | SanityLinkRouteParamNames<TRest>
  : never;

/**
 * A route table type-checked against its paths, so every path parameter has a GROQ expression and nothing
 * else does.
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
 * A route and the parameters its path needs, for linking without a document.
 *
 * @public
 */
export type SanityLinkRouteInput<TRoutes extends SanityLinkRoutes> = {
  [K in keyof TRoutes & string]: { _type: K } & Record<SanityLinkRouteParamNames<TRoutes[K]["path"]>, string>;
}[keyof TRoutes & string];

/**
 * Defines a route table, type-checking that every path parameter has a GROQ expression and nothing else
 * does.
 *
 * @param routes - Route definitions keyed by document type.
 * @returns The routes, unchanged.
 * @public
 */
export function defineLinkRoutes<const TRoutes extends SanityLinkRoutes>(
  routes: TRoutes & SanityCheckedLinkRoutes<TRoutes>,
) {
  return routes;
}

/**
 * Reads a route's parameter values from a fetched document: first those the query projected into
 * `_routeParams`, then any whose GROQ is a plain field path. A query only needs to project parameters
 * that follow a reference or compute a value.
 *
 * @param document - The document.
 * @param expressions - The GROQ expression for each parameter.
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
 * Creates a route resolver and the GROQ fragment that fetches its parameters, both from the same route
 * table.
 *
 * @param routes - Route definitions keyed by document type.
 * @returns The route resolver and the parameter fragment.
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
   * Resolves a document, or a route declared in code, to its path.
   *
   * @param destination - The document or route.
   * @returns The path, or undefined when the type has no route or a parameter has no value.
   */
  function resolveRoute(destination: SanityLinkRouteInput<TRoutes> | SanityLinkDocument) {
    const type: string = stegaClean(destination._type);
    const route = routes[type];

    if (!isDefined(route)) {
      logger.error(`No route is configured for the "${type}" type, so links to it resolve to nothing.`);

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
        `Could not resolve ${unresolved.join(", ")} for the "${type}" route. The query must include \`routeParamsFragment\`, and the document needs a value for every parameter.`,
      );

      return undefined;
    }

    return path;
  }

  return { resolveRoute, routeParamsFragment };
}
