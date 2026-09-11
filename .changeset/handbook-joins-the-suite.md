---
"@driftime/sanity-plugin-handbook": minor
---

Joined the Sanity Plugins suite, so the tool now shares its foundation, tooling, and conventions with the icon, color, and link plugins.

- Requires Sanity Studio 6.10 or later, and the `sanity` peer dependency now says so. Dependency ranges overlap every Studio from 6.10 up, so `@portabletext/react` is `^8.0.0` rather than `^7.0.1 || ^8.0.0`, and one copy of each shared package resolves.
- `SanityHandbookCalloutVariant` is exported, for typing a callout's variant on a site that renders the guides.
- Every configuration option documents its default, and the `link` annotation carries an icon like every other registered type.
- The hint control in the documentation panel is a Sanity UI button, so it matches the rest of the Studio.
- User-facing text is American English throughout.
- README: rewritten in the suite's shared structure and voice, with Documentation, Guides, and Reference sections, npm badges, new screenshots, and a hero showing the whole tool.
