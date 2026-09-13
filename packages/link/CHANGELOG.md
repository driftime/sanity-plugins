# @driftime/sanity-plugin-link

## 0.1.0

### Minor Changes

- Initial release. A link field for Sanity Studio covering pages, anchors, external addresses, email, phone, and file downloads in one control, with a matching Portable Text annotation. Ships a `./render` entry where a site declares its routes once, as path patterns whose parameters are GROQ expressions, and gets link resolution, a route resolver, and the GROQ fragments that feed them back from that one table. Optional per-destination resolvers can adjust any address, synchronously or asynchronously. Requires Sanity Studio 6.10 or later.
