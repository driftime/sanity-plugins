<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/.github/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/.github/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/.github/assets/icon-light.svg" alt="Sanity Plugins logo" width="48" />
  </picture>
  <h1>Sanity Plugins</h1>
  <p><strong>A suite of Sanity Studio plugins by Driftime®</strong></p>
  <p>Native to Sanity Studio in look and behavior, made to enhance the authoring experience.</p>
</div>

<br />

## Overview

These plugins are built as a set. They share their tooling, their conventions, and the code they have in common, so a field from one looks and behaves like a field from another, and setting up the second is no different from setting up the first.

Each is published as its own package, installs on its own, and depends on none of the others.

<br />

## Plugins

### <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-dark.svg" /><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-light.svg" /><img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/handbook/assets/icon-light.svg" alt="" width="24" height="24" align="top" /></picture> Handbook

Schema-driven documentation and editorial guides, built right into Sanity Studio.

[Read the docs](packages/handbook/README.md) · [`@driftime/sanity-plugin-handbook`](https://www.npmjs.com/package/@driftime/sanity-plugin-handbook)

### <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-dark.svg" /><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" /><img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/icon/assets/icon-light.svg" alt="" width="24" height="24" align="top" /></picture> Icon

Lucide icons for Sanity Studio, stored as SVG and rendered without the library.

[Read the docs](packages/icon/README.md) · [`@driftime/sanity-plugin-icon`](https://www.npmjs.com/package/@driftime/sanity-plugin-icon)

### <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-dark.svg" /><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-light.svg" /><img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-light.svg" alt="" width="24" height="24" align="top" /></picture> Color

Background and text colors for Sanity Studio, checked against WCAG as authors pair them.

[Read the docs](packages/color/README.md) · [`@driftime/sanity-plugin-color`](https://www.npmjs.com/package/@driftime/sanity-plugin-color)

### <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-dark.svg" /><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-light.svg" /><img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/link/assets/icon-light.svg" alt="" width="24" height="24" align="top" /></picture> Link

Links for Sanity Studio, covering every destination and resolved from routes declared once.

[Read the docs](packages/link/README.md) · [`@driftime/sanity-plugin-link`](https://www.npmjs.com/package/@driftime/sanity-plugin-link)

<br />

## Installation

Every plugin is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 22.12 or later is required. Each plugin installs as a single package.

```bash
bun add -E @driftime/sanity-plugin-handbook
```

<br />

## Development

The workspace is checked, typechecked, and built from the root.

```bash
bun install
bun run check
bun run typecheck
bun run build
```

`check` verifies formatting and linting across the workspace, `fix` applies both, and `typecheck` and `build` run in each package. Code shared between the plugins lives in `packages/@repo/*`. Those packages are private and never published, and their code is compiled into each plugin at build time, which is what lets a plugin install as one package with no extra dependencies.

Releases use [changesets](https://github.com/changesets/changesets). A change that should ship gets a changeset, written with `bun run changeset`. At release time, `bun run version` bumps the affected packages and writes their changelogs, and `bun run release` builds and publishes them.

A change is tried in a project before publishing through [yalc](https://github.com/wclr/yalc). `bun run push` sends every package's current build to any linked project, and the same script inside one package sends just that one. A package's `bun run dev` rebuilds and pushes on each change.

<br />

## License

MIT © [Driftime®](https://driftime.com). See [LICENSE](./LICENSE).

<br />

<div align="center">
  <p><strong>Built alongside <a href="https://cairn.driftime.com">Cairn</a>, a starting point for responsible web experiences.</strong></p>
  <p><a href="https://github.com/driftime/sanity-plugins/tree/main/packages/handbook#readme">Handbook</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/icon#readme">Icon</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/color#readme">Color</a> · <a href="https://github.com/driftime/sanity-plugins/tree/main/packages/link#readme">Link</a></p>
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
