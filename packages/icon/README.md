<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" alt="Icon plugin logo" width="48" />
  </picture>
  <h1>Icon</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Lucide icons for Sanity Studio, stored as SVG and rendered without the library.</p>
  <p>
    <a href="https://www.npmjs.com/package/@driftime/sanity-plugin-icon"><img src="https://img.shields.io/npm/v/@driftime/sanity-plugin-icon?style=flat-square&labelColor=1a1a1a&color=666666" alt="npm version" /></a>
    <a href="https://github.com/driftime/sanity-plugins/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@driftime/sanity-plugin-icon?style=flat-square&labelColor=1a1a1a&color=666666" alt="License: MIT" /></a>
  </p>
</div>

<br />

## Overview

Icons are part of a site's visual language, chosen with the same care as its typography and its colors, and Icon makes them part of its content too. The whole [Lucide](https://lucide.dev) library sits behind a field, searchable by name or by what an icon depicts, so the icon beside a heading, a feature, or a link is chosen where the heading is written.

When an icon is chosen, its drawing is stored on the document alongside its name. The site renders that drawing with one component and no icon library, so nothing is looked up at runtime, and an icon keeps rendering through every Lucide release, whatever that release renames or removes.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-selector-light.png" alt="The icon picker open in Sanity Studio, showing a search field above a scrolling grid of every Lucide icon" />
  </picture>
  <p align="center"><sub><em>The icon picker, with the whole library in a searchable grid.</em></sub></p>
</figure>

<br />

## Installation

Icon is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 22.12 or later is required.

```bash
bun add -E @driftime/sanity-plugin-icon
```

<br />

## Studio

In the Studio, the plugin registers an `icon` type and takes the icons every field offers.

<br />

### Registering the Plugin

Nothing is required, and a plugin registered on its own offers every icon in the installed Lucide release.

```typescript
import { defineConfig } from "sanity";
import { iconPlugin } from "@driftime/sanity-plugin-icon";

export default defineConfig({
  // ...
  plugins: [
    // ...
    iconPlugin(),
  ],
});
```

| Option  | Type               | Default | Purpose                                                                                             |
| ------- | ------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| `icons` | `SanityIconName[]` | all     | Icons every field offers, in the order listed. See [Restricting the Icons](#restricting-the-icons). |

<br />

### Adding an Icon Field

A field of type `icon` is defined like any other.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Icon shown beside the heading.",
});
```

| Option  | Type               | Default           | Purpose                                                                       |
| ------- | ------------------ | ----------------- | ----------------------------------------------------------------------------- |
| `icons` | `SanityIconName[]` | the plugin's list | Icons this field offers. See [Restricting the Icons](#restricting-the-icons). |

The type name is always `icon`, so a Studio that already has a type by that name needs to rename it before installing.

<br />

### Restricting the Icons

A field offers the whole library unless restricted, and most sites want a smaller set. Pass the icons the site uses to the plugin, and every field offers those, in the order they are listed.

```typescript
iconPlugin({
  icons: ["sun", "wind", "droplets", "leaf", "sprout", "mountain", "tent", "compass"],
});
```

A single field sometimes needs a list of its own, for example a contact card whose icon should only ever be a mail, phone, or globe symbol. Pass `icons` in the field's `options`.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Icon shown beside the contact method.",
  options: { icons: ["mail", "phone", "globe"] },
});
```

A field's list **replaces** the plugin's list, so a field can offer any icon regardless of the plugin's, and a name the installed Lucide release does not have is skipped. Restricting a field later is safe, because a stored icon carries its own drawing and still renders when the picker no longer offers it.

Names are typed against the Lucide release installed in the project, so they complete as they are typed. A list shared between the plugin and a field, or between several fields, is typed with `SanityIconName`.

```typescript
import type { SanityIconName } from "@driftime/sanity-plugin-icon";

export const contactIcons: SanityIconName[] = ["mail", "phone", "globe"];
```

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-search-light.png" alt="The icon picker filtered by the search term next, showing every arrow and forward icon in the library" />
  </picture>
  <p align="center"><sub><em>Search matches an icon's name and the terms Lucide tags it with, so "next" finds every arrow.</em></sub></p>
</figure>

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

### Keeping the Library Current

The plugin depends on Lucide with a caret range, so a newer release installs without a plugin release. The project's lockfile pins whichever release was installed, and there are two ways to move it forward. Removing and re-adding the plugin resolves the range again.

```bash
bun remove @driftime/sanity-plugin-icon
bun add -E @driftime/sanity-plugin-icon
```

Adding `lucide-static` to the project's own dependencies puts the release under the project's control, and the plugin resolves to that copy from then on.

<br />

## Site

On the site, one component draws a stored icon, and it is imported from `@driftime/sanity-plugin-icon/render`. That path carries no Studio code, so it is safe in server components and anywhere else on the site.

<br />

### Rendering Icons

`Icon` draws the shapes held in the stored value, so no icon library is installed on the site. The markup is an `svg` element, and the component renders nothing when the value is missing or unreadable.

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

Every other prop is an `svg` element's and is spread onto the root element after the plugin's own attributes, so `className`, `style`, and `strokeWidth` all apply. The icon is drawn on Lucide's frame, 24 by 24 with a stroke of 2, and `aria-hidden`, so assistive technology treats it as decoration beside its text. An icon that carries meaning on its own takes `aria-hidden={false}` and an `aria-label`.

```tsx
<Icon value={link.icon} aria-hidden={false} aria-label="Opens in a new tab" />
```

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
  "name": "house",
  "node": "[[\"path\",{\"d\":\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"}],[\"path\",{\"d\":\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"}]]"
}
```

| Field   | Type     | Purpose                                                                               |
| ------- | -------- | ------------------------------------------------------------------------------------- |
| `_type` | `string` | Always `icon`.                                                                        |
| `name`  | `string` | The icon's name in the Lucide release it was chosen from.                             |
| `node`  | `string` | The shapes inside the icon's `svg` element, as JSON. Written when the icon is chosen. |

Both fields are written together, which is what lets an icon render without a library. A stored icon with a name but no drawing fails validation with a prompt to select it again, so a document cannot be published with an icon that renders as nothing.

<br />

### API

| Export                     | Import from                           | Purpose                                  |
| -------------------------- | ------------------------------------- | ---------------------------------------- |
| `iconPlugin(config?)`      | `@driftime/sanity-plugin-icon`        | Registers the `icon` type.               |
| `createIconPreview(value)` | `@driftime/sanity-plugin-icon`        | Builds preview media from a stored icon. |
| `Icon`                     | `@driftime/sanity-plugin-icon/render` | Draws a stored icon.                     |

<br />

### Types

| Type                   | Import from                           | Purpose                                                          |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `SanityIconConfig`     | `@driftime/sanity-plugin-icon`        | Everything `iconPlugin` accepts.                                 |
| `SanityIconOptions`    | `@driftime/sanity-plugin-icon`        | The `options` an icon field accepts.                             |
| `SanityIconDefinition` | `@driftime/sanity-plugin-icon`        | A field or array member of type `icon`.                          |
| `SanityIconName`       | `@driftime/sanity-plugin-icon`        | The name of an icon in the installed Lucide release.             |
| `SanityIconProps`      | `@driftime/sanity-plugin-icon/render` | Everything `Icon` accepts: an `svg` element's props and `value`. |
| `SanityIcon`           | `@driftime/sanity-plugin-icon/render` | A stored icon, with its name and its drawing.                    |

<br />

## License

MIT © [Driftime®](https://driftime.com). See [LICENSE](https://github.com/driftime/sanity-plugins/blob/main/LICENSE).

<br />

## Acknowledgements

Icons are from [Lucide](https://lucide.dev), distributed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE). Icons for the Studio's own controls come from `@sanity/icons`, so they match the rest of the Studio.

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
