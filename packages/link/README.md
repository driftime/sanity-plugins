<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-light.svg" alt="Link plugin logo" width="48" />
  </picture>
  <h1>Link</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Links for Sanity Studio, covering every destination and resolved from routes declared once.</p>
  <p>
    <a href="https://www.npmjs.com/package/@driftime/sanity-plugin-link"><img src="https://img.shields.io/npm/v/@driftime/sanity-plugin-link?style=flat-square&labelColor=1a1a1a&color=666666" alt="npm version" /></a>
    <a href="https://github.com/driftime/sanity-plugins/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@driftime/sanity-plugin-link?style=flat-square&labelColor=1a1a1a&color=666666" alt="License: MIT" /></a>
  </p>
</div>

<br />

## Overview

Every link on a site is a small decision about where a visitor goes next. Link gives authors one field for all of those decisions, in the document form and inside rich text, and gives developers one type in the schema and one function on the site.

Links to pages are stored as references, so they follow a page through every rename and move. The site's routes are declared once, with type checking, and from them the plugin derives the query that fetches each link and the `href` that renders it. A resolved link also knows whether it is external, whether it should open in a new tab, and whether it points at the current page, so navigation states and anchor attributes are already answered.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-dialog-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-dialog-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-dialog-light.png" alt="The link dialog in Sanity Studio on the Page tab, with tabs for each destination, a selected page, an anchor, two search parameters, and a label" />
  </picture>
  <p align="center"><sub><em>The link dialog on the Page tab, with a referenced page, an anchor, search parameters, and a label.</em></sub></p>
</figure>

<br />

## Installation

Link is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 22.12 or later is required.

```bash
bun add -E @driftime/sanity-plugin-link
```

<br />

## Studio

In the Studio, the plugin registers a `link` type and a Portable Text annotation, and takes the document types a page link can reference.

<br />

### Registering the Plugin

The plugin needs to know which document types are pages a link can point at. Register it with those types, and they are the only ones the reference browser offers.

```typescript
import { defineConfig } from "sanity";
import { linkPlugin } from "@driftime/sanity-plugin-link";

export default defineConfig({
  // ...
  plugins: [
    // ...
    linkPlugin({ documentTypes: ["home", "page", "post"] }),
  ],
});
```

| Option          | Type                      | Default       | Purpose                                                                                                  |
| --------------- | ------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `documentTypes` | `string[]`                | required      | Document types a page link can reference, in the order listed.                                           |
| `destinations`  | `SanityLinkDestination[]` | all           | Destinations every link field offers. See [Restricting the Destinations](#restricting-the-destinations). |
| `title`         | `SanityLinkTitleField`    | reads `title` | Where a page's title is read from, for previews and as the label when none is written.                   |

<br />

### Adding a Link Field

A field of type `link` is defined like any other.

```typescript
defineField({
  name: "link",
  type: "link",
  description: "Where the button takes the visitor.",
});
```

| Option         | Type                      | Default           | Purpose                                                                                            |
| -------------- | ------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `destinations` | `SanityLinkDestination[]` | the plugin's list | Destinations this field offers. See [Restricting the Destinations](#restricting-the-destinations). |

As an array member it becomes a list of links, for example a navigation menu or a footer.

```typescript
defineField({
  name: "menu",
  type: "array",
  of: [defineArrayMember({ type: "link" })],
});
```

The type name is always `link`, so a Studio that already has a type by that name needs to rename it before installing.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-fields-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-fields-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/link-fields-light.png" alt="Five link fields in a Sanity Studio document, each showing its destination's icon, label, and target" />
  </picture>
  <p align="center"><sub><em>Closed link fields in a document, each showing its destination and label.</em></sub></p>
</figure>

<br />

### Restricting the Destinations

A link field offers every destination unless restricted. Some fields are better with fewer, for example a contact link that should only ever be an email address or a phone number.

To set the default for every field, pass `destinations` to the plugin.

```typescript
linkPlugin({
  documentTypes: ["home", "page", "post"],
  destinations: ["page", "anchor", "url", "email"],
});
```

To set it for one field, pass `destinations` in the field's `options`.

```typescript
defineField({
  name: "contact",
  type: "link",
  description: "How a visitor gets in touch.",
  options: { destinations: ["email", "phone"] },
});
```

A field's list **replaces** the plugin's list, so a field can offer any destination regardless of the plugin default. Destinations appear in the order listed. Restricting a field later is safe, because a link stored with a destination the field no longer offers still resolves.

<br />

### Links in Portable Text

Links inside body text deserve the same destinations as links anywhere else. `linkAnnotation` is a Portable Text annotation that opens the same dialog, with the highlighted text as the label. Add it to a block's `marks.annotations`.

```typescript
import { linkAnnotation } from "@driftime/sanity-plugin-link";

defineField({
  name: "body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      marks: { annotations: [linkAnnotation] },
    }),
  ],
});
```

`PortableTextLinkPlugins` makes pasting write `linkAnnotation`. Links in pasted formatted text, for example from a web page or a document, are kept, and a URL pasted over highlighted text turns that text into a link. Pass it to the array's `components.portableText.plugins`.

```typescript
import { linkAnnotation, PortableTextLinkPlugins } from "@driftime/sanity-plugin-link";

defineField({
  name: "body",
  type: "array",
  components: { portableText: { plugins: PortableTextLinkPlugins } },
  of: [
    defineArrayMember({
      type: "block",
      marks: { annotations: [linkAnnotation] },
    }),
  ],
});
```

<br />

## Site

On the site, a link configuration declares the site's routes, GROQ fragments derived from those routes go into the site's queries, and `resolveLink` and `resolveRoute` turn what those queries fetch into anchors and paths. Each is covered in its own section.

Everything for the site is imported from `@driftime/sanity-plugin-link/render`. That path carries no Studio code, so it is safe in server components and anywhere else on the site.

<br />

### Creating the Link Configuration

The configuration is created once, in a file the rest of the site imports from, and holds the site's URL structure.

```typescript
// config/links.ts
import { defineLinkConfig } from "@driftime/sanity-plugin-link/render";

export const { resolveLink, resolveRoute, routes, linkFragment, routeParamsFragment } = defineLinkConfig({
  baseUrl: "https://acme.com",
  routes: {
    home: { path: "/" },
    page: { path: "/[slug]", params: { slug: "slug.current" } },
    post: { path: "/blog/[slug]", params: { slug: "slug.current" } },
  },
});
```

| Option                 | Type                    | Default       | Purpose                                                                          |
| ---------------------- | ----------------------- | ------------- | -------------------------------------------------------------------------------- |
| `baseUrl`              | `string`                | required      | The site's origin, including the protocol.                                       |
| `routes`               | `SanityLinkRoutes`      | none          | A path pattern and its parameters for each document type.                        |
| `resolvers`            | `SanityLinkResolvers`   | none          | A function per destination that adjusts its `href`. See [Resolvers](#resolvers). |
| `openExternalInNewTab` | `boolean`               | `true`        | Whether external links open in a new tab. See [External Links](#external-links). |
| `title`                | `SanityLinkTitleConfig` | reads `title` | Where a page's title is read from. See [Page Titles](#page-titles).              |

`baseUrl` is the site's origin. It decides what counts as external, and a URL an author enters at that origin is treated as internal and becomes a relative path.

`routes` maps each document type to the path the site renders it at. A `[name]` in a path is a parameter, and `params` gives a GROQ expression that fills it. Every type in `documentTypes` needs a route.

`defineLinkConfig` returns five values, all derived from the routes.

| Value                 | Type                                | Purpose                                                                                                                              |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `resolveLink`         | `(props) => SanityLinkResolution`   | Resolves a stored link when rendering. See [Rendering Links](#rendering-links).                                                      |
| `resolveRoute`        | `(document) => string \| undefined` | Resolves a document to its path, for canonical URLs, sitemaps, and the Presentation Tool. See [Resolving Routes](#resolving-routes). |
| `routes`              | `SanityLinkRoutes`                  | The routes passed in, typed.                                                                                                         |
| `linkFragment`        | `string`                            | GROQ for link projections. See [Link Projections](#link-projections).                                                                |
| `routeParamsFragment` | `string`                            | GROQ for queries of documents passed to `resolveRoute`. See [Document Projections](#document-projections).                           |

#### Route Parameters

A parameter is any GROQ expression, evaluated against the document, so a path can be built from whatever the document knows. It can be a field, such as `slug.current`, a field on a referenced document, such as `category->slug.current`, or a computed value, such as `string::split(publishedAt, "-")[0]`.

```typescript
defineLinkConfig({
  // ...
  routes: {
    post: {
      path: "/blog/[year]/[slug]",
      params: { year: `string::split(publishedAt, "-")[0]`, slug: "slug.current" },
    },
    service: {
      path: "/[category]/[slug]",
      params: { category: "category->slug.current", slug: "slug.current" },
    },
  },
});
```

Every `[name]` in a path must have a key in `params`, and `params` can't have a key the path lacks. Either mismatch is a compile error, caught long before a broken link reaches a visitor.

<br />

### Querying

#### Link Projections

A page link is a reference until a query follows it. Add `linkFragment` to the projection of **every** link field and link annotation, after the `...`, and the query fetches exactly what resolving needs.

```typescript
import { linkFragment } from "@/config/links";

export const buttonFragment = `{ ..., link { ..., ${linkFragment} } }`;

export const bodyFragment = `body[] { ..., markDefs[] { ..., ${linkFragment} } }`;

export const homeQuery = `*[_type == "home"][0] {
  ...,
  cta ${buttonFragment},
  ${bodyFragment}
}`;
```

The fragment expands a page link's reference into the document's `_type`, title, and each parameter in its route, and expands a file link's asset into its URL. Because it is built from the routes, adding a route or a parameter changes what every query fetches without a single query being edited.

#### Document Projections

Add `routeParamsFragment` to the projection of any query whose documents are passed to `resolveRoute`. It computes each parameter in the document's route.

```typescript
import { routeParamsFragment } from "@/config/links";

export const pageQuery = `*[_type == "page" && slug.current == $slug][0] { ..., ${routeParamsFragment} }`;
```

<br />

### Rendering Links

`resolveLink` returns the `href`, the label, and the flags an anchor is built from. The markup stays with the site.

```tsx
import { resolveLink } from "@/config/links";
import type { SanityLink } from "@driftime/sanity-plugin-link/render";

interface LinkProps {
  link: SanityLink;
}

export function Link({ link }: LinkProps) {
  const { resolvedLink, opensNewTab } = resolveLink({ link });

  return (
    <a href={resolvedLink?.href} target={opensNewTab ? "_blank" : undefined}>
      {resolvedLink?.label}
    </a>
  );
}
```

#### Inputs

`resolveLink` takes one source and, for navigation, the current pathname.

| Input      | Type                   | Purpose                                                                                                      |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `link`     | `SanityLink`           | A stored link, fetched with `linkFragment` in its projection.                                                |
| `route`    | `SanityLinkRouteInput` | A link declared in code, as a document type and its parameters. Typed from the routes.                       |
| `href`     | `string`               | A plain `href`, for links that come from configuration rather than content.                                  |
| `pathname` | `string`               | The current path, needed only for the active-path values. In Next.js, `usePathname()` in a client component. |

```typescript
// A link the author chose
resolveLink({ link: page.cta });

// A navigation item, with the current path for its active state
resolveLink({ link: item.link, pathname });

// A link to a known document, for example a "Read the announcement" button
resolveLink({ route: { _type: "post", slug: "launch" } });

// A link to a page with no parameters
resolveLink({ route: { _type: "home" } });

// A link from configuration
resolveLink({ href: "https://github.com/driftime" });
```

All three sources return the same shape, so one component renders every link on the site. When the source is missing or can't be resolved, `resolvedLink` is `undefined` and every flag is `false`, so an empty field renders safely without a check in front of it.

#### Output

| Value                | Type                 | Purpose                                                               |
| -------------------- | -------------------- | --------------------------------------------------------------------- |
| `resolvedLink`       | `SanityResolvedLink` | The `href`, `label`, and `download` for the anchor, or `undefined`.   |
| `isExternal`         | `boolean`            | Whether the `href` has a different origin from `baseUrl`.             |
| `opensNewTab`        | `boolean`            | Whether to set `target="_blank"`.                                     |
| `hasAnchor`          | `boolean`            | Whether the `href` has a fragment.                                    |
| `containsActivePath` | `boolean`            | Whether the current pathname is the link's path or a path beneath it. |
| `isActivePath`       | `boolean`            | Whether the current pathname is exactly the link's path.              |

`label` is the author's label, or the page's title for a page link with none. A `route` or `href` has no label. `download` is `true` for file links, and a page link's `href` includes the author's anchor and search parameters.

`containsActivePath` is for navigation items that stay active on child pages, and `isActivePath` is for the exact page only. Reading either without a `pathname` throws in development, so a navigation component that forgot to pass one fails at once instead of rendering nothing as active. In production the read returns `false`. `/` matches only itself, and a link with a fragment is never active.

```tsx
interface NavigationLinkProps extends LinkProps {
  pathname: string;
  children?: React.ReactNode;
}

export function NavigationLink({ link, pathname, children }: NavigationLinkProps) {
  const { resolvedLink, opensNewTab, isActivePath } = resolveLink({ link, pathname });
  if (!resolvedLink?.href) return children;

  return (
    <a
      href={resolvedLink.href}
      target={opensNewTab ? "_blank" : undefined}
      download={resolvedLink.download}
      aria-current={isActivePath ? "page" : undefined}
    >
      {children ?? resolvedLink.label}
    </a>
  );
}
```

<br />

### Resolving Routes

Some documents are fetched directly rather than through a link, and still need their own URL, for a canonical link, a sitemap, or the Presentation Tool. `resolveRoute` returns the path for a document fetched with `routeParamsFragment` in its projection.

```typescript
import { resolveRoute } from "@/config/links";

export async function generateMetadata({ params }) {
  const page = await client.fetch(pageQuery, params);
  return { alternates: { canonical: resolveRoute(page) } };
}
```

It also takes a route declared in code, typed from the routes.

```typescript
resolveRoute({ _type: "post", slug: "launch" });
```

When a link or route resolves to `undefined`, a message in development says exactly why: an unexpanded reference, a type with no route, a parameter with no value, or a stored destination the plugin does not recognize.

<br />

### Options

#### External Links

External links open in a new tab by default, and downloads **never** do. Set `openExternalInNewTab` to `false` to keep every link in the same tab.

```typescript
defineLinkConfig({
  // ...
  openExternalInNewTab: false,
});
```

#### Page Titles

A page link with no label falls back to the referenced document's title, read from `title`. When documents keep their title under another name, set `title.field` here and on the plugin, and the fragment, the label, and the Studio's previews all follow it.

```typescript
defineLinkConfig({
  // ...
  title: { field: "name" },
});
```

When the title needs composing rather than reading, add a `resolver`. It receives the fetched document and returns the label.

```typescript
defineLinkConfig({
  // ...
  title: { field: "name", resolver: (document) => `${document.name} | Acme Inc.` },
});
```

#### Resolvers

Occasionally an `href` needs something only the site can supply, for example a signed URL for files or a referral parameter on external links. A resolver is a function for one destination that receives the `href` the plugin built and returns the one to use.

```typescript
defineLinkConfig({
  // ...
  resolvers: {
    file: (href, link) => signUrl(link.file?.asset),
    url: (href) => `${href}?ref=acme`,
  },
});
```

The second argument is the stored link, narrowed to the destination, so `link.file` is typed in `file` and `link.reference` in `page`. Return `undefined` to produce no link. For page links, the author's anchor and search parameters are appended after the resolver runs. Resolvers run for **stored links only**, so a `route` or `href` passed in code is returned as is.

A resolver can be `async`. If any resolver returns a promise, `resolveLink` returns a promise for every link, and its return type says so, so rendering code is written one way rather than two.

```typescript
defineLinkConfig({
  // ...
  resolvers: {
    file: async (href, link) => await signUrl(link.file?.asset),
  },
});

const { resolvedLink } = await resolveLink({ link });
```

<br />

## Reference

The rest of this document covers the shape of a stored link and everything the package exports.

<br />

### Stored Links

`SanityLink` is the type of a stored link. It is a discriminated union on `type`, so narrowing on `type` reveals that destination's fields. Pass a document type as a type parameter to type a page link's reference.

```typescript
import type { SanityLink } from "@driftime/sanity-plugin-link/render";

export interface SanityButton {
  link?: SanityLink<SanityPage>;
}
```

```json
{
  "_type": "link",
  "type": "page",
  "reference": { "_type": "reference", "_ref": "a1b2c3d4" },
  "anchor": "our-values",
  "searchParams": [{ "_type": "linkSearchParam", "_key": "f3a1", "key": "utm_source", "value": "newsletter" }],
  "label": "How Acme Inc. works"
}
```

| Field          | Type                      | Destination | Purpose                                                                       |
| -------------- | ------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `_type`        | `string`                  | all         | `link` for a field, `linkMark` for a Portable Text annotation.                |
| `type`         | `SanityLinkDestination`   | all         | The destination. Narrows the union.                                           |
| `label`        | `string`                  | all         | The link text. Optional on a page link, which falls back to the page's title. |
| `reference`    | `SanityLinkReference`     | `page`      | The referenced document. Expanded by `linkFragment`.                          |
| `anchor`       | `string`                  | `page`      | An optional fragment, appended to the resolved path.                          |
| `searchParams` | `SanityLinkSearchParam[]` | `page`      | Optional query string entries, appended to the resolved path.                 |
| `anchor`       | `string`                  | `anchor`    | A fragment on the current page. Resolves to `#` and the fragment.             |
| `url`          | `string`                  | `url`       | An absolute URL. Resolves as written, or to a relative path at `baseUrl`.     |
| `email`        | `string`                  | `email`     | An email address. Resolves to `mailto:`.                                      |
| `subject`      | `string`                  | `email`     | An optional subject line, appended as `?subject=`.                            |
| `phone`        | `string`                  | `phone`     | A phone number. Resolves to `tel:` with spaces removed.                       |
| `file`         | `SanityLinkFile`          | `file`      | A file asset. Resolves to the asset URL with `download` set.                  |

<br />

### API

| Export                     | Import from                           | Purpose                                                     |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `linkPlugin(config)`       | `@driftime/sanity-plugin-link`        | Registers the `link` type.                                  |
| `linkAnnotation`           | `@driftime/sanity-plugin-link`        | A Portable Text annotation with the link dialog.            |
| `PortableTextLinkPlugins`  | `@driftime/sanity-plugin-link`        | Makes pasted links write `linkAnnotation`.                  |
| `defineLinkConfig(config)` | `@driftime/sanity-plugin-link/render` | Takes the routes and returns the site's functions and GROQ. |

<br />

### Types

| Type                        | Import from                           | Purpose                                                       |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| `SanityLinkConfig`          | `@driftime/sanity-plugin-link`        | Everything `linkPlugin` accepts.                              |
| `SanityLinkOptions`         | `@driftime/sanity-plugin-link`        | The `options` a link field accepts.                           |
| `SanityLinkDefinition`      | `@driftime/sanity-plugin-link`        | A field or array member of type `link`.                       |
| `SanityLinkTitleField`      | `@driftime/sanity-plugin-link`        | The plugin's `title` option.                                  |
| `SanityLinkResolverConfig`  | `@driftime/sanity-plugin-link/render` | Everything `defineLinkConfig` accepts.                        |
| `SanityLinkTitleConfig`     | `@driftime/sanity-plugin-link/render` | The configuration's `title` option.                           |
| `SanityLinkRoutes`          | `@driftime/sanity-plugin-link/render` | The `routes` option.                                          |
| `SanityLinkRouteDefinition` | `@driftime/sanity-plugin-link/render` | One route, a path pattern and its parameters.                 |
| `SanityLinkRouteInput`      | `@driftime/sanity-plugin-link/render` | A route declared in code, with its parameters.                |
| `SanityLinkResolvers`       | `@driftime/sanity-plugin-link/render` | The `resolvers` option.                                       |
| `SanityResolveLinkProps`    | `@driftime/sanity-plugin-link/render` | Everything `resolveLink` accepts.                             |
| `SanityLinkState`           | `@driftime/sanity-plugin-link/render` | Everything `resolveLink` returns.                             |
| `SanityResolvedLink`        | `@driftime/sanity-plugin-link/render` | The `href`, `label`, and `download` for an anchor.            |
| `SanityLinkResolution`      | `@driftime/sanity-plugin-link/render` | `SanityLinkState`, or a promise of it if a resolver is async. |
| `SanityLink`                | `@driftime/sanity-plugin-link/render` | Any stored link, narrowed by `type`.                          |
| `SanityPageLink`            | `@driftime/sanity-plugin-link/render` | A link to a page.                                             |
| `SanityAnchorLink`          | `@driftime/sanity-plugin-link/render` | A link to an anchor on the current page.                      |
| `SanityUrlLink`             | `@driftime/sanity-plugin-link/render` | A link to a URL.                                              |
| `SanityEmailLink`           | `@driftime/sanity-plugin-link/render` | A link to an email address.                                   |
| `SanityPhoneLink`           | `@driftime/sanity-plugin-link/render` | A link to a phone number.                                     |
| `SanityFileLink`            | `@driftime/sanity-plugin-link/render` | A link to a file.                                             |
| `SanityLinkDestination`     | `@driftime/sanity-plugin-link/render` | The destination names.                                        |
| `SanityLinkReference`       | `@driftime/sanity-plugin-link/render` | A reference to a document, before a query expands it.         |
| `SanityLinkDocument`        | `@driftime/sanity-plugin-link/render` | The document a page link references.                          |
| `SanityLinkRouteParams`     | `@driftime/sanity-plugin-link/render` | The route parameters a query adds to a document.              |
| `SanityLinkSearchParam`     | `@driftime/sanity-plugin-link/render` | One search parameter on a page link.                          |
| `SanityLinkFile`            | `@driftime/sanity-plugin-link/render` | The file field of a file link.                                |
| `SanityLinkFileAsset`       | `@driftime/sanity-plugin-link/render` | The asset behind a file link.                                 |

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
