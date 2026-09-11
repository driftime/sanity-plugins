import { isDefined } from "@repo/lib/utils";

/** Matches an OKLCH color, taking lightness as either a fraction or a percentage. */
const oklchPattern =
  /^oklch\(\s*(?<lightness>\d*\.?\d+)(?<percent>%?)\s+(?<chroma>\d*\.?\d+)\s+(?<hue>\d*\.?\d+)\s*\)$/u;

/**
 * Reads an OKLCH color as its three linear channels. A color outside what a display can show is
 * left out of range here and brought back only when it is written out.
 *
 * @param value - The OKLCH color.
 * @returns The red, green, and blue channels, or undefined when the color is malformed.
 */
export function parseOklch(value: string) {
  const { lightness: digits, percent, chroma, hue } = oklchPattern.exec(value.trim())?.groups ?? {};
  if (!isDefined(digits) || !isDefined(chroma) || !isDefined(hue)) return undefined;

  const lightness = percent === "%" ? Number(digits) / 100 : Number(digits);
  const radians = (Number(hue) * Math.PI) / 180;
  const greenRed = Number(chroma) * Math.cos(radians);
  const blueYellow = Number(chroma) * Math.sin(radians);

  // Coefficients published with the OKLab colour space.
  const long = (lightness + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
  const medium = (lightness - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
  const short = (lightness - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;

  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
}

/**
 * Writes three linear channels as an OKLCH color.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The OKLCH color.
 */
export function formatOklch(channels: number[]) {
  const [red, green, blue] = channels;
  if (!isDefined(red) || !isDefined(green) || !isDefined(blue)) return undefined;

  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
  const greenRed = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const blueYellow = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;

  const chroma = Number(Math.hypot(greenRed, blueYellow).toFixed(4));

  // A grey's hue is floating-point residue, and would write one grey several ways if kept.
  const hue = chroma === 0 ? 0 : ((Math.atan2(blueYellow, greenRed) * 180) / Math.PI + 360) % 360;

  return `oklch(${String(Number(lightness.toFixed(4)))} ${String(chroma)} ${String(Number(hue.toFixed(2)))})`;
}
