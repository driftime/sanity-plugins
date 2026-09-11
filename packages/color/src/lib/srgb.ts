import { isDefined } from "@repo/lib/utils";

/** Matches a hex color in either its three or six digit form, with or without a leading hash. */
const hexPattern = /^#?(?<digits>[\da-f]{3}|[\da-f]{6})$/iu;

/** Matches an RGB color, taking the modern space-separated form and the legacy comma-separated one. */
const rgbPattern = /^rgb\(\s*(?<red>\d{1,3})\s*[\s,]\s*(?<green>\d{1,3})\s*[\s,]\s*(?<blue>\d{1,3})\s*\)$/u;

/**
 * Removes the sRGB transfer function from a channel, giving the light it actually carries. Color
 * arithmetic is only meaningful on these linear values, never on the encoded ones.
 *
 * @param channel - The encoded channel, between zero and one.
 * @returns The linear channel.
 */
function toLinearChannel(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * Reapplies the sRGB transfer function to a linear channel, giving the value a display encodes.
 *
 * @param channel - The linear channel.
 * @returns The encoded channel, between zero and one.
 */
function toGammaChannel(channel: number) {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.max(channel, 0) ** (1 / 2.4) - 0.055;
}

/**
 * Encodes three linear channels as the whole numbers a display is addressed with, bringing anything
 * outside its range back to the nearest edge.
 *
 * @param channels - The red, green, and blue channels.
 * @returns Each channel between 0 and 255.
 */
function toDisplayChannels(channels: number[]) {
  return channels.map((channel) => Math.round(Math.min(Math.max(toGammaChannel(channel), 0), 1) * 255));
}

/**
 * Reads a hex color as its three linear channels, expanding the shorthand form on the way.
 *
 * @param value - Hex color in either its three or six digit form, with or without a leading hash.
 * @returns The red, green, and blue channels, or undefined when the color is malformed.
 */
export function parseHex(value: string) {
  const { digits } = hexPattern.exec(value.trim())?.groups ?? {};
  if (!isDefined(digits)) return undefined;

  const expanded = digits.length === 3 ? digits.replaceAll(/(?<digit>[\da-f])/giu, "$<digit>$<digit>") : digits;

  return [0, 2, 4].map((offset) => toLinearChannel(Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255));
}

/**
 * Reads an RGB color as its three linear channels.
 *
 * @param value - RGB color in either its space-separated or comma-separated form.
 * @returns The red, green, and blue channels, or undefined when the color is malformed.
 */
export function parseRgb(value: string) {
  const { red, green, blue } = rgbPattern.exec(value.trim())?.groups ?? {};
  if (!isDefined(red) || !isDefined(green) || !isDefined(blue)) return undefined;

  const channels = [red, green, blue].map(Number);
  if (channels.some((channel) => channel > 255)) return undefined;

  return channels.map((channel) => toLinearChannel(channel / 255));
}

/**
 * Writes three linear channels as a hex color.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The six digit hex color.
 */
export function formatHex(channels: number[]) {
  return `#${toDisplayChannels(channels)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Writes three linear channels as an RGB color, in the space-separated form current CSS uses.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The RGB color.
 */
export function formatRgb(channels: number[]) {
  return `rgb(${toDisplayChannels(channels).join(" ")})`;
}

/**
 * Measures how much light a color reflects, for weighing one color against another.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The relative luminance.
 */
export function getLuminance(channels: number[]) {
  const [red, green, blue] = channels;
  if (!isDefined(red) || !isDefined(green) || !isDefined(blue)) return undefined;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
