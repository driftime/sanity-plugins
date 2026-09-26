/** Fills Central Icon System draws each style in. */
const centralFills = ["outlined", "filled"] as const;

/** Corner radii Central Icon System's round styles come in. */
const centralRadii = ["0", "1", "2", "3"] as const;

/** Stroke widths Central Icon System's styles come in. */
const centralStrokes = ["1", "1.5", "2"] as const;

/** Styles Central Icon System publishes, one package each, named after the corners, fill, radius, and stroke. */
const centralStyles = [
  ...centralFills.flatMap((fill) =>
    centralRadii.flatMap((radius) =>
      centralStrokes.map((stroke) => `round-${fill}-radius-${radius}-stroke-${stroke}` as const),
    ),
  ),
  ...centralFills.flatMap((fill) =>
    centralStrokes.map((stroke) => `square-${fill}-radius-0-stroke-${stroke}` as const),
  ),
];

/** Packages Nucleo publishes, each a style named after the rest of its package name. */
const nucleoStyles = [
  "arcade",
  "core-essential-fill-24",
  "core-essential-fill-32",
  "core-essential-fill-48",
  "core-essential-outline-24",
  "core-essential-outline-32",
  "core-essential-outline-48",
  "core-fill-24",
  "core-fill-32",
  "core-fill-48",
  "core-outline-24",
  "core-outline-32",
  "core-outline-48",
  "credit-cards",
  "flags",
  "glass",
  "isometric",
  "micro-bold",
  "micro-bold-essential",
  "pixel",
  "pixel-essential",
  "sharp",
  "sharp-essential",
  "social-media",
  "ui-essential-fill-12",
  "ui-essential-fill-18",
  "ui-essential-fill-duo-18",
  "ui-essential-outline-12",
  "ui-essential-outline-18",
  "ui-essential-outline-duo-18",
  "ui-fill-12",
  "ui-fill-18",
  "ui-fill-duo-18",
  "ui-outline-12",
  "ui-outline-18",
  "ui-outline-duo-18",
] as const;

/**
 * Styles of each library the plugin supports, the first being the default. For a library published as a family of
 * packages, its styles are the packages it publishes, and the installed ones are used.
 */
export const iconLibraryStyles = {
  central: centralStyles,
  heroicons: ["outline", "solid", "mini", "micro"],
  hugeicons: ["stroke-rounded"],
  iconoir: ["regular", "solid"],
  lucide: ["default"],
  nucleo: nucleoStyles,
  phosphor: ["regular", "thin", "light", "bold", "fill", "duotone"],
  tabler: ["outline", "filled"],
} as const;
