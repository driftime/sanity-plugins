import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { isDefined, isRecord } from "@repo/lib/utils";
import type { ElementType, createElement } from "react";
import type { renderToStaticMarkup } from "react-dom/server";

import type { SourceIcon } from "@/build/convert";
import { toReactName } from "@/build/convert";

/** Root of a 24-unit stroke icon with rounded ends, shared by Lucide and Tabler's outline style. */
export const roundStrokeRoot = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

/**
 * Converts a PascalCase export name to the kebab-case name libraries use on their websites, splitting before numbers
 * too, so `Home01` becomes `home-01`.
 *
 * @param name - The export name.
 * @returns The kebab-case name.
 */
export function toKebabName(name: string) {
  return name
    .replaceAll(/(?<upper>[A-Z])(?<next>[A-Z][a-z])/gu, "$<upper>-$<next>")
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower>-$<upper>")
    .replaceAll(/(?<letter>[a-zA-Z])(?<digit>[0-9])/gu, "$<letter>-$<digit>")
    .toLowerCase();
}

/**
 * Checks whether a module is React, with its element factory.
 *
 * @param value - The module.
 * @returns True if the module is React.
 */
function isReact(value: unknown): value is { createElement: typeof createElement } {
  return isRecord(value) && typeof value["createElement"] === "function";
}

/**
 * Checks whether a module is React's server renderer.
 *
 * @param value - The module.
 * @returns True if the module is the server renderer.
 */
function isServerRenderer(value: unknown): value is { renderToStaticMarkup: typeof renderToStaticMarkup } {
  return isRecord(value) && typeof value["renderToStaticMarkup"] === "function";
}

/**
 * Checks whether a value can be rendered as a React element: a tag name, a component, or a wrapped component such as
 * one made by `memo`.
 *
 * @param value - The value.
 * @returns True if the value is an element type.
 */
export function isElementType(value: unknown): value is ElementType {
  return typeof value === "string" || typeof value === "function" || isRecord(value);
}

/**
 * Loads the project's React and its server renderer, so markup is written the way the project itself would write it.
 *
 * @param root - The project folder.
 * @returns React's element factory and a function that renders an element to markup, or undefined when the project
 *   has no React.
 */
export function loadRenderer(root: string) {
  const react = requireFromProject(root, "react");
  const server = requireFromProject(root, "react-dom/server");
  if (!isReact(react) || !isServerRenderer(server)) return undefined;

  return {
    createElement: react.createElement,
    render: (type: ElementType, props: Record<string, unknown> = {}) =>
      server.renderToStaticMarkup(react.createElement(type, props)),
  };
}

/**
 * Converts attributes to React props, so React writes each name the way SVG spells it.
 *
 * @param attributes - The attributes, in SVG or React naming.
 * @returns The props.
 */
function toProps(attributes: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(attributes).flatMap(([name, value]) => (name === "key" ? [] : [[toReactName(name), String(value)]])),
  );
}

/**
 * Writes a list of `[element, attributes]` pairs, the format several libraries ship, as SVG markup. React writes the
 * attributes, so names in either SVG or React form come out right.
 *
 * @param root - The project folder.
 * @param attributes - Attributes of the SVG around the elements.
 * @param value - The list.
 * @returns The markup, or undefined when the value isn't a list of pairs.
 */
export function writeElementPairs(root: string, attributes: Record<string, string>, value: unknown) {
  const renderer = loadRenderer(root);
  if (!isDefined(renderer) || !Array.isArray(value)) return undefined;

  const { createElement: create, render } = renderer;
  const elements = value.flatMap((pair: unknown, index) =>
    Array.isArray(pair) && typeof pair[0] === "string" && isRecord(pair[1])
      ? [create(pair[0], { ...toProps(pair[1]), key: String(index) })]
      : [],
  );
  if (elements.length !== value.length) return undefined;

  return render("svg", { xmlns: "http://www.w3.org/2000/svg", ...toProps(attributes), children: elements });
}

/**
 * Reads SVG files from a folder into icons.
 *
 * @param folder - The folder.
 * @param files - The file names to read.
 * @param describe - Gives each file's icon name and keywords.
 * @returns The icons, in the order given.
 */
export async function readSvgIcons(
  folder: string,
  files: string[],
  describe: (file: string) => { name: string; keywords: string[] },
) {
  const icons = await Promise.all(
    files.map(async (file): Promise<SourceIcon> => ({
      ...describe(file),
      svg: await readFile(path.join(folder, file), "utf8"),
    })),
  );

  return icons;
}

/**
 * Lists the SVG files in a folder.
 *
 * @param directory - The folder.
 * @returns The file names, sorted.
 */
export async function listSvgFiles(directory: string) {
  const files = await readdir(directory);

  return files.filter((file) => file.endsWith(".svg")).toSorted();
}

/**
 * Imports a JavaScript module from inside an installed package, by path, since some packages don't allow importing
 * the file by name.
 *
 * @param directory - The package folder.
 * @param file - The module's path within the package.
 * @returns The module's exports.
 */
export async function importPackageFile(directory: string, file: string): Promise<Record<string, unknown>> {
  const loaded: unknown = await import(pathToFileURL(path.join(directory, file)).href);

  return isRecord(loaded) ? loaded : {};
}

/**
 * Loads a package the way the project itself resolves it, so rendering uses the project's own copy of React.
 *
 * @param root - The project folder.
 * @param name - The package name.
 * @returns The package's exports.
 */
export function requireFromProject(root: string, name: string): unknown {
  return createRequire(path.join(root, "package.json"))(name);
}
