import type { SanityClient } from "sanity";

/** A GROQ query string branded with the shape of the data it returns. */
type TypedQuery<T> = string & { readonly __result?: T };

/**
 * Brands a GROQ query with the shape of the data it returns, so a fetch can infer its result type
 * instead of being told it at every call site.
 *
 * @param query - The GROQ query string.
 * @returns The query, typed to the given result shape.
 */
export function defineTypedQuery<T>(query: string): TypedQuery<T> {
  return query;
}

/**
 * Runs a branded query against the dataset, resolving a missing document to undefined.
 *
 * @param client - The Sanity client to query with.
 * @param query - The branded query to run.
 * @returns The result, or undefined when the query matched nothing.
 */
export async function fetchQuery<T>(client: SanityClient, query: TypedQuery<T>) {
  return (await client.fetch<T | null>(query)) ?? undefined;
}
