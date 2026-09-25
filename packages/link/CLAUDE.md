# Link Guidelines

The rules every package follows are in the root `CLAUDE.md`. This file holds only what applies to Link.

## Environment

**Dependencies.** In addition to the shared rule: `@sanity/types` is the deliberate exception, because `sanity` pins it exactly, and declaring our own range risks a second copy for the module augmentation to land on. Nothing imports it directly: the Studio side takes those types from `sanity`, and the render side declares the few stored shapes it reads.

## Structure

**The site renders its own links.** An anchor belongs to a consumer's design system, with its variants, router, and focus styles, so the render entry resolves a link and stops there. That's why there's no shared renderer here as there is in the Icon plugin: the Studio never renders a link.

**The site declares its routes, and the plugin reads them.** A consumer's paths are theirs to name and to check against their framework's generated types. So the render side takes a table of path patterns and the GROQ that fills their parameters, and derives the route resolver, the parameter fragment, and the link fragment from that one declaration. Keys on a route definition that the plugin doesn't use are passed back untouched.

## Code

**Ordering.** In addition to the shared rule: the link types set the order once, and the union, the schema fields, the selector, and the resolver all follow it.

**Uniform asynchrony.** If a configuration has one asynchronous resolver, it returns a promise for every link, whatever its destination, so the shape a site handles never depends on the link. A resolver declared `async` is detected before it runs, and one that just returns a promise is detected the first time it does.

## Sanity

**Type safety.** In addition to the shared rule: the annotation is the deliberate exception, and says so where it's defined.

**Conditional fields.** A field that belongs to one link type hides itself based on the parent's type and makes itself required the same way, through `rule.custom`. A plain `required()` can't be used, because it would fire on link types that never show the field.

**Data strings.** In addition to the shared rule: every part of a resolved href is a Sanity string, which is why the resolver cleans values rather than trusting them.

## Known Non-Fixes

**Unexpanded references.** A query that forgets to dereference leaves a `_ref` where the document should be, and the resolver can't use it. Log it and resolve to nothing rather than rendering a broken link, because the fix belongs in the query.
