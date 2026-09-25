# Handbook Guidelines

The rules every package follows are in the root `CLAUDE.md`. This file holds only what applies to Handbook.

## Structure

**Editor and viewer parity.** Anything drawn both in the Studio's block preview and in the tool's viewer comes from one shared component, never a second implementation.

## Known Non-Fixes

**Reading the window height during render.** The pane header uses the window's height until the pane is measured. It's only a first-paint estimate, replaced on the next render, and moving it to an effect would swap a correct first paint for a visible jump.

**Module-level mutable state.** The configured editors are kept in a module-level variable, despite `"sideEffects": false`. It stays because the value is written once when the plugin is defined and only read after that, and every reader also accepts the list explicitly, which a Studio with several workspaces needs.
