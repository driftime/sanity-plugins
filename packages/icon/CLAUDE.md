# Icon Guidelines

The rules every package follows live in the root `CLAUDE.md`; this file holds only what is true of Icon alone.

## Environment

**Dependencies.** In addition to the shared rule: the icon library data takes a range spanning its major, because Lucide ships every day or two and pinning it would mean either a release of this plugin per release of theirs or a permanently stale library. Nothing depends on which version resolves: a stored icon carries its own drawing, so the version only decides what is pickable, and an unrecognised entry is skipped rather than drawn.

## Structure

**Studio and website parity.** Anything drawn or resolved on both sides comes from one shared function or component, never its own second implementation. Here that one thing is the drawing: the picker's cells, the button standing in for the field, the preview media and the component a consumer renders all hand their shapes to it.

**The picker's grid is hand-rolled deliberately.** `sanity` exports `CommandList`, its own virtualised keyboard-navigable list, and it is the wrong shape here: its navigation is one-dimensional, so a grid of eight columns would have to be fed to it as rows, leaving its active index, focus ring and listbox semantics describing rows rather than icons. It is also `@internal`, unlike `FormField`, which Sanity documents for custom inputs. Only a window of cells is mounted, so each one states its own place in the library.

## Code

**Styling.** In addition to the shared rule: components reaching a consumer's site carry no styling of their own and accept whatever the consumer passes.

## React

**The render path opts out.** Anything reachable from `render.ts` carries `"use no memo"`, because the compiler rewrites a component to call its memo cache hook and a consumer draws these inside a server component, where no hook can run. Without it a static render fails on an undefined React dispatcher, and only at prerender time.

## Known Non-Fixes

**The library is held in a module-level variable.** The shared request sits in module scope while `package.json` declares `"sideEffects": false`, which reads like a contradiction and is not one: nothing is written at import time, so a bundler dropping the module drops nothing that had run. The alternative, a context wrapped around every field, would cost a request per Studio rather than per session.
