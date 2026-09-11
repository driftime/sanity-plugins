---
"@driftime/sanity-plugin-icon": minor
---

Joined the Sanity Plugins suite, so the plugin now shares its foundation, tooling, and conventions with the handbook, color, and link plugins.

- Breaking: `IconProps` on the `./render` entry is renamed `SanityIconProps`, matching the suite's type prefix.
- Breaking: `SanityIcon` is exported from the `./render` entry only, so every export has one import path.
- Requires Sanity Studio 6.10 or later, and the `sanity` peer dependency now says so. Dependency ranges overlap every Studio from 6.10 up, so one copy of each shared package resolves; `lucide-static` is `^1.44.0`.
- A stored icon is validated: a name with no SVG is reported instead of rendering nothing on the site.
- The field shows a placeholder icon before one is chosen, and shows presence, change indicators, and field actions like a native field.
- The picker's tooltip anchors to the hovered cell directly, so moving between cells no longer dismisses it.
- The icon count in the picker is formatted in American English, and user-facing text is American English throughout.
- README: rewritten in the suite's shared structure and voice, with Studio, Site, and Reference sections, npm badges, and new screenshots.
