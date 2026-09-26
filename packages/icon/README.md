<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" alt="Icon plugin logo" width="48" />
  </picture>
  <h1>Icon</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Icons for Sanity Studio, managed as content by the authors who use them.</p>
  <p>
    <a href="https://www.npmjs.com/package/@driftime/sanity-plugin-icon"><img src="https://img.shields.io/npm/v/@driftime/sanity-plugin-icon?style=flat-square&labelColor=1a1a1a&color=666666" alt="npm version" /></a>
    <a href="https://github.com/driftime/sanity-plugins/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@driftime/sanity-plugin-icon?style=flat-square&labelColor=1a1a1a&color=666666" alt="License: MIT" /></a>
  </p>
</div>

<br />

## Overview

Icons are part of a site's visual language, chosen with the same care as its typography and its colors, and Icon makes them part of the content. It works with the icon library a project installs, such as Lucide, Phosphor, or Central Icon System, or with custom iconography drawn for a brand or a product. In the Studio, that library becomes a field that feels native, and authors search every icon in it to find the one they need.

The real difference is on the site. When an author picks an icon, its drawing is stored on the document, so the front end needs no icon library at all. There's no package of icon components to import and no icons to bundle, only one small component that draws whatever the CMS sends, on the server or in the browser.

The Studio is just as light. The plugin ships no icons of its own and reads the icon library while the Studio builds, so a picker stays fast with a hundred icons or several thousand.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-light.png" alt="The icon picker open in Sanity Studio, showing a search field above a scrolling grid of Lucide icons" />
  </picture>
  <p align="center"><sub><em>The icon picker, with all 1,854 Lucide icons in one searchable grid.</em></sub></p>
</figure>

<br />

## Installation

Icon is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 20.19 or later is required, or 22.12 or later on Node 22.

```bash
bun add -E @driftime/sanity-plugin-icon
```

Each icon library a field uses is installed alongside it, as described in [Installing an Icon Library](#installing-an-icon-library).

<br />

## Studio

In the Studio, the plugin registers an `icon` type, takes the icon library every field offers, and adds a step to the Studio's build that reads the installed icon libraries.

<br />

### Adding the Build Step

The build step reads every installed icon library when the Studio starts or builds, and converts each one into the form the picker and the site use. It runs inside the bundler that builds the Studio, so it's added to that bundler's configuration. The icon libraries never become part of the Studio's own code.

Each conversion is cached inside `node_modules`, so an icon library is only converted again when its version changes. Changes to icon libraries and to the project's own icons apply while the Studio runs, with no restart.

The build step also writes the names of the installed icons into the plugin's own type declarations, so options are checked against them. Nothing is written to the project itself.

<br />

#### Standalone Studio

A standalone Studio is built with Vite. `withIcons` extends its `vite` option in `sanity.cli.ts`.

```typescript
import { withIcons } from "@driftime/sanity-plugin-icon/vite";
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  // ...
  vite: withIcons(),
});
```

<br />

#### Next.js

A Studio embedded in a Next.js app is built by Next.js, with Turbopack or webpack. `withIcons` wraps the app's configuration in `next.config.ts`.

```typescript
import { withIcons } from "@driftime/sanity-plugin-icon/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  // ...
};

export default withIcons()(config);
```

<br />

#### Other Vite Frameworks

A Studio embedded in another Vite-based framework, such as React Router, TanStack Start, or Astro, adds `iconLibraries` to that framework's Vite plugins.

```typescript
import { iconLibraries } from "@driftime/sanity-plugin-icon/vite";

export default defineConfig({
  // ...
  plugins: [
    // ...
    iconLibraries(),
  ],
});
```

<br />

#### Build Options

`withIcons` and `iconLibraries` accept the same options.

| Option   | Type                     | Default | Purpose                                                                                                                           |
| -------- | ------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `custom` | `Record<string, string>` | none    | Folders of the project's own SVG icons, keyed by icon library identifier. See [The Project's Own Icons](#the-projects-own-icons). |

<br />

### Choosing an Icon Library

The plugin reads eight published icon libraries. Each has an identifier, which the plugin and its fields use to name it, and one or more styles.

| Icon library                                       | Identifier  | Package                        | Styles                                                              | Keywords |
| -------------------------------------------------- | ----------- | ------------------------------ | ------------------------------------------------------------------- | -------- |
| [Central Icon System](https://iconists.co/central) | `central`   | `@central-icons-react/<style>` | One package per style, such as `round-outlined-radius-2-stroke-1.5` | yes      |
| [Heroicons](https://heroicons.com)                 | `heroicons` | `heroicons`                    | `outline`, `solid`, `mini`, `micro`                                 | no       |
| [Hugeicons](https://hugeicons.com)                 | `hugeicons` | `@hugeicons/core-free-icons`   | `stroke-rounded`                                                    | no       |
| [Iconoir](https://iconoir.com)                     | `iconoir`   | `iconoir`                      | `regular`, `solid`                                                  | no       |
| [Lucide](https://lucide.dev)                       | `lucide`    | `lucide-static`                | `default`                                                           | yes      |
| [Nucleo](https://nucleoapp.com)                    | `nucleo`    | `nucleo-<style>`               | One package per style, such as `ui-outline-18`                      | no       |
| [Phosphor Icons](https://phosphoricons.com)        | `phosphor`  | `@phosphor-icons/core`         | `regular`, `thin`, `light`, `bold`, `fill`, `duotone`               | yes      |
| [Tabler Icons](https://tabler.io/icons)            | `tabler`    | `@tabler/icons`                | `outline`, `filled`                                                 | yes      |

Search always matches an icon's name. Some icon libraries also publish keywords for their icons, which is how a search for "next" finds an arrow. The Keywords column shows which ones do, and the others match by name alone.

Central Icon System and Nucleo are commercial icon libraries, installed under the license their own documentation describes. Both publish one package per style, and each package the project installs becomes one of the icon library's styles.

<br />

### Installing an Icon Library

Each icon library is installed from the package listed for it in [Choosing an Icon Library](#choosing-an-icon-library). Only the build step reads the package, so it can be a dev dependency and never reaches the site.

```bash
bun add -D -E lucide-static
```

It has to be that exact package, even in a project that already uses the icon library some other way. Framework packages such as `lucide-react` or `@phosphor-icons/vue` contain components rather than SVG files, so the plugin can't read icons from them.

The package also has to be listed in the project's own `package.json`. A copy that another dependency happens to install is ignored, so the icons in the Studio always come from the version the project chose.

<br />

### Registering the Plugin

The plugin needs to know which icon library its fields offer. Register it with that icon library's identifier.

```typescript
import { defineConfig } from "sanity";
import { iconPlugin } from "@driftime/sanity-plugin-icon";

export default defineConfig({
  // ...
  plugins: [
    // ...
    iconPlugin({ library: "lucide" }),
  ],
});
```

| Option    | Type                | Default             | Purpose                                                                                             |
| --------- | ------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| `library` | `SanityIconLibrary` | required            | The icon library every field offers, unless a field names its own.                                  |
| `style`   | `SanityIconStyle`   | the library's first | The icon library's style. See [Choosing a Style](#choosing-a-style).                                |
| `icons`   | `SanityIconName[]`  | all                 | Icons every field offers, in the order listed. See [Restricting the Icons](#restricting-the-icons). |

<br />

### Adding an Icon Field

A field of type `icon` is defined like any other, and offers the plugin's icon library.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Icon shown beside the heading.",
});
```

| Option    | Type                | Default             | Purpose                                                     |
| --------- | ------------------- | ------------------- | ----------------------------------------------------------- |
| `library` | `SanityIconLibrary` | the plugin's        | The icon library this field offers.                         |
| `style`   | `SanityIconStyle`   | the library's first | The icon library's style. Only set together with `library`. |
| `icons`   | `SanityIconName[]`  | all                 | Icons this field offers. Only set together with `library`.  |

A field that names an icon library **replaces** the plugin's icon library, style, and icons, and a field that doesn't uses all three of the plugin's. So a field can offer a different icon library from the rest of the Studio, for example one of the project's own.

```typescript
defineField({
  name: "badge",
  type: "icon",
  description: "Badge shown on the product card.",
  options: { library: "phosphor", style: "duotone" },
});
```

The type name is always `icon`, so a Studio that already has a type by that name needs to rename it before installing.

<br />

### Choosing a Style

An icon library that draws its icons in several ways, such as Phosphor's weights or Heroicons' sizes, offers each as a style. A style is chosen with the icon library, and without one the icon library's first style is used.

```typescript
iconPlugin({
  library: "phosphor",
  style: "bold",
});
```

Styles are typed against the icon library, so `style: "bold"` is accepted for Phosphor and rejected for Lucide. Each style is its own set, with its own search results and its own recent icons.

<br />

### Restricting the Icons

A field offers the whole icon library unless restricted, and most sites want a smaller set. Pass the icons the site uses to the plugin, and every field offers those, in the order they're listed.

```typescript
iconPlugin({
  library: "lucide",
  icons: ["sun", "wind", "droplets", "leaf", "sprout", "mountain", "tent", "compass"],
});
```

A single field sometimes needs a list of its own, for example a contact card whose icon should only ever be a mail, phone, or globe symbol. Pass `icons` in the field's `options`, with its icon library.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Icon shown beside the contact method.",
  options: { library: "lucide", icons: ["mail", "phone", "globe"] },
});
```

A name the installed release doesn't have is skipped, and restricting a field later is safe, because a stored icon carries its own drawing and still renders when the picker no longer offers it.

Names are typed against the release installed in the project, so they complete as they're typed, once the build step has run. A list shared between the plugin and a field, or between several fields, is typed with `SanityIconName` and the icon library's identifier.

```typescript
import type { SanityIconName } from "@driftime/sanity-plugin-icon";

export const contactIcons: SanityIconName<"lucide">[] = ["mail", "phone", "globe"];
```

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-light.png" alt="The icon picker filtered by the search term next, showing the icons whose names or tags match it" />
  </picture>
  <p align="center"><sub><em>Search matches an icon's name and the terms Lucide tags it with, so "next" also finds arrow and skip icons.</em></sub></p>
</figure>

<br />

### The Project's Own Icons

A folder of SVG files becomes an icon library of its own. It might hold a brand's marks, or a complete icon set drawn for a brand or a product. Pass the folder's path, relative to the project, to the build step under an identifier. Fields then name that identifier as their icon library.

```typescript
export default defineCliConfig({
  // ...
  vite: withIcons({ custom: { acme: "./icons" } }),
});
```

```typescript
defineField({
  name: "mark",
  type: "icon",
  description: "Brand mark shown in the footer.",
  options: { library: "acme" },
});
```

Each SVG file directly inside the folder becomes an icon named after the file, so `Rocket_Launch.svg` is `rocket-launch`. Subfolders aren't read, and the icon library has one style, `default`.

Each file is cleaned the same way as an icon from a published icon library: minified, with its identifiers made unique to the icon, and with scripts, event handlers, and titles removed. A file that can't be read, or that embeds or loads something an icon can't safely hold, such as an image, is skipped, and the build log names it and says why.

<br />

#### Keywords

Keywords for search go in a `keywords.json` file inside the same folder, next to the SVG files.

```text
icons/
├── keywords.json
├── Rocket_Launch.svg
└── ...
```

The file maps each icon's name to its keywords. It's optional, and an icon it doesn't list is still found by its name.

```json
{
  "rocket-launch": ["start", "space", "launch"]
}
```

<br />

### Document Previews

A document's preview shows the icon its type was given in the schema, which is the same for every document of that type. `createIconPreview` shows the icon the author chose instead. Pass it the stored value in `prepare`.

```typescript
import { createIconPreview } from "@driftime/sanity-plugin-icon";

defineType({
  // ...
  preview: {
    select: { title: "title", icon: "icon" },
    prepare({ title, icon }) {
      return { title, media: createIconPreview(icon) };
    },
  },
});
```

When nothing readable is stored, it returns `undefined` and the preview falls back to the type's own icon.

<br />

## Site

On the site, one component draws a stored icon, and it's imported from `@driftime/sanity-plugin-icon/render`. That path carries no Studio code, so it's safe in server components and anywhere else on the site.

<br />

### Rendering Icons

`Icon` draws the drawing held in the stored value, and it's the only icon code the site ships, whichever icon library the icon came from. The markup is a plain `svg` element, rendered on the server or the client alike, and the component renders nothing when the value is missing or unreadable.

```tsx
import { Icon } from "@driftime/sanity-plugin-icon/render";
import type { SanityIcon } from "@driftime/sanity-plugin-icon/render";

interface FeatureProps {
  icon: SanityIcon | undefined;
  title: string;
}

export function Feature({ icon, title }: FeatureProps) {
  return (
    <article>
      <Icon value={icon} className="size-8" />
      <h3>{title}</h3>
    </article>
  );
}
```

| Prop    | Type                      | Purpose                                                |
| ------- | ------------------------- | ------------------------------------------------------ |
| `value` | `SanityIcon \| undefined` | The stored icon. Required, though it may hold nothing. |

Every other prop is an `svg` element's and is spread onto the root element after the icon's own attributes, so `className` and `style` apply. The icon keeps the frame and paint its icon library drew it with, so an icon drawn in `currentColor` takes the surrounding text color, and a full-color icon keeps its own colors. It's `aria-hidden`, so assistive technology treats it as decoration beside its text, and an icon that carries meaning on its own takes `aria-hidden={false}` and an `aria-label`.

```tsx
<Icon value={link.icon} aria-hidden={false} aria-label="Opens in a new tab" />
```

A stored drawing is checked before it's drawn, and one holding anything that could run code or load something from outside the icon renders nothing.

<br />

### Querying

An icon needs nothing special in a query. It comes back as a plain object with the rest of the document.

```groq
*[_type == "home"][0] { title, icon }
```

<br />

## Reference

The rest of this document covers the shape of a stored icon and everything the package exports.

<br />

### Stored Icons

`SanityIcon` is the type of a stored icon.

```typescript
import type { SanityIcon } from "@driftime/sanity-plugin-icon/render";

export interface SanityFeature {
  icon?: SanityIcon;
}
```

```json
{
  "_type": "icon",
  "library": "lucide",
  "style": "default",
  "name": "house",
  "node": "{\"root\":{\"fill\":\"none\",\"stroke\":\"currentColor\",\"strokeLinecap\":\"round\",\"strokeLinejoin\":\"round\",\"strokeWidth\":\"2\",\"viewBox\":\"0 0 24 24\"},\"node\":[[\"path\",{\"d\":\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"}],[\"path\",{\"d\":\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"}]]}"
}
```

| Field     | Type     | Purpose                                                                                                                      |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `_type`   | `string` | Always `icon`.                                                                                                               |
| `library` | `string` | The identifier of the icon library the icon was chosen from.                                                                 |
| `style`   | `string` | The style it was chosen from. Absent when the field didn't name one, so the icon library's first style was used.             |
| `name`    | `string` | The icon's name in its icon library.                                                                                         |
| `node`    | `string` | The icon's drawing as JSON: the attributes of its `svg` element and the elements inside it. Written when the icon is chosen. |

The drawing is written with the name, which is what lets an icon render without its icon library. A stored icon with a name but no drawing fails validation with a prompt to select it again, so a document can't be published with an icon that renders as nothing.

<br />

### API

| Export                     | Import from                           | Purpose                                                  |
| -------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `iconPlugin(config)`       | `@driftime/sanity-plugin-icon`        | Registers the `icon` type.                               |
| `createIconPreview(value)` | `@driftime/sanity-plugin-icon`        | Builds preview media from a stored icon.                 |
| `withIcons(options?)`      | `@driftime/sanity-plugin-icon/vite`   | Adds the build step to the `vite` option of a Studio.    |
| `iconLibraries(options?)`  | `@driftime/sanity-plugin-icon/vite`   | The build step as a Vite plugin, for a framework's list. |
| `withIcons(options?)`      | `@driftime/sanity-plugin-icon/next`   | Adds the build step to a Next.js configuration.          |
| `Icon`                     | `@driftime/sanity-plugin-icon/render` | Draws a stored icon.                                     |

<br />

### Types

| Type                          | Import from                           | Purpose                                                               |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `SanityIconConfig`            | `@driftime/sanity-plugin-icon`        | Everything `iconPlugin` accepts.                                      |
| `SanityIconOptions`           | `@driftime/sanity-plugin-icon`        | The `options` an icon field accepts.                                  |
| `SanityIconDefinition`        | `@driftime/sanity-plugin-icon`        | A field or array member of type `icon`.                               |
| `SanityIconSelection`         | `@driftime/sanity-plugin-icon`        | An icon library with a style and icons checked against it.            |
| `SanityIconLibrary`           | `@driftime/sanity-plugin-icon`        | The identifier of a supported icon library.                           |
| `SanityIconStyle`             | `@driftime/sanity-plugin-icon`        | The styles of an icon library, given its identifier.                  |
| `SanityIconName`              | `@driftime/sanity-plugin-icon`        | The names of an icon library's installed icons, given its identifier. |
| `SanityIconBuildOptions`      | `@driftime/sanity-plugin-icon`        | Everything the build step accepts.                                    |
| `SanityIconVitePlugin`        | `@driftime/sanity-plugin-icon/vite`   | What `iconLibraries` returns.                                         |
| `SanityIconNextConfig`        | `@driftime/sanity-plugin-icon/next`   | The parts of a Next.js configuration the build step extends.          |
| `SanityIconWebpackConfig`     | `@driftime/sanity-plugin-icon/next`   | The parts of a webpack configuration the build step extends.          |
| `SanityIconWebpackCustomizer` | `@driftime/sanity-plugin-icon/next`   | A Next.js `webpack` option the build step runs first.                 |
| `SanityIconProps`             | `@driftime/sanity-plugin-icon/render` | Everything `Icon` accepts: an `svg` element's props and `value`.      |
| `SanityIcon`                  | `@driftime/sanity-plugin-icon/render` | A stored icon, with its icon library, its name, and its drawing.      |

<br />

## License

MIT © [Driftime®](https://driftime.com). See [LICENSE](https://github.com/driftime/sanity-plugins/blob/main/LICENSE).

<br />

## Acknowledgements

The plugin ships no icons. Each icon library is installed by the project under its own license: [Lucide](https://lucide.dev) under the ISC License, [Heroicons](https://heroicons.com), [Hugeicons](https://hugeicons.com)' free set, [Iconoir](https://iconoir.com), [Phosphor Icons](https://phosphoricons.com), and [Tabler Icons](https://tabler.io/icons) under the MIT License, and [Central Icon System](https://iconists.co/central) and [Nucleo](https://nucleoapp.com) under their commercial licenses. Icons for the Studio's own controls come from `@sanity/icons`, so they match the rest of the Studio.

<br />
<br />

<div align="center">
  <p><strong>Built alongside <a href="https://cairn.driftime.com">Cairn</a>, a starting point for responsible web experiences.</strong></p>
  <p>Part of a suite of Sanity Studio plugins by Driftime®</p>
  <p><a href="https://github.com/driftime/sanity-plugins#readme">Sanity Plugins</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/handbook#readme">Handbook</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/icon#readme">Icon</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/color#readme">Color</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/link#readme">Link</a></p>
</div>

<br />

<div align="center">
  <a href="https://driftime.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://driftime.com/driftime-github-logo-dark.svg" />
      <source media="(prefers-color-scheme: light)" srcset="https://driftime.com/driftime-github-logo.svg" />
      <img src="https://driftime.com/driftime-github-logo.svg" alt="Driftime® Logo" width="100" />
    </picture>
  </a>
</div>
