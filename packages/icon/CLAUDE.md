# Icon Guidelines

The rules every package follows are in the root `CLAUDE.md`. This file holds only what applies to Icon.

## Structure

**Studio and website parity.** Anything drawn or resolved on both sides comes from one shared function or component, never a second implementation. Here that's the drawing: the picker's cells, the field's button, the preview media, and the component a consumer renders all pass their drawing to it.

**The picker's grid is hand-built on purpose.** `sanity` exports `CommandList`, its own virtualised, keyboard-navigable list, but it's the wrong shape here. Its navigation is one-dimensional, so an eight-column grid would have to be fed to it as rows, leaving its active index, focus ring, and listbox semantics describing rows instead of icons. It's also `@internal`, unlike `FormField`, which Sanity documents for custom inputs. Only a window of cells is mounted, so each cell states its own position in the library.

**The build step.** Libraries are converted in Node, inside the bundler that builds the Studio, because each library ships its icons differently and only Node can read them all. It lives in `build/`, and nothing in the Studio or render entries imports it. Vite and Next.js each get an adapter, and both share the rest: detection, conversion, caching, and the registry. Nothing is written to the consumer's project: sets are cached inside `node_modules`, and icon names go into the plugin's own `dist/names.d.ts`, replaced through a temporary file because pnpm shares a package's files between projects.

**The placeholders.** `sets.ts` and `names.ts` are published as their own files, which the bundler replaces with the generated registry and the build step overwrites with the installed names. They're imported by package name and marked `neverBundle`, because pkg-utils otherwise moves them into a shared chunk, where replacing the file changes nothing.

**Entry points.** In addition to the shared rule: `./vite` and `./next` are the build step's adapters, and four more exist only because pkg-utils makes a file from each export and these must be files. `./sets` and `./names` are the placeholders, `./next-loader` is the file bundlers load by path, and `./read-worker` is the worker's script. Shared chunks export under minified names, so neither the loader nor the worker can import from one directly.

**Fresh code in a running bundler.** Node keeps every module it has imported, so a running dev server would otherwise keep old plugin code and old library packages. The loader imports a fresh copy of itself, versioned by a hash of the plugin's files, and runs that copy's build step, which works because shared chunks are named after their contents. Libraries are read in a worker thread, whose module cache starts empty every time. The worker renders with React's production build, which writes the same markup without development warnings.

**Adapters.** Each library has one adapter in `build/adapters/`, which knows its package, its styles, and where its icons and keywords live, and reads them into SVG markup. Everything after that is shared, so adding a library is an adapter, its styles in `lib/libraries.ts`, and nothing else. Central Icon System and Nucleo publish a package per style, so their adapters match a package prefix, and each installed package is a style.

**Detection.** A library is read from one package, and only when the project lists it in its own `package.json`, so a package present only as another's dependency is never used and its version stays the consumer's. Each adapter also matches every other package its library publishes, such as its framework versions, only so the Studio can say which package to add.

## Code

**Styling.** In addition to the shared rule: components that reach a consumer's site have no styling of their own and accept whatever the consumer passes.

**Conversion.** Every icon goes through SVGO's default preset and a single step of our own that reads the result into the stored tree. Four of the preset's plugins are off, `cleanupNumericValues`, `convertPathData`, `convertTransform`, and `mergePaths`, because each rounds or merges shapes and visibly changed real icons when drawn pixel by pixel. Before SVGO, the only corrections are ones a browser makes by specification, such as closing a `url(` left open at the end of a value, never a fix for one library's mistake, which belongs upstream.

**Skipping icons.** An icon is only skipped when it can't be read or isn't safe to store, and the build log names it and gives the reason. Anything SVGO can remove safely, such as scripts and event handlers, is removed instead.

**The stored drawing is checked on both sides.** The same check runs on the build step's output and on every stored value before it's drawn, because anyone who can write to the dataset can change a stored value. It allows every element that draws, paints, clips, masks, or filters, and rejects anything that runs code, embeds content, links away, loads a file, or animates. References must start with `#`, and they don't need to resolve, because every identifier and reference carries a prefix unique to the icon.

## React

**The render path opts out.** Everything reachable from `render.ts` carries `"use no memo"`, because the compiler makes a component call its memo cache hook, and consumers render these components inside server components, where hooks can't run. Without it, a static render fails on an undefined React dispatcher, and only at prerender time.

## Known Non-Fixes

**The library requests are held in a module-level map.** The requests sit in module scope, one per library and style, while `package.json` declares `"sideEffects": false`. That looks like a contradiction but isn't: nothing is written at import time, so a bundler dropping the module loses nothing. The alternative, a context around every field, would cost a request per Studio instead of one per session.

**Libraries' own mistakes.** Nucleo Glass has left every `url(` unclosed since 1.3.0, and earlier releases leave `.js` off their imports. Only the first has a browser rule behind it, so only that one is handled here. A library bug with no such rule is reported to the library, not worked around.
