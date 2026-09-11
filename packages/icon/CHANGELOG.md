# @driftime/sanity-plugin-icon

## 0.2.0

### Minor Changes

- `iconPlugin` takes an `icons` option, limiting the picker to a chosen set rather than the whole library.
- The same option is accepted on a field, under `options`, where it replaces the set the plugin was given. The plugin augments `IntrinsicDefinitions`, so it is typed and completed like a built-in option.
- Icon names are typed against the Lucide version a project resolved, so they autocomplete and stay current without a plugin release. Icons are offered in the order they are listed, and a name that version does not recognize is skipped.
- `SanityIconName`, `SanityIconOptions`, `SanityIconConfig`, and `SanityIconDefinition` are exported for typing configuration, alongside the existing `SanityIcon`.
- An icon field's `options` are now typed rather than accepted as `unknown`, so a field passing an option this type does not define will fail to typecheck.
- Split the picker's grid, tooltip, and scroll handling into separate modules. Nothing the package exports has changed.

## 0.1.0

### Minor Changes

- Initial release: Lucide icons for Sanity Studio, stored as drawings and rendered without the library.
- Adds an icon field that opens the complete Lucide library as a searchable grid, matching on an icon's name and the terms it is tagged with.
- The chosen drawing is stored on the document, so rendering takes a single component and no icon library, in server and client components alike.
- Includes preview media for document lists, and remembers the icons an author reached for most recently.
