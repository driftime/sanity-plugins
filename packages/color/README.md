<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/icon-light.svg" alt="Color plugin logo" width="48" />
  </picture>
  <h1>Color</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Background and text colors for Sanity Studio, checked against WCAG as authors pair them.</p>
  <p>
    <a href="https://www.npmjs.com/package/@driftime/sanity-plugin-color"><img src="https://img.shields.io/npm/v/@driftime/sanity-plugin-color?style=flat-square&labelColor=1a1a1a&color=666666" alt="npm version" /></a>
    <a href="https://github.com/driftime/sanity-plugins/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@driftime/sanity-plugin-color?style=flat-square&labelColor=1a1a1a&color=666666" alt="License: MIT" /></a>
  </p>
</div>

<br />

## Overview

Every section of a page is painted in something, and Color hands that decision to the author. A field holds a background and the text on it, chosen from a palette the site defines, from the colors Sanity finds in an image on the same document, or as a value typed by hand.

Everything else builds on having those colors in the content model. Palette colors are stored by name rather than value, so a change to the palette reaches every document that uses it. Every pairing is measured against WCAG 2.2 as it is chosen, so a pairing that is legible only at heading sizes is reported as a warning and an illegible one blocks publishing. On the site, one function turns a stored color into hex, RGB, and OKLCH, with the contrast ratio and whether the text is light or dark, so a component paints the pairing without converting anything itself.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-fields-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-fields-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-fields-light.png" alt="Three color fields in Sanity Studio: one with a palette background and palette text chosen, one with a background taken from the image and automatic text, and one with custom hex values typed in for both" />
  </picture>
  <p align="center"><sub><em>Three fields, three sources: palette colors, a color found in the image, and custom values.</em></sub></p>
</figure>

<br />

## Installation

Color is built for Sanity Studio 6.10 and React 19 and declares both as peer dependencies, so the Studio needs to be on those versions already. Node 22.12 or later is required.

```bash
bun add -E @driftime/sanity-plugin-color
```

<br />

## Studio

In the Studio, the plugin registers a `color` type and takes the palette every field offers, along with defaults each field can narrow.

<br />

### Defining the Palette

The palette is defined once, in a module that the Studio configuration and the site both import from, and passed to the plugin. Each entry names a color, gives its value, and names the palette color that serves as its text when an author sets a background and leaves the text to the palette. The module imports from `@driftime/sanity-plugin-color/render`, along with everything else the site uses, so it carries no Studio code.

```typescript
// config/palette.ts
import { defineColorPalette } from "@driftime/sanity-plugin-color/render";

export const palette = defineColorPalette({
  white: { label: "White", value: "#ffffff", contrast: "slate" },
  slate: { label: "Slate", value: "#0f172b", contrast: "white" },
  sky: { label: "Sky", value: "#b8e6fe", contrast: "slate" },
  amber: { label: "Amber", value: "#fee685", contrast: "slate" },
});
```

| Option     | Type      | Default  | Purpose                                                                         |
| ---------- | --------- | -------- | ------------------------------------------------------------------------------- |
| `label`    | `string`  | required | How the color is named to an author.                                            |
| `value`    | `string`  | required | What the color paints, written as hex, RGB, or OKLCH.                           |
| `contrast` | a key     | required | The palette color paired as text on it, named by its key.                       |
| `hidden`   | `boolean` | `false`  | Whether to keep the color out of the picker. It can still be another's pairing. |

A document stores the key rather than the value, so once content exists a key is permanent, and renaming one leaves every stored color that used it resolving to nothing. `contrast` is checked against the palette's own keys, so a name the palette does not have is a compile error.

A value can be written as hex, RGB, or OKLCH, so it can be pasted from a design token in whichever form the token uses.

```typescript
export const palette = defineColorPalette({
  sky: { label: "Sky", value: "#b8e6fe", contrast: "slate" },
  amber: { label: "Amber", value: "rgb(254 230 133)", contrast: "slate" },
  slate: { label: "Slate", value: "oklch(20.8% 0.042 265.755)", contrast: "white" },
});
```

<br />

### Registering the Plugin

Register the plugin with the palette, and every field offers it. Nothing is required, though a plugin registered without a palette offers authors only custom colors and whatever swatches an image yields.

```typescript
import { defineConfig } from "sanity";
import { colorPlugin } from "@driftime/sanity-plugin-color";
import { palette } from "@/config/palette";

export default defineConfig({
  // ...
  plugins: [
    // ...
    colorPlugin({ palette }),
  ],
});
```

| Option     | Type                  | Default                  | Purpose                                                                                                    |
| ---------- | --------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `palette`  | `SanityColorPalette`  | `{}`                     | The colors every field offers. See [Defining the Palette](#defining-the-palette).                          |
| `pickers`  | `SanityColorPicker[]` | `["background", "text"]` | Which colors an author sets. See [Restricting the Colors](#restricting-the-colors).                        |
| `sources`  | `SanityColorSource[]` | `["palette", "custom"]`  | Where the colors come from. See [Restricting the Colors](#restricting-the-colors).                         |
| `image`    | `SanityColorImage`    | every swatch, no field   | Which image to read swatches from, and which to offer. See [Colors from an Image](#colors-from-an-image).  |
| `custom`   | `SanityColorCustom`   | white and black          | Where a custom selection starts from. See [Custom Colors](#custom-colors).                                 |
| `preview`  | `SanityColorPreview`  | a specimen               | How the pairing is previewed beneath the pickers. See [Previewing the Pairing](#previewing-the-pairing).   |
| `standard` | `SanityColorStandard` | `"AA"`                   | The WCAG level every pairing is measured against, or `"off"`. See [Checking Contrast](#checking-contrast). |

<br />

### Adding a Color Field

A field of type `color` is defined like any other.

```typescript
defineField({
  name: "color",
  type: "color",
  description: "Colors the section is painted with.",
});
```

A field accepts every option the plugin does except `palette`, under `options`, and adds one of its own.

| Option   | Type       | Default           | Purpose                                                                                                       |
| -------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `colors` | `string[]` | the whole palette | Palette colors this field offers, in the order listed. See [Restricting the Colors](#restricting-the-colors). |

A list set on a field **replaces** the plugin's list, so `pickers`, `sources`, and `colors` each mean exactly what the field says. The `image`, `custom`, and `preview` objects merge with the plugin's key by key instead, so a field can change one setting inside them without repeating the rest.

The type name is always `color`, so a Studio that already has a type by that name needs to rename it before installing.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-selectors-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-selectors-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugins/HEAD/packages/color/assets/color-selectors-light.png" alt="Five open background menus side by side, each offering a different combination of palette colors, image swatches, and a custom option" />
  </picture>
  <p align="center"><sub><em>Each field decides what its menu offers: palette colors, image swatches, a custom value, or any mix.</em></sub></p>
</figure>

<br />

### Restricting the Colors

A field offers both pickers, the whole palette, and a custom value unless restricted. Some fields are better with less, for example a banner whose background should be one of two brand colors with the text left to the palette.

To set the default for every field, pass `pickers` and `sources` to the plugin.

```typescript
colorPlugin({
  palette,
  pickers: ["background"],
  sources: ["palette"],
});
```

To set it for one field, pass them in the field's `options`, with `colors` to narrow the palette.

```typescript
defineField({
  name: "banner",
  type: "color",
  description: "Colors behind the banner.",
  options: {
    pickers: ["background"],
    sources: ["palette"],
    colors: ["sky", "amber"],
  },
});
```

This field offers a background only, chosen from Sky or Amber with no custom value, and its text is whichever pairing the chosen color names. Palette colors appear in the order `colors` lists them, or in the palette's own order where a field names none. Restricting a field later is safe, because a stored color the field no longer offers still resolves.

<br />

### Colors from an Image

Sanity derives a palette from every image it processes, so a color field can offer the colors found in an image on the same document. Add `image` to `sources` and point `image.field` at the image.

```typescript
defineField({
  name: "color",
  type: "color",
  description: "Colors for the masthead.",
  options: {
    sources: ["palette", "image", "custom"],
    image: { field: "image", swatches: ["dominant", "vibrant", "muted"] },
  },
});
```

| Option     | Type                      | Default | Purpose                                                                                                                      |
| ---------- | ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `field`    | `string`                  | none    | Dotted path from the object holding the color field to the image. `"image"` is a sibling, `"hero.image"` a field inside one. |
| `swatches` | `SanityColorSwatchName[]` | all     | Swatches the image may offer, in the order listed.                                                                           |

The source and the field are needed together. Naming one without the other offers no image colors, and during development a message in the console says which of the two is missing.

Sanity derives up to seven swatches, `dominant`, `vibrant`, `muted`, `lightVibrant`, `lightMuted`, `darkVibrant`, and `darkMuted`, and the picker offers only the ones the image actually produced. A color taken from an image is stored as the swatch's name alongside the hex it held at the time, and when the image is replaced, the stored hex follows the new one.

<br />

### Custom Colors

The `custom` source lets an author type a hex code. A custom background starts from white and a custom text color from black, and `custom.initial` changes either starting point, for example to the brand colors an author is most likely to adjust.

```typescript
colorPlugin({
  palette,
  custom: { initial: { background: "#b8e6fe", text: "#0f172b" } },
});
```

A field sets the same option under `options`, and a key it leaves out keeps the plugin's value.

<br />

### Previewing the Pairing

The chosen pairing is previewed beside the pickers as a small specimen of two letters. Where the color will sit behind running text, `preview.text` replaces the specimen with a full-width panel beneath the pickers, painted with the sentence given.

```typescript
defineField({
  name: "banner",
  type: "color",
  description: "Colors behind the banner.",
  options: {
    preview: { text: "The quick brown fox jumps over the lazy dog." },
  },
});
```

Passed to the plugin, the same option applies to every field.

<br />

### Checking Contrast

Every pairing an author chooses is measured against WCAG 2.2, which sets the contrast ratio text must reach to be readable, and asks less of large text than of body text at each conformance level.

| Standard | Body text | Large text |
| -------- | --------- | ---------- |
| `AA`     | 4.5:1     | 3:1        |
| `AAA`    | 7:1       | 4.5:1      |

The measurement decides what the author sees. A pairing that reaches the body-text ratio passes without comment. One that reaches only the large-text ratio is reported as a warning, because it is readable in a heading but not in a paragraph, and the plugin cannot know which the field will hold. One that reaches neither is a validation error, and the document cannot be published until the pairing changes. In each case the message states the ratio that was measured and the threshold it fell short of.

The plugin measures against `AA` unless told otherwise. A field that needs the stricter level names it in its `options`.

```typescript
defineField({
  name: "banner",
  type: "color",
  description: "Colors behind the banner.",
  options: { standard: "AAA" },
});
```

Passed to the plugin instead, the same option holds every field to the stricter level, and `"off"` in either place stops the measurement there.

```typescript
colorPlugin({
  palette,
  standard: "AAA",
});
```

<br />

## Site

On the site, a resolver bound to the palette turns a stored color into hex, RGB, and OKLCH, with the contrast between the two already measured. Everything for the site is imported from `@driftime/sanity-plugin-color/render`. That path carries no Studio code, so it is safe in server components and anywhere else on the site.

<br />

### Creating the Resolver

The resolver is created once from the palette, in the same module, so no component needs to name the palette itself.

```typescript
// config/palette.ts
import { createColorResolver } from "@driftime/sanity-plugin-color/render";

export const resolveColor = createColorResolver(palette);
```

<br />

### Querying

A color needs nothing special in a query. It comes back as a plain object with the rest of the document.

```groq
*[_type == "home"][0] { title, color }
```

<br />

### Rendering Colors

`resolveColor` returns the background, the text, and the contrast between them. How they are applied stays with the site.

```tsx
import { resolveColor } from "@/config/palette";
import type { SanityColor } from "@driftime/sanity-plugin-color/render";

interface SectionProps {
  color: SanityColor | undefined;
  title: string;
}

export function Section({ color, title }: SectionProps) {
  const { background, text } = resolveColor(color);

  return (
    <section style={{ background: background?.hex, color: text?.hex }}>
      <h2>{title}</h2>
    </section>
  );
}
```

| Value        | Type                  | Purpose                                                                                      |
| ------------ | --------------------- | -------------------------------------------------------------------------------------------- |
| `background` | `SanityResolvedColor` | The background as `hex`, `rgb`, and `oklch`, with where it came from, or `undefined`.        |
| `text`       | `SanityResolvedColor` | The text color in the same forms. Present whenever there is a background.                    |
| `tone`       | `"light" \| "dark"`   | Whether the text paints light or dark, for anything drawn over the color without inheriting. |
| `ratio`      | `number`              | The contrast ratio between the two.                                                          |

```json
{
  "background": {
    "hex": "#b8e6fe",
    "rgb": "rgb(184 230 254)",
    "oklch": "oklch(0.9005 0.0579 230.91)",
    "name": "sky",
    "label": "Sky"
  },
  "text": {
    "hex": "#0f172b",
    "rgb": "rgb(15 23 43)",
    "oklch": "oklch(0.2084 0.0417 266.36)",
    "name": "slate",
    "label": "Slate"
  },
  "tone": "dark",
  "ratio": 13.41
}
```

The text is the color the author chose, and where none was chosen it is derived from the background: a palette color takes the pairing it names, and a custom or image color takes whichever of black and white has the higher contrast against it. Each resolved color also says where it came from, since a palette color carries `name` and `label`, an image color carries `swatch`, and a custom color carries neither. When no color was chosen at all, every value is `undefined`, so an empty field passes through without a check in front of it.

<br />

### Helpers

The functions the resolver is built from are exported as well, for colors a site holds outside its documents, such as a brand color in a theme. Each is covered in its own section.

#### Resolving Without the Bound Resolver

`resolveColor` is the function the bound resolver wraps, and it takes the palette as its second argument, for a site that resolves against more than one palette or has no module to bind one in.

```typescript
import { resolveColor } from "@driftime/sanity-plugin-color/render";
import { palette } from "@/config/palette";

const { background, text, tone, ratio } = resolveColor(page.color, palette);
```

#### Parsing a Color

`parseColor` reads a color written as hex, RGB, or OKLCH and returns it in all three forms, so a site converts a color once and paints with whichever form it needs. A color outside what a display can show is brought back to the nearest edge of the gamut, so every form returned is one a browser will paint.

```typescript
import { parseColor } from "@driftime/sanity-plugin-color/render";

const brand = parseColor("oklch(0.65 0.2 250)");
```

```json
{ "hex": "#0091ff", "rgb": "rgb(0 145 255)", "oklch": "oklch(0.65 0.2 250)" }
```

| Value   | Type     | Purpose                                   |
| ------- | -------- | ----------------------------------------- |
| `hex`   | `string` | Six-digit hex, as `#0091ff`.              |
| `rgb`   | `string` | Space-separated RGB, as `rgb(0 145 255)`. |
| `oklch` | `string` | OKLCH, as `oklch(0.65 0.2 250)`.          |

A string that is not a color in any of the three forms returns `undefined`.

#### Measuring Contrast

`getContrastRatio` measures the WCAG contrast ratio between two colors, in whichever form each is written, and returns it rounded to two decimal places. It returns `undefined` when either color cannot be read.

```typescript
import { getContrastRatio } from "@driftime/sanity-plugin-color/render";

const onWhite = getContrastRatio("#0091ff", "#ffffff");
// 3.23

const onBlack = getContrastRatio("#0091ff", "#000000");
// 6.49
```

#### Judging a Ratio

`getContrastVerdict` places a ratio against a conformance level and returns `"pass"` when it reaches the body-text threshold, `"large"` when it reaches only the large-text threshold, and `"fail"` when it reaches neither. The Studio's warnings and errors come from the same function, so the site and the Studio never disagree about a pairing.

```typescript
import { getContrastVerdict } from "@driftime/sanity-plugin-color/render";

const verdict = getContrastVerdict(3.23, "AA");
// "large"
```

| Input      | Type            | Purpose                                          |
| ---------- | --------------- | ------------------------------------------------ |
| `ratio`    | `number`        | A ratio from `getContrastRatio` or a resolution. |
| `standard` | `"AA" \| "AAA"` | The conformance level to judge against.          |

<br />

## Reference

The rest of this document covers the shape of a stored color and everything the package exports.

<br />

### Stored Colors

`SanityColor` is the type of a stored color. It takes the palette's names as a type parameter, so a stored color completes against them.

```typescript
import type { SanityColor } from "@driftime/sanity-plugin-color/render";
import type { palette } from "@/config/palette";

export interface SanityHome {
  color?: SanityColor<keyof typeof palette>;
}
```

A palette color is stored by name, a custom color as its hex code, and an image color as its swatch name with an `image:` prefix, alongside the hex it resolved to at the time.

```json
{ "_type": "color", "background": "sky", "text": "slate" }
```

```json
{ "_type": "color", "background": "#a5b4fc" }
```

```json
{ "_type": "color", "background": "image:dominant", "backgroundHex": "#c96f4a" }
```

| Field           | Type     | Purpose                                                                          |
| --------------- | -------- | -------------------------------------------------------------------------------- |
| `_type`         | `string` | Always `color`.                                                                  |
| `background`    | `string` | The background as the author chose it, or absent when none was chosen.           |
| `backgroundHex` | `string` | What the background resolved to, written only when it names an image swatch.     |
| `text`          | `string` | The text as the author chose it, or absent to take the pairing the palette sets. |
| `textHex`       | `string` | What the text resolved to, written only when it names an image swatch.           |

<br />

### API

| Export                                | Import from                            | Purpose                                                          |
| ------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `colorPlugin(config?)`                | `@driftime/sanity-plugin-color`        | Registers the `color` type.                                      |
| `defineColorPalette(palette)`         | `@driftime/sanity-plugin-color/render` | Declares a palette and checks every `contrast` against its keys. |
| `createColorResolver(palette)`        | `@driftime/sanity-plugin-color/render` | Binds `resolveColor` to a palette.                               |
| `resolveColor(color, palette?)`       | `@driftime/sanity-plugin-color/render` | Resolves a stored color against a palette passed at the call.    |
| `parseColor(value)`                   | `@driftime/sanity-plugin-color/render` | Reads a color in any form and returns hex, RGB, and OKLCH.       |
| `getContrastRatio(first, second)`     | `@driftime/sanity-plugin-color/render` | Measures the contrast ratio between two colors.                  |
| `getContrastVerdict(ratio, standard)` | `@driftime/sanity-plugin-color/render` | Judges a ratio as `pass`, `large`, or `fail`.                    |

<br />

### Types

| Type                    | Import from                            | Purpose                                               |
| ----------------------- | -------------------------------------- | ----------------------------------------------------- |
| `SanityColorConfig`     | `@driftime/sanity-plugin-color`        | Everything `colorPlugin` accepts.                     |
| `SanityColorOptions`    | `@driftime/sanity-plugin-color`        | The `options` a color field accepts.                  |
| `SanityColorDefinition` | `@driftime/sanity-plugin-color`        | A field or array member of type `color`.              |
| `SanityColorPicker`     | `@driftime/sanity-plugin-color`        | `"background"` or `"text"`.                           |
| `SanityColorSource`     | `@driftime/sanity-plugin-color`        | `"palette"`, `"image"`, or `"custom"`.                |
| `SanityColorImage`      | `@driftime/sanity-plugin-color`        | The `image` option.                                   |
| `SanityColorCustom`     | `@driftime/sanity-plugin-color`        | The `custom` option.                                  |
| `SanityColorInitial`    | `@driftime/sanity-plugin-color`        | The colors a custom selection starts from.            |
| `SanityColorPreview`    | `@driftime/sanity-plugin-color`        | The `preview` option.                                 |
| `SanityColorFormats`    | `@driftime/sanity-plugin-color/render` | A color as hex, RGB, and OKLCH.                       |
| `SanityResolvedColor`   | `@driftime/sanity-plugin-color/render` | One resolved color, with where it came from.          |
| `SanityColorResult`     | `@driftime/sanity-plugin-color/render` | Everything `resolveColor` returns.                    |
| `SanityColorVerdict`    | `@driftime/sanity-plugin-color/render` | `"pass"`, `"large"`, or `"fail"`.                     |
| `SanityColorPalette`    | `@driftime/sanity-plugin-color/render` | A palette, keyed by the name each color is stored by. |
| `SanityColorEntry`      | `@driftime/sanity-plugin-color/render` | One color in a palette.                               |
| `SanityColorStandard`   | `@driftime/sanity-plugin-color/render` | `"AA"`, `"AAA"`, or `"off"`.                          |
| `SanityColor`           | `@driftime/sanity-plugin-color/render` | A stored color, with its background and text.         |
| `SanityColorSwatchName` | `@driftime/sanity-plugin-color/render` | The name of one of the seven image swatches.          |

<br />

## License

MIT © [Driftime®](https://driftime.com). See [LICENSE](https://github.com/driftime/sanity-plugins/blob/main/LICENSE).

<br />

## Acknowledgements

Icons for the Studio's own controls come from `@sanity/icons`, so they match the rest of the Studio. The plugin's own icon is based on [Lucide](https://lucide.dev), distributed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).

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
