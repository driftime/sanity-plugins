# @driftime/sanity-plugin-link

## 0.2.0

### Minor Changes

- Added `defineLinkRoutes`, which declares a route table checked and typed on its own, and exported `SanityCheckedLinkRoutes`. A route definition's type now accepts keys beyond `path` and `params`, as the runtime already did. A parameter a path does not declare is reported with the path it was checked against.

## 0.1.0

### Minor Changes

- Initial release. A link field for Sanity Studio covering pages, anchors, external addresses, email, phone, and file downloads in one control, with a matching Portable Text annotation. Ships a `./render` entry where a site declares its routes once, as path patterns whose parameters are GROQ expressions, and gets link resolution, a route resolver, and the GROQ fragments that feed them back from that one table. Optional per-destination resolvers can adjust any address, synchronously or asynchronously. Requires Sanity Studio 6.10 or later.
