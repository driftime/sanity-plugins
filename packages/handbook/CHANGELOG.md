# @driftime/sanity-plugin-handbook

## 0.4.0

### Minor Changes

- Joined the Sanity Plugins suite, so the tool now shares its foundation, tooling, and conventions with the icon, color, and link plugins.

  - Requires Sanity Studio 6.10 or later, and the `sanity` peer dependency now says so. Dependency ranges overlap every Studio from 6.10 up, so `@portabletext/react` is `^8.0.0` rather than `^7.0.1 || ^8.0.0`, and one copy of each shared package resolves.
  - `SanityHandbookCalloutVariant` is exported, for typing a callout's variant on a site that renders the guides.
  - Every configuration option documents its default, and the `link` annotation carries an icon like every other registered type.
  - The hint control in the documentation panel is a Sanity UI button, so it matches the rest of the Studio.
  - User-facing text is American English throughout.
  - README: rewritten in the suite's shared structure and voice, with Documentation, Guides, and Reference sections, npm badges, new screenshots, and a hero showing the whole tool.

## 0.3.2

### Patch Changes

- Restructured the README to match the plugin suite, with a separate title and byline, consistent spacing between sections, and a footer linking the other Driftime® plugins.

## 0.3.1

### Patch Changes

- Widened the `@portabletext/react` range to `^7.0.1 || ^8.0.0` so it overlaps whichever copy the Studio brings. The previous `^8.0.0` matched Sanity 6.12 and later, but not the `^7.0.1` of earlier 6.x releases, where a consumer installed two copies of Portable Text React.
- Built and typechecked against Sanity 6.13, with build tooling updated to `@sanity/pkg-utils` 13.

## 0.3.0

### Minor Changes

- Breaking: requires Sanity Studio 6 and React 19; earlier versions are no longer supported.
- Breaking: supported Node versions are now `>=20.19 <22 || >=22.12`.
- Breaking: the `groups` plugin option is now `roles`, and required; its `HandbookStructureGroup` type is now `SanityHandbookDocumentRole`.
- Breaking: every exported type now carries the `Sanity` prefix, so `HandbookMetadata`, `HandbookBlockDefinition`, `HandbookConfig`, and `HandbookGuideGroup` become `SanityHandbookMetadata`, `SanityHandbookBlockDefinition`, `SanityHandbookConfig`, and `SanityHandbookGuideGroup`.
- Breaking: `_key` has moved from `SanityHandbookGuideGroup` and `SanityHandbookGuide` to their array members.
- Breaking: the package is ESM only; the CommonJS build has been dropped.
- Breaking: `@portabletext/react` and `@sanity/icons` were imported without being declared, so they were bundled into `dist`. Both are now declared and resolved from the Studio instead, and `@sanity/ui` moves from `peerDependencies` to `dependencies`.
- Breaking: `src` is no longer published alongside `dist`.
- Added value types for every built-in block (`SanityHandbookCallout`, `SanityHandbookCode`, `SanityHandbookHorizontalRule`, `SanityHandbookImage`, `SanityHandbookVideo`), plus `SanityHandbookLink` for the link annotation.
- `handbookStructure` accepts an optional `editors` argument rather than relying solely on the list registered by the plugin.
- The tool now uses the Studio's own pane layout, so the sidebar and content panes are resizable and collapsible. It previously switched layout at fixed breakpoints.
- The sidebar uses the Studio's command list, so guides and document types can be selected with the keyboard.
- Guides are fetched through typed GROQ queries, and the viewer shares its Portable Text components with the Studio's editor, so a guide renders the same in both.
- The plugin is compiled with the React Compiler.

## 0.2.1

### Patch Changes

- Fixed the image paths in the README to use absolute URLs for cross-platform compatibility.
- Removed an erroneous yalc self-dependency from the published package.

## 0.2.0

### Minor Changes

- Replaced the `lucide-react` runtime dependency with inlined SVG icon components, leaving the plugin with no runtime dependencies.

## 0.1.0

### Minor Changes

- Initial release: schema-driven documentation and editorial guides, built right into Sanity Studio.
- Generates browsable field documentation from your schema definitions, with support for descriptions, examples, tips, and warnings.
- Includes a Portable Text guide authoring system with built-in blocks for images, videos, code, callouts, and more.
- Supports custom blocks, editor permission gating, and Structure tool integration.
