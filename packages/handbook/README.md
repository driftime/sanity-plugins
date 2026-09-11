<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-light.svg" alt="Handbook plugin logo" width="48" />
  </picture>
  <h1>Handbook</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Schema-driven documentation and editorial guides, built right into Sanity Studio.</p>
  <p>
    <a href="https://www.npmjs.com/package/@driftime/sanity-plugin-handbook"><img src="https://img.shields.io/npm/v/@driftime/sanity-plugin-handbook?style=flat-square&labelColor=1a1a1a&color=666666" alt="npm version" /></a>
    <a href="https://github.com/driftime/sanity-plugins/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@driftime/sanity-plugin-handbook?style=flat-square&labelColor=1a1a1a&color=666666" alt="License: MIT" /></a>
  </p>
</div>

<br />

## Overview

Every content model comes with knowledge the schema alone cannot hold: what a field is for, which values work best, and how the team writes. Handbook gives that knowledge a place in the Studio, as a tool in the navigation, so an author reaches the guidance beside the content it describes.

The first part of the Handbook is generated from the schema. Every document type is listed with its fields, and each field shows its type, its description, an example value, and any tips or cautions written alongside its definition, so the documentation stays in step with the editor it describes. The second part is written by the team. Guides are Portable Text documents for house style, editorial process, and anything too long for a field description, arranged into groups in the same sidebar.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-how-to-use-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-how-to-use-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-how-to-use-light.png" alt="The Handbook tool in Sanity Studio: a sidebar listing introductory pages, document types grouped by role, and the team's own guides, with the How to use the Handbook page open" />
  </picture>
  <p align="center"><sub><em>The Handbook tool, with introductory pages, document types by role, and the team's guides in one sidebar.</em></sub></p>
</figure>

<br />

## Installation

Handbook is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 22.12 or later is required.

```bash
bun add -E @driftime/sanity-plugin-handbook
```

<br />

## Documentation

In the Studio, the plugin registers a Handbook tool, takes the document types it documents grouped by the role each plays in the content model, and reads a `handbook` property it adds to field and document definitions.

<br />

### Registering the Plugin

The plugin needs to know which document types to document and how to group them. Register it with a list of roles, each holding the document definitions that play that part in the content model, and each role becomes a section of the sidebar in the order listed.

```typescript
import { defineConfig } from "sanity";
import { handbookPlugin } from "@driftime/sanity-plugin-handbook";

import { home, navigation, page, settings, templates } from "@/schemas";

export default defineConfig({
  // ...
  plugins: [
    // ...
    handbookPlugin({
      roles: [
        {
          title: "Singletons",
          description: "Document types that exist as a single instance.",
          documents: [home],
        },
        {
          title: "Collections",
          description: "Document types with multiple entries.",
          documents: [page],
        },
        {
          title: "Globals",
          description: "Document types shared across the site.",
          documents: [navigation, templates, settings],
        },
      ],
    }),
  ],
});
```

| Option                     | Type                              | Default                  | Purpose                                                                                            |
| -------------------------- | --------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `title`                    | `string`                          | `"Handbook"`             | The tool's name in the Studio navigation. See [Naming the Tool](#naming-the-tool).                 |
| `sidebarTitle`             | `string`                          | `"Handbook"`             | The heading at the top of the sidebar. See [Naming the Tool](#naming-the-tool).                    |
| `roles`                    | `SanityHandbookDocumentRole[]`    | required                 | The document types to document, grouped by role, in the order listed.                              |
| `blocks`                   | `SanityHandbookBlockDefinition[]` | none                     | Blocks added to guide bodies. See [Adding Custom Blocks](#adding-custom-blocks).                   |
| `editors`                  | `string[]`                        | everyone                 | Email addresses of the people who write guides. See [Choosing the Editors](#choosing-the-editors). |
| `undocumentedFieldMessage` | `string`                          | a prompt to ask the team | Shown for a field with no description. See [Documenting Fields](#documenting-fields).              |

A role takes a `title`, an optional `description` shown on the Document Types overview, and the `documents` that fill it, passed as definitions rather than names. The sidebar opens with a Getting Started section, holding a page on how to use the Handbook and the Document Types overview, followed by a section for each role and then the guides.

The plugin also registers two document types of its own for the guides, `handbook.handbook` and `handbook.guide`, along with an object type for each block a guide can hold, all under the `handbook.` prefix, and the tool itself is named `handbook`. A structure or a query that lists every registered type sees those types too, and a Studio that already has a tool or a type by one of these names needs to rename it before installing.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-document-types-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-document-types-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-document-types-light.png" alt="The Document Types overview in the Handbook tool, listing each role with its description and the document types it contains" />
  </picture>
  <p align="center"><sub><em>The Document Types overview, listing each role with its description and the types it holds.</em></sub></p>
</figure>

<br />

### Documenting Fields

Every field is documented from what the schema already says. Its title comes from `title`, or from its name in Title Case, and its description from `description`, so an existing schema is a usable handbook from the start. The `handbook` property carries the documentation the editor has no room for. The plugin declares it on Sanity's own field and document definitions, so it is typed and completes like any other property.

```typescript
import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  type: "document",
  title: "Pages",
  description: "General-purpose pages.",
  handbook: {
    description:
      "Standalone pages for anything that does not warrant a document type of its own. Each is reached at its own address and assembled from blocks rather than following a fixed layout.",
  },
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Appears in navigation, browser tabs, and search results.",
      handbook: {
        description:
          "The name this document goes by wherever it is referred to rather than read — navigation menus, browser tabs, search results, and the Studio's own lists. Every document needs one, and it stands behind both the slug and the SEO title whenever those are left blank.",
        example: "About Acme Inc.",
        tip: "Keep it short enough to sit comfortably in a navigation menu.",
      },
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Last part of the page's web address.",
      options: { source: "title" },
      handbook: {
        description:
          "The last part of the page's web address. Generate it from the title and then edit it if the result reads awkwardly — shorter is almost always better.",
        example: "about-acme-inc",
        caution: "Changing the slug of a published page breaks every link that already points at it.",
      },
    }),
  ],
});
```

| Key           | Type     | Purpose                                                                     |
| ------------- | -------- | --------------------------------------------------------------------------- |
| `title`       | `string` | Replaces the field or document title in the Handbook.                       |
| `description` | `string` | Replaces the description, shown under the heading.                          |
| `example`     | `string` | An example value, shown in italics beneath the description.                 |
| `tip`         | `string` | Guidance for the author, shown as a hint icon that opens on hover or click. |
| `info`        | `string` | Extra context about how the field is used, shown the same way.              |
| `caution`     | `string` | A warning about constraints or pitfalls, shown the same way.                |

Every key is optional, and so is `handbook` itself. On a document, only `title` and `description` are read. Hints appear beside the field name in the order tip, info, caution, and each popover is labeled with its kind.

A field with neither a `description` nor a `handbook.description` shows a message saying it has not been documented yet. Pass `undocumentedFieldMessage` to the plugin to replace that message for every field.

```typescript
handbookPlugin({
  // ...
  undocumentedFieldMessage: "Not documented yet. Ask in the content channel.",
});
```

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-fields-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-fields-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-fields-light.png" alt="A document type's fields in the Handbook tool, each with its type, description, an example value in italics, and hint icons" />
  </picture>
  <p align="center"><sub><em>A document type's fields, each with its type, description, example, and hints.</em></sub></p>
</figure>

<br />

### Nested Fields

An object or array field has a control beneath its description that counts its subfields and expands to list them, each documented the way a top-level field is. An array with one member type lists that type's fields, and an array with several lists the members themselves. Sanity's own types, such as `image`, `file`, and `slug`, are not expanded, so a custom type built on one of them shows only the fields added to it. A type that contains itself is listed once, with a note referring back to the first occurrence in place of a second expansion.

<br />

### Naming the Tool

The tool is called Handbook in the Studio navigation and at the top of its sidebar. The two names are set separately, so a Studio can rename the tool without changing the sidebar heading, or give each its own wording.

```typescript
handbookPlugin({
  // ...
  title: "Guide",
  sidebarTitle: "Acme Inc. Guide",
});
```

<br />

## Guides

Guides are documents in the dataset, and the plugin registers everything they need, so no schema setup is involved. A `handbook.guide` document holds one guide, and a `handbook.handbook` singleton arranges the guides into groups and sets their order in the sidebar. The tool fetches both and fetches them again whenever either changes, so a published edit appears without a reload. Because there is only ever one singleton, it is never offered in the create menu and cannot be deleted, duplicated, or unpublished.

A guide has a title, an optional description, and a Portable Text body offering:

- Paragraphs, headings, and blockquotes
- Bullet and numbered lists
- Bold, italic, strikethrough, and inline code
- Links, to `http`, `https`, `mailto`, and `tel` addresses
- Images with a caption and alternative text
- Videos with a caption
- Code blocks with syntax highlighting for CSS, GROQ, HTML, JavaScript, JSON, React, Shell, TypeScript, and plain text
- Callouts in tip, information, and warning styles
- Horizontal rules

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-guide-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-guide-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-guide-light.png" alt="A guide open in the Handbook tool, showing a heading, paragraphs, a blockquote, a list, a callout, and an image with a caption" />
  </picture>
  <p align="center"><sub><em>A guide in the tool, with a heading, a blockquote, a list, a callout, and a captioned image.</em></sub></p>
</figure>

<br />

### Adding Guides to the Structure

Guides are read in the Handbook tool and written in the Structure tool, and they appear in the Structure tool only once its resolver adds them. `handbookStructure` returns the two list items for that, an editor for the singleton and a list of the guides. It reads the current user from the Structure context, and returns an empty array for anyone who is not an editor, so the resolver needs both of its arguments.

```typescript
import { handbookStructure } from "@driftime/sanity-plugin-handbook";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (structureBuilder, context) => {
  const { list, documentTypeListItems, divider } = structureBuilder;

  const handbookItems = handbookStructure(structureBuilder, context);

  return list()
    .title("Content")
    .items([
      ...documentTypeListItems().filter(
        (item) => !["handbook.handbook", "handbook.guide"].includes(item.getId() ?? ""),
      ),
      ...(handbookItems.length > 0 ? [divider(), ...handbookItems] : []),
    ]);
};
```

The filter keeps the two Handbook document types out of a list built from every registered type, and the divider is added only when there is something to put beneath it. A Studio running several workspaces with different editors passes the workspace's own list as a third argument, since the plugin otherwise reads the list from whichever workspace was configured last.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-groups-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-groups-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-groups-light.png" alt="The Handbook singleton open in the Structure tool, showing two guide groups with reorder handles and the guides referenced in each" />
  </picture>
  <p align="center"><sub><em>The Handbook singleton in the Structure tool, where groups and their order are arranged.</em></sub></p>
</figure>

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-editor-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-editor-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/handbook-editor-light.png" alt="The Handbook Guides list in the Structure tool beside an open guide, showing its title, description, and rich text editor" />
  </picture>
  <p align="center"><sub><em>The guides list in the Structure tool beside an open guide.</em></sub></p>
</figure>

<br />

### Choosing the Editors

Everyone in the Studio can read the Handbook, and a smaller group usually writes it. The editors are the people who create guides and arrange them into groups on the singleton, and the plugin takes their email addresses.

```typescript
handbookPlugin({
  // ...
  editors: ["editor@acme.com", "lead@acme.com"],
});
```

For an editor, `handbookStructure` returns its items and the create menu offers a new guide. For everyone else, the structure items are empty and both Handbook document types are left out of the create menu. When no list is given, everyone is an editor. The list decides what the Studio shows rather than what the dataset allows, so a project's own roles remain the place where write access is granted or withheld.

The same answer is available to a Studio's own components through `useIsHandbookEditor`, which checks the current user against the plugin's list, or against a list passed to it for a Studio running several workspaces.

```typescript
import { useIsHandbookEditor } from "@driftime/sanity-plugin-handbook";

const isEditor = useIsHandbookEditor();
const isAcmeEditor = useIsHandbookEditor(["editor@acme.com", "lead@acme.com"]);
```

<br />

### Adding Custom Blocks

A guide body can hold custom blocks alongside the built-in ones. Each needs a schema definition for the editor and a component for the tool to render it with, and the component receives the stored block as `value`.

```tsx
import { defineConfig, defineField, defineType } from "sanity";
import type { PortableTextObject } from "sanity";
import { handbookPlugin } from "@driftime/sanity-plugin-handbook";

const shortcutType = defineType({
  name: "handbook.shortcut",
  type: "object",
  title: "Keyboard Shortcut",
  description: "Key combination shown as it appears on the keyboard.",
  fields: [
    defineField({
      name: "keys",
      type: "string",
      description: "Keys to press, separated by plus signs.",
    }),
  ],
  preview: {
    select: { title: "keys" },
  },
});

function ShortcutBlock({ value }: { value: PortableTextObject }) {
  const { keys } = value;

  return <kbd>{typeof keys === "string" && keys}</kbd>;
}

export default defineConfig({
  // ...
  plugins: [
    // ...
    handbookPlugin({
      // ...
      blocks: [{ schema: shortcutType, component: ShortcutBlock }],
    }),
  ],
});
```

The plugin registers the block's schema type itself, so it is not added to the Studio's own `schema.types` as well.

<br />

### Querying

Guides are written and read inside the Studio, and the tool fetches everything it shows, so a site needs no query for the Handbook at all. A site that does want to publish the guides queries the singleton, follows its references, and resolves each image and video block's asset to a URL, which is the shape the exported types describe.

```groq
*[_type == "handbook.handbook"][0] {
  ...,
  groups[] {
    ...,
    guides[] {
      ...,
      ...@-> {
        ...,
        content[] {
          ...,
          _type == "handbook.image" => { ..., "asset": { "url": asset.asset->url } },
          _type == "handbook.video" => { ..., "asset": { "url": asset.asset->url } }
        }
      }
    }
  }
}
```

<br />

## Reference

The rest of this document covers the shape of the stored guides and everything the package exports. Everything is imported from `@driftime/sanity-plugin-handbook`.

<br />

### Stored Guides

`SanityHandbook` is the type of the singleton, and `SanityHandbookGuide` the type of a guide once its reference has been followed.

```typescript
import type { SanityHandbookGuide } from "@driftime/sanity-plugin-handbook";

interface GuidePageProps {
  guide: SanityHandbookGuide;
}
```

```json
{
  "_type": "handbook.handbook",
  "groups": [
    {
      "_key": "a1b2",
      "title": "Content Guidelines",
      "guides": [{ "_key": "c3d4", "_type": "handbook.guide", "title": "Writing for the Web", "content": [] }]
    }
  ]
}
```

| Field         | Type                         | Document            | Purpose                                                              |
| ------------- | ---------------------------- | ------------------- | -------------------------------------------------------------------- |
| `_type`       | `string`                     | both                | `handbook.handbook` for the singleton, `handbook.guide` for a guide. |
| `groups`      | `SanityHandbookGuideGroup[]` | `handbook.handbook` | The groups in sidebar order, each with a `title` and its `guides`.   |
| `title`       | `string`                     | `handbook.guide`    | The guide's title, shown in the sidebar and as its heading.          |
| `description` | `string`                     | `handbook.guide`    | An optional introduction shown beneath the heading.                  |
| `content`     | `PortableTextBlock[]`        | `handbook.guide`    | The body, holding text blocks and the blocks below.                  |

The blocks a body can hold each have a type of their own, and the link annotation is stored in a text block's `markDefs`. A horizontal rule, `handbook.horizontalRule`, carries no fields.

| Field      | Type                           | Block              | Purpose                                                                      |
| ---------- | ------------------------------ | ------------------ | ---------------------------------------------------------------------------- |
| `asset`    | `{ url?: string }`             | `handbook.image`   | The image, once the query resolves its reference to a URL.                   |
| `caption`  | `string`                       | `handbook.image`   | An optional caption shown beneath the image.                                 |
| `alt`      | `string`                       | `handbook.image`   | Optional alternative text for the image.                                     |
| `asset`    | `{ url?: string }`             | `handbook.video`   | The video, once the query resolves its reference to a URL.                   |
| `caption`  | `string`                       | `handbook.video`   | An optional caption shown beneath the video.                                 |
| `code`     | `string`                       | `handbook.code`    | The source code.                                                             |
| `language` | `string`                       | `handbook.code`    | The language it is highlighted as.                                           |
| `variant`  | `SanityHandbookCalloutVariant` | `handbook.callout` | `tip`, `info`, or `warning`.                                                 |
| `body`     | `PortableTextBlock[]`          | `handbook.callout` | The callout's text, with inline formatting and links but no lists or blocks. |
| `href`     | `string`                       | `link`             | The address a run of text links to.                                          |

<br />

### API

| Export                                                   | Purpose                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| `handbookPlugin(config)`                                 | Registers the tool, its document types, and its blocks.        |
| `handbookStructure(structureBuilder, context, editors?)` | Returns Structure items for the singleton and the guides list. |
| `useIsHandbookEditor(editors?)`                          | Whether the current user can edit guides.                      |

<br />

### Types

| Type                            | Purpose                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `SanityHandbookConfig`          | Everything `handbookPlugin` accepts.                            |
| `SanityHandbookMetadata`        | The `handbook` property on field and document definitions.      |
| `SanityHandbookDocumentRole`    | A role, with its title, description, and document definitions.  |
| `SanityHandbookBlockDefinition` | A custom block, as a schema definition paired with a component. |
| `SanityHandbook`                | The singleton document.                                         |
| `SanityHandbookGuideGroup`      | A group in the singleton, with its ordered guides.              |
| `SanityHandbookGuide`           | A guide document, with its title, description, and body.        |
| `SanityHandbookImage`           | An image block.                                                 |
| `SanityHandbookVideo`           | A video block.                                                  |
| `SanityHandbookCode`            | A code block.                                                   |
| `SanityHandbookCallout`         | A callout block.                                                |
| `SanityHandbookCalloutVariant`  | `"tip"`, `"info"`, or `"warning"`.                              |
| `SanityHandbookHorizontalRule`  | A horizontal rule block.                                        |
| `SanityHandbookLink`            | The link annotation.                                            |

<br />

## License

MIT © [Driftime®](https://driftime.com). See [LICENSE](https://github.com/driftime/sanity-plugins/blob/main/LICENSE).

<br />

## Acknowledgements

Icons for the Studio's own controls come from `@sanity/icons`, so they match the rest of the Studio. The plugin's own icons are based on [Lucide](https://lucide.dev), distributed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).

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
