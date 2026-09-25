import type { SanityClient } from "sanity";

/** GROQ query string that carries the type of its result. */
type TypedQuery<T> = string & { readonly __result?: T };

/**
 * Defines a GROQ query typed with its result, so fetches infer the result type.
 *
 * @param query - The GROQ query.
 * @returns The query, typed with its result.
 */
export function defineTypedQuery<T>(query: string): TypedQuery<T> {
  return query;
}

/**
 * Runs a typed query, returning undefined instead of null when nothing matches.
 *
 * @param client - The Sanity client.
 * @param query - The typed query.
 * @returns The result, or undefined when nothing matches.
 */
export async function fetchQuery<T>(client: SanityClient, query: TypedQuery<T>) {
  return (await client.fetch<T | null>(query)) ?? undefined;
}
