# Icon Guidelines

The rules every package follows are in the root `CLAUDE.md`. This file holds only what applies to Icon.

## Environment

**Dependencies.** In addition to the shared rule: the icon data takes a range spanning its major version, because Lucide releases every day or two, and pinning it would mean either a release of this plugin for every Lucide release or a permanently outdated library. The resolved version doesn't affect stored icons: each one carries its own drawing, so the version only decides what can be picked, and unrecognised entries are skipped rather than drawn.

## Structure

**Studio and website parity.** Anything drawn or resolved on both sides comes from one shared function or component, never a second implementation. Here that's the drawing: the picker's cells, the field's button, the preview media, and the component a consumer renders all pass their shapes to it.

**The picker's grid is hand-built on purpose.** `sanity` exports `CommandList`, its own virtualised, keyboard-navigable list, but it's the wrong shape here. Its navigation is one-dimensional, so an eight-column grid would have to be fed to it as rows, leaving its active index, focus ring, and listbox semantics describing rows instead of icons. It's also `@internal`, unlike `FormField`, which Sanity documents for custom inputs. Only a window of cells is mounted, so each cell states its own position in the library.

## Code

**Styling.** In addition to the shared rule: components that reach a consumer's site have no styling of their own and accept whatever the consumer passes.

## React

**The render path opts out.** Everything reachable from `render.ts` carries `"use no memo"`, because the compiler makes a component call its memo cache hook, and consumers render these components inside server components, where hooks can't run. Without it, a static render fails on an undefined React dispatcher, and only at prerender time.

## Known Non-Fixes

**The library is held in a module-level variable.** The shared request sits in module scope while `package.json` declares `"sideEffects": false`. That looks like a contradiction but isn't: nothing is written at import time, so a bundler dropping the module loses nothing. The alternative, a context around every field, would cost a request per Studio instead of one per session.
