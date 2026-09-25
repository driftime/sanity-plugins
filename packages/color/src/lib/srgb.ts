import { isDefined } from "@repo/lib/utils";

/** Matches a three- or six-digit hex color, with or without a leading hash. */
const hexPattern = /^#?(?<digits>[\da-f]{3}|[\da-f]{6})$/iu;

/** Matches an RGB color in the modern space-separated form or the legacy comma-separated form. */
const rgbPattern = /^rgb\(\s*(?<red>\d{1,3})\s*[\s,]\s*(?<green>\d{1,3})\s*[\s,]\s*(?<blue>\d{1,3})\s*\)$/u;

/**
 * Converts an sRGB-encoded channel to linear light. Color arithmetic only works on linear values.
 *
 * @param channel - The encoded channel, from 0 to 1.
 * @returns The linear channel.
 */
function toLinearChannel(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * Converts a linear channel back to sRGB encoding.
 *
 * @param channel - The linear channel.
 * @returns The encoded channel, from 0 to 1.
 */
function toGammaChannel(channel: number) {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.max(channel, 0) ** (1 / 2.4) - 0.055;
}

/**
 * Converts linear channels to display values, clamping anything out of range.
 *
 * @param channels - The red, green, and blue channels.
 * @returns Each channel from 0 to 255.
 */
function toDisplayChannels(channels: number[]) {
  return channels.map((channel) => Math.round(Math.min(Math.max(toGammaChannel(channel), 0), 1) * 255));
}

/**
 * Reads a hex color as linear RGB channels, expanding the three-digit form.
 *
 * @param value - A three- or six-digit hex color, with or without a leading hash.
 * @returns The red, green, and blue channels, or undefined when the color is malformed.
 */
export function parseHex(value: string) {
  const { digits } = hexPattern.exec(value.trim())?.groups ?? {};
  if (!isDefined(digits)) return undefined;

  const expanded = digits.length === 3 ? digits.replaceAll(/(?<digit>[\da-f])/giu, "$<digit>$<digit>") : digits;

  return [0, 2, 4].map((offset) => toLinearChannel(Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255));
}

/**
 * Reads an RGB color as linear channels.
 *
 * @param value - An RGB color, space- or comma-separated.
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
 * Formats linear channels as a hex color.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The six-digit hex color.
 */
export function formatHex(channels: number[]) {
  return `#${toDisplayChannels(channels)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Formats linear channels as a space-separated RGB color.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The RGB color.
 */
export function formatRgb(channels: number[]) {
  return `rgb(${toDisplayChannels(channels).join(" ")})`;
}

/**
 * Calculates a color's relative luminance, which contrast is measured from.
 *
 * @param channels - The red, green, and blue channels.
 * @returns The relative luminance, or undefined when a channel is missing.
 */
export function getLuminance(channels: number[]) {
  const [red, green, blue] = channels;
  if (!isDefined(red) || !isDefined(green) || !isDefined(blue)) return undefined;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
