import { defineColorPalette } from "@driftime/sanity-plugin-color/render";
import { createSanityIcon } from "@repo/lib/icons";
import { CompassIcon, FileIcon, HouseIcon, LayoutTemplateIcon, PilcrowIcon, ToggleLeftIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Colors the color fields offer, named after the Tailwind colors they use. */
export const palette = defineColorPalette({
  white: { label: "White", value: "#ffffff", contrast: "slate", hidden: true },
  slate: { label: "Slate", value: "#0f172b", contrast: "white" },
  red: { label: "Red", value: "#9f0712", contrast: "white" },
  orange: { label: "Orange", value: "#ffd6a7", contrast: "slate" },
  yellow: { label: "Yellow", value: "#fff085", contrast: "slate" },
  sky: { label: "Sky", value: "#b8e6fe", contrast: "slate" },
  emerald: { label: "Emerald", value: "#004f3b", contrast: "white" },
  green: { label: "Green", value: "#b9f8cf", contrast: "slate" },
  lime: { label: "Lime", value: "#d8f999", contrast: "slate" },
  teal: { label: "Teal", value: "#96f7e4", contrast: "slate" },
  cyan: { label: "Cyan", value: "#a2f4fd", contrast: "slate" },
  blue: { label: "Blue", value: "#51a2ff", contrast: "slate" },
  purple: { label: "Purple", value: "#59168b", contrast: "white" },
  fuchsia: { label: "Fuchsia", value: "#f6cfff", contrast: "slate" },
  zinc: { label: "Zinc", value: "#18181b", contrast: "white" },
  gray: { label: "Gray", value: "#e5e7eb", contrast: "slate" },
  neutral: { label: "Neutral", value: "#fafafa", contrast: "slate" },
  black: { label: "Black", value: "#000000", contrast: "white" },
  indigo: { label: "Indigo", value: "#312c85", contrast: "white" },
  amber: { label: "Amber", value: "#fee685", contrast: "slate" },
});

const titleField = defineField({
  name: "title",
  type: "string",
  description: "Name shown in navigation, browser tabs, and search results.",
  handbook: {
    description:
      "What the document is called wherever it's listed: navigation menus, browser tabs, search results, and the Studio's own lists. Every document needs one, and it's also used to generate the slug and as the SEO title when those fields are left empty.",
    example: "About Acme Inc.",
    tip: "Keep it short enough to fit in a navigation menu without wrapping.",
  },
});

export const home = defineType({
  name: "home",
  type: "document",
  title: "Home",
  icon: createSanityIcon(HouseIcon),
  description: "Landing page of the site.",
  handbook: {
    description:
      "The site's front page, and the first page most visitors see. There's only one, and it can't be duplicated or deleted, so editing it is the only way to change what's shown there.",
  },
  fields: [titleField],
});

const textBlock = defineArrayMember({
  name: "textBlock",
  type: "object",
  title: "Text",
  icon: createSanityIcon(PilcrowIcon),
  description: "Heading and formatted text.",
  preview: { select: { title: "heading" } },
  fields: [
    defineField({ name: "heading", type: "string", description: "Heading shown above the text." }),
    defineField({ name: "body", type: "standardPortableText", description: "Formatted text." }),
  ],
});

export const page = defineType({
  name: "page",
  type: "document",
  title: "Pages",
  icon: createSanityIcon(FileIcon),
  description: "General-purpose pages.",
  handbook: {
    description:
      "Standalone pages for any content that doesn't need a document type of its own. Each page has its own address and is built from blocks rather than following a fixed layout.",
  },
  fields: [
    titleField,
    defineField({
      name: "slug",
      type: "slug",
      description:
        "Part of the web address that identifies the page. Use lowercase letters, numbers, and hyphens only.",
      options: { source: "title" },
      handbook: {
        description:
          "The last part of the page's web address. Generate it from the title, then edit it if the result is long or unclear. Shorter slugs are usually better.",
        example: "about-acme-inc",
        caution: "Changing the slug of a published page breaks every link that already points at it.",
      },
    }),
    defineField({
      name: "heading",
      type: "string",
      description: "Heading at the top of the page, if different from the title.",
      handbook: {
        description:
          "The heading at the top of the page. Set one when the title is kept short for navigation but the page itself needs a longer heading. If it's left empty, the title is used instead.",
        example: "How Acme Inc. approaches every project",
      },
    }),
    defineField({
      name: "description",
      type: "text",
      description: "Short introduction shown below the heading.",
      rows: 4,
      handbook: {
        description:
          "A short introduction below the heading that says what the page covers. It's also used as the SEO description when that field is empty, so write it to make sense on its own.",
      },
    }),
    defineField({
      name: "content",
      type: "content",
      description: "Content blocks that make up the page.",
      handbook: {
        description:
          "The main content of the page, built from blocks in the order they're listed here. Blocks can be added, reordered, and removed, and a page with no blocks still shows its heading and introduction.",
      },
    }),
  ],
});

export const navigation = defineType({
  name: "navigation",
  type: "document",
  icon: createSanityIcon(CompassIcon),
  description: "Navigation menus shown across the site.",
  handbook: {
    description:
      "The menus shown in the same place on every page. There's only one of these documents for the whole site, so a change here updates every page at once, not just one.",
  },
  fields: [titleField],
});

export const templates = defineType({
  name: "templates",
  type: "document",
  icon: createSanityIcon(LayoutTemplateIcon),
  description: "Text that appears in the same place on every page.",
  handbook: {
    description:
      "Short pieces of text that belong to the site rather than to any one page. Each has a fixed place in the layout, so changing one updates every place it appears.",
  },
  fields: [titleField],
});

export const settings = defineType({
  name: "settings",
  type: "document",
  icon: createSanityIcon(ToggleLeftIcon),
  description: "Site-wide SEO values for pages that don't set their own.",
  handbook: {
    description:
      "Site-wide defaults, used whenever a page doesn't set its own value. Settings never override a value that's set on a page, so filling them in once covers the whole site.",
  },
  fields: [titleField],
});

/** Holds the plugin fields the screenshots show. It's opened by URL and kept out of the sidebar. */
const demo = defineType({
  name: "demo",
  type: "document",
  preview: {
    prepare() {
      return { title: "Demo" };
    },
  },
  fields: [
    defineField({ name: "icon", type: "icon", description: "Icon shown beside the heading." }),
    defineField({ name: "image", type: "image", description: "Image the color fields read swatches from." }),
    defineField({
      name: "brandColor",
      type: "color",
      description: "Primary background and text colors, from the palette or the image.",
      options: { sources: ["palette", "image"], image: { field: "image" } },
    }),
    defineField({
      name: "featureColor",
      type: "color",
      description: "Colors for featured content, from the palette or the image.",
      options: { sources: ["palette", "image"], image: { field: "image" } },
    }),
    defineField({
      name: "accentColor",
      type: "color",
      description: "Colors for highlights and buttons, from the palette or custom values.",
      options: { sources: ["palette", "custom"] },
    }),
    defineField({
      name: "warmColor",
      type: "color",
      description: "Warm palette colors, image swatches, or a custom value.",
      options: {
        sources: ["palette", "image", "custom"],
        colors: ["red", "orange", "yellow"],
        image: { field: "image", swatches: ["dominant", "vibrant", "muted"] },
      },
    }),
    defineField({
      name: "coolColor",
      type: "color",
      description: "Cool palette colors only.",
      options: { sources: ["palette"], colors: ["sky", "emerald", "green", "lime", "teal", "cyan", "blue"] },
    }),
    defineField({
      name: "imageColor",
      type: "color",
      description: "Image swatches only.",
      options: { sources: ["image"], image: { field: "image" } },
    }),
    defineField({
      name: "neutralColor",
      type: "color",
      description: "Neutral palette colors or a custom value.",
      options: { sources: ["palette", "custom"], colors: ["purple", "fuchsia", "zinc", "gray", "neutral", "black"] },
    }),
    defineField({
      name: "mixedColor",
      type: "color",
      description: "Two palette colors or image swatches.",
      options: {
        sources: ["palette", "image"],
        colors: ["indigo", "amber"],
        image: { field: "image", swatches: ["dominant", "vibrant", "muted", "lightVibrant", "darkVibrant"] },
      },
    }),
    defineField({ name: "link", type: "link", description: "Where the button takes the visitor." }),
    defineField({ name: "privacyLink", type: "link", description: "Link to the privacy policy, shown in the footer." }),
    defineField({ name: "careersLink", type: "link", description: "External link to the careers site." }),
    defineField({ name: "emailLink", type: "link", description: "Email address visitors can write to." }),
    defineField({ name: "phoneLink", type: "link", description: "Telephone number visitors can call." }),
    defineField({ name: "pressKitLink", type: "link", description: "Downloadable press kit." }),
  ],
});

/** Every schema type the Studio registers. */
export const schemaTypes = [
  home,
  page,
  navigation,
  templates,
  settings,
  demo,
  defineType({
    name: "content",
    type: "array",
    description: "Content blocks, shown in order from top to bottom.",
    of: [textBlock],
  }),
  defineType({
    name: "standardPortableText",
    type: "array",
    description: "Rich text with formatting, lists, and links.",
    of: [defineArrayMember({ type: "block" })],
  }),
];
