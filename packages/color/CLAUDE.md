# Color Guidelines

The rules every package follows are in the root `CLAUDE.md`. This file holds only what applies to Color.

## Environment

**Dependencies.** In addition to the shared rule: colour conversion and contrast measurement are written here instead of coming from a colour library, because the maths is small, fixed by published formulas, and needed on the render path, where a dependency would cost a consumer more than the code does.

## Structure

**Studio and website parity.** Anything drawn or resolved on both sides comes from one shared function or component, never a second implementation. Here that's the resolver: a stored colour becomes a colour to paint through the function `render.ts` exports, and the Studio's picker and preview call it rather than repeating how a name, a swatch, or a custom value is resolved.

**The colour maths stands alone.** Conversion and contrast measurement live in `lib/` and know nothing about Sanity, React, or the palette. They take colours and return numbers. That's what makes the picker and the validation rule reach the same verdict about the same pairing, which is the point of the plugin.

**One palette, two readers.** The picker and the validator both read the palette a consumer configures. If they can disagree, that's a bug: a colour must never validate as one value and paint as another. Derive both from the configuration rather than restating it.

**Colours are stored by name.** A palette colour is stored as its name, never as the value it resolved to, so it keeps changing with the active colour scheme. Only a colour without a name, such as a custom value or an image swatch, stores anything like a value. Don't denormalise this.

## Code

**Abstraction.** In addition to the shared rule: the coefficients in a colour space conversion get a comment rather than a name.

**Styling.** In addition to the shared rule: the plugin gives a consumer's site colour values in several formats, never styles or class names. How a colour is applied is up to the site.

## Sanity

**Data strings.** In addition to the shared rule: every stored colour is parsed, so every colour read goes through `stegaClean`.

## Accessibility

**Contrast is the product.** The plugin exists to stop unreadable pairings reaching a page, so the measurement is a requirement rather than advice. Validation only rejects pairings no reader could make out at any size, because a rule that blocks publishing a merely poor pairing gets worked around. Anything above that is reported to the author and left to their judgement.

**Report in the standard's terms.** A ratio alone tells an author nothing. Say what it passes, what it fails, and at what size, naming the version of the standard.
