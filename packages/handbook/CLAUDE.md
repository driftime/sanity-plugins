# Handbook Guidelines

The rules every package follows live in the root `CLAUDE.md`; this file holds only what is true of Handbook alone.

## Structure

**Editor and viewer parity.** Anything drawn both in the Studio's preview of a block and in the tool's viewer comes from one shared component, never its own second implementation.

## Known Non-Fixes

**The window height read during render.** The pane header falls back to the window's own height until the pane is measured. The value is only ever a first-paint estimate, replaced on the next render, and deferring it to an effect would trade a correct first paint for a visible jump.

**Module-level mutable state.** The configured editors sit in a module-level variable, oddly beside `"sideEffects": false`. It stays because the value is written once as the plugin is defined and only read afterwards, and because every reader also takes the list explicitly, as a Studio with several workspaces requires.
