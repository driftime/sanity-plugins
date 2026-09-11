# Link Guidelines

The rules every package follows live in the root `CLAUDE.md`; this file holds only what is true of Link alone.

## Environment

**Dependencies.** In addition to the shared rule: `@sanity/types` is the deliberate exception, because `sanity` pins it exactly and declaring a range of our own risks a second copy for the module augmentation to land on. Nothing imports it directly — the Studio side takes those types from `sanity`, and the render side declares the handful of stored shapes it reads.

## Structure

**The site draws its own links.** An anchor belongs to a consumer's design system — its variants, its router, its focus styles — so the render entry point resolves a link and stops there. This is why there is no shared renderer here as there is in the icon plugin: the Studio never draws a link.

**The site declares its routes, the plugin reads them.** A consumer's paths are theirs to name and theirs to validate against their framework's own generated types. So the render side takes a table of path patterns and the GROQ that fills their parameters, and derives the route resolver, the parameter fragment, and the link fragment from that one declaration rather than asking for each of them separately. A key on a route definition the plugin does not interpret is handed back untouched.

## Code

**Ordering.** In addition to the shared rule: the link types establish that order once, and the union, the schema fields, the selector, and the resolver all follow it.

**Uniform asynchrony.** A configuration holding one asynchronous resolver answers with a promise for every link, whatever destination it points at, so the shape a site handles never varies with the link: a resolver declared `async` is recognised as one before it runs, and a resolver merely answering with a promise from the first time it does.

## Sanity

**Type safety.** In addition to the shared rule: the annotation is the deliberate exception, and says so where it is defined.

**Conditional fields.** A field belonging to one link type only hides itself against the parent's type and requires itself the same way, through `rule.custom`. A plain `required()` cannot be used, because it would fire on the link types that never show the field.

**Data strings.** In addition to the shared rule: every part of a resolved href arrives this way, which is why the resolver cleans rather than trusts.

## Known Non-Fixes

**Unexpanded references.** A query that forgets to dereference leaves a `_ref` behind where the document should be, and a resolver reading it gets nothing usable. Report it and resolve to nothing rather than rendering a broken link, because the fix belongs in the query.
