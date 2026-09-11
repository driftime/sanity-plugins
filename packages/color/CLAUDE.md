# Color Guidelines

The rules every package follows live in the root `CLAUDE.md`; this file holds only what is true of Color alone.

## Environment

**Dependencies.** In addition to the shared rule: colour conversion and contrast measurement are written here rather than taken from a colour library, because the arithmetic is small, fixed by published formulae, and needed on the render path where a dependency would cost a consumer more than the code does.

## Structure

**Studio and website parity.** Anything drawn or resolved on both sides comes from one shared function or component, never its own second implementation. Here that one thing is the resolver: a stored colour becomes a painted colour through the function `render.ts` exports, and the Studio's picker and preview call it rather than restating how a name, a swatch, or a custom value turns into something to paint.

**The colour maths stands alone.** Conversion and contrast measurement live in `lib/` knowing nothing about Sanity, React, or the palette. They take colours and return numbers. This is what lets the picker offering a colour and the rule judging it reach the same verdict about the same pairing, which is the whole point of the plugin.

**One palette, two readers.** The palette a consumer configures is read by the picker that offers it and the validator that measures it. Where those could disagree, they are wrong — a colour must not validate as one value and paint as another. Derive both from the configuration rather than restating it.

**Colours are stored by name.** A palette colour is stored as the name it was chosen by, never as the value that name resolved to, so it keeps retoning with the active colour scheme. Only a colour with no name of its own — a custom value or an image swatch — carries anything resembling a value. Resist the temptation to denormalise here; it is the opposite of what a colour needs.

## Code

**Abstraction.** In addition to the shared rule: the coefficients in a colour space conversion are the exception that earns its comment rather than its name.

**Styling.** In addition to the shared rule: what the plugin hands a consumer's site is colour values in several formats, never styles or class names — how a colour is applied is the site's decision.

## Sanity

**Data strings.** In addition to the shared rule: every stored colour is parsed, so every colour read is a stega clean.

## Accessibility

**Contrast is the product.** The plugin exists to stop unreadable pairings reaching a page, so the measurement is load-bearing rather than advisory. Validation rejects only what no reader could make out at any size, because a rule that blocks publishing on a merely-poor pairing gets worked around; everything above that floor is reported to the author and left to their judgement.

**Report in the standard's terms.** A ratio on its own tells an author nothing. Say what it passes, what it fails, and at what size, naming the version of the standard being applied.
