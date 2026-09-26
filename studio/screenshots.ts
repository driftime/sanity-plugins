import { mkdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { isDefined } from "@repo/lib/utils";
import { webkit } from "playwright";
import type { Locator, Page } from "playwright";

import { projectId } from "@/environment";

interface Shot {
  /** Plugin the screenshot belongs to, which names its assets folder. */
  plugin: "handbook" | "icon" | "color" | "link";
  /** File name without the appearance suffix, such as `handbook-fields`. */
  name: string;
  /**
   * Opens the screen and returns what to capture: one element, several named elements saved as separate files, or
   * undefined for the whole window.
   */
  open: (page: Page) => Promise<Locator | Record<string, Locator> | undefined>;
}

/** Address of the running demo Studio. */
const studioUrl = "http://localhost:3333";

/** ID of the SEO Best Practices guide in the seed, which the guide editor screenshot opens. */
const seoGuideId = "c6d13faa-dd3c-44d9-a79d-99383e19495d";

/** Selector for the visible panel of an open dialog, without the space the dialog reserves around it. */
const dialogPanel = '[data-ui="DialogCard"] > [data-ui="Card"]';

/** Selector for an open menu's panel. */
const menuPanel = '[data-ui="MenuButton__popover"]';

/** Window size in CSS pixels, matching the Studio window in the existing screenshots. */
const viewport = { width: 2048, height: 1152 };

/** Local storage key the Studio sets once its comments onboarding notice has been dismissed. */
const commentsOnboardingKey = "sanityStudio:comments:inspector:onboarding:dismissed:v1";

/** Selector for the Studio's loading indicators, which every screenshot waits to disappear. */
const loadingIndicators =
  '[data-ui="Spinner"], [data-ui="Skeleton"], [data-ui="TextSkeleton"], [data-ui="HeadingSkeleton"], [data-ui="LabelSkeleton"], [data-ui="CodeSkeleton"]';

/**
 * Styles added to every page, hiding scrollbars, the caret, the account controls at the top right, avatars, and the
 * announcements card, and drawing the icon picker's icons with a slightly thinner stroke.
 */
const captureStyles = `
  * { scrollbar-width: none !important; caret-color: transparent !important; }
  *::-webkit-scrollbar { display: none !important; }
  [data-testid="studio-navbar"] [data-ui="Grid"] > :last-child, [data-ui="Avatar"] { visibility: hidden !important; }
  [data-ui="whats-new-card"] { display: none !important; }
  [role="option"] svg, [role="option"] svg * { stroke-width: 1.5 !important; }
`;

/**
 * Builds styles that frame a captured element with padding, offset by a negative margin so nothing around it moves or
 * reflows.
 *
 * @param padding - Padding on each side, as a CSS length.
 * @returns The CSS declarations.
 */
function createFrameStyles(padding: string) {
  return `box-sizing: content-box !important; padding: ${padding} !important; margin: -${padding} !important;`;
}

/**
 * Opens a page in the Handbook tool by selecting it in the sidebar.
 *
 * @param page - The browser page.
 * @param title - Title of the sidebar entry.
 */
async function openHandbookPage(page: Page, title: string) {
  await page.goto(`${studioUrl}/handbook`);
  await page.getByText(title, { exact: true }).first().click();
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
}

/**
 * Opens a pane in the Structure tool by its path.
 *
 * @param page - The browser page.
 * @param panePath - Path below `/structure`, such as `handbook`.
 */
async function openStructurePath(page: Page, panePath: string) {
  await page.goto(`${studioUrl}/structure/${panePath}`);
}

/**
 * Finds one of the demo document's fields, with its title and description.
 *
 * @param page - The browser page.
 * @param field - Name of the field.
 * @returns The field.
 */
function findDemoField(page: Page, field: string) {
  return page.locator(`[data-comments-field-id="${field}"]`);
}

/**
 * Opens the demo document, which holds the fields the plugin screenshots show.
 *
 * @param page - The browser page.
 */
async function openDemo(page: Page) {
  await page.goto(`${studioUrl}/intent/edit/id=demo;type=demo`);
  await findDemoField(page, "icon").waitFor();
}

/**
 * Draws a dialog or menu flat, without its corners, border, or shadow, and frames it.
 *
 * @param page - The browser page.
 * @param selector - Selector for the panel.
 */
async function flattenPanel(page: Page, selector: string) {
  // The outline covers the sliver of the page that shows beside a panel sitting between device pixels.
  await page.addStyleTag({
    content: `${selector} { border: none !important; border-radius: 0 !important; box-shadow: none !important; outline: 1px solid var(--card-bg-color) !important; ${createFrameStyles("0.5rem")} }`,
  });
}

/**
 * Opens the demo document and the dialog behind the first control in one of its fields, drawn flat and framed.
 *
 * @param page - The browser page.
 * @param field - Name of the field.
 * @returns The dialog's panel.
 */
async function openDemoDialog(page: Page, field: string) {
  await openDemo(page);
  await findDemoField(page, field).locator('button:not([data-testid="field-actions-trigger"])').first().click();
  await flattenPanel(page, dialogPanel);
  return page.locator(dialogPanel);
}

/**
 * Clicks a menu button until its menu opens, because the Studio sometimes swallows the first click while it settles.
 *
 * @param page - The browser page.
 * @param button - The menu button.
 * @param attempts - How many more clicks to try after this one.
 * @returns The open menu.
 * @throws When the menu still hasn't opened after the last click.
 */
async function clickUntilMenuOpens(page: Page, button: Locator, attempts = 2): Promise<Locator> {
  const menu = page.locator(`${menuPanel}:visible`);
  await button.click();

  try {
    await menu.waitFor({ timeout: 2000 });
    return menu;
  } catch (error) {
    if (attempts === 0) throw error;
    return clickUntilMenuOpens(page, button, attempts - 1);
  }
}

/**
 * Opens the background menu of one of the demo document's color fields, drawn flat and framed.
 *
 * @param page - The browser page.
 * @param field - Name of the color field.
 * @returns The open menu.
 */
async function openColorMenu(page: Page, field: string) {
  await openDemo(page);
  const colorField = findDemoField(page, field);
  // A menu that opens near the bottom of the window has its height capped, which cuts off its padding.
  await colorField.evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  const menu = await clickUntilMenuOpens(
    page,
    colorField.getByRole("button", { name: "No background currently selected" }),
  );
  await flattenPanel(page, menuPanel);
  return menu;
}

/**
 * Opens the demo document and finds several of its fields, each framed without the space above its heading.
 *
 * @param page - The browser page.
 * @param fields - Names of the fields, keyed by the name each one's file ends in.
 * @returns Each field, keyed by the name its file ends in.
 */
async function frameDemoFields(page: Page, fields: Record<string, string>) {
  await openDemo(page);
  const selectors = Object.values(fields).map((field) => `[data-comments-field-id="${field}"]`);
  await page.addStyleTag({
    content: `
      ${selectors.join(", ")} { ${createFrameStyles("1.5rem")} }
      ${selectors.map((selector) => `${selector} [data-ui="fieldHeaderContentBox"]`).join(", ")} { padding-top: 0 !important; }
    `,
  });
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, findDemoField(page, field)]));
}

/** Every screenshot the script takes. */
const shots: Shot[] = [
  {
    plugin: "handbook",
    name: "handbook-how-to-use",
    open: async (page) => {
      await openHandbookPage(page, "How to use the Handbook");
      return undefined;
    },
  },
  {
    plugin: "handbook",
    name: "handbook-document-types",
    open: async (page) => {
      await openHandbookPage(page, "Document Types");
      return undefined;
    },
  },
  {
    plugin: "handbook",
    name: "handbook-fields",
    open: async (page) => {
      await openHandbookPage(page, "Pages");
      await page.getByText("2 subfields").click();
      return undefined;
    },
  },
  {
    plugin: "handbook",
    name: "handbook-guide",
    open: async (page) => {
      await openHandbookPage(page, "SEO Best Practices");
      return undefined;
    },
  },
  {
    plugin: "handbook",
    name: "handbook-groups",
    open: async (page) => {
      await openStructurePath(page, "handbook");
      await page.getByText("Groups", { exact: true }).waitFor();
      return undefined;
    },
  },
  {
    plugin: "handbook",
    name: "handbook-editor",
    open: async (page) => {
      await openStructurePath(page, `handbookGuides;${seoGuideId}`);
      // The toolbar stays disabled until the editor has had a selection.
      await page.getByText("Page Titles and Meta Descriptions", { exact: true }).click();
      await page.getByTestId("fullscreen-button-expand").click();
      await page.getByTestId("fullscreen-button-collapse").waitFor();
      return undefined;
    },
  },
  {
    plugin: "icon",
    name: "icon-selector",
    open: async (page) => {
      const dialog = await openDemoDialog(page, "icon");
      return dialog;
    },
  },
  {
    plugin: "icon",
    name: "icon-search",
    open: async (page) => {
      const dialog = await openDemoDialog(page, "icon");
      await dialog.getByPlaceholder("Search by name or keyword").fill("next");
      return dialog;
    },
  },
  {
    plugin: "color",
    name: "color-fields",
    open: async (page) => {
      const fields = await frameDemoFields(page, {
        brand: "brandColor",
        feature: "featureColor",
        accent: "accentColor",
      });
      return fields;
    },
  },
  ...["warm", "cool", "image", "neutral", "mixed"].map((palette): Shot => ({
    plugin: "color",
    name: `color-selectors-${palette}`,
    open: async (page) => {
      const menu = await openColorMenu(page, `${palette}Color`);
      return menu;
    },
  })),
  {
    plugin: "link",
    name: "link-dialog",
    open: async (page) => {
      const dialog = await openDemoDialog(page, "link");
      return dialog;
    },
  },
  {
    plugin: "link",
    name: "link-fields",
    open: async (page) => {
      const fields = await frameDemoFields(page, {
        privacy: "privacyLink",
        careers: "careersLink",
        email: "emailLink",
        phone: "phoneLink",
        "press-kit": "pressKitLink",
      });
      return fields;
    },
  },
];

/**
 * Reads the token the Sanity CLI stores when you log in, so the Studio opens signed in.
 *
 * @returns The token.
 * @throws When the CLI isn't logged in.
 */
async function readCliToken() {
  const config: unknown = JSON.parse(await readFile(path.join(homedir(), ".config/sanity/config.json"), "utf8"));

  if (
    typeof config !== "object" ||
    config === null ||
    !("authToken" in config) ||
    typeof config.authToken !== "string"
  ) {
    throw new Error("The Sanity CLI isn't logged in. Run `bunx sanity login`, then try again.");
  }

  return config.authToken;
}

const token = await readCliToken();
const filter = process.argv.slice(2);
const selectedShots = shots.filter(({ name }) => filter.length === 0 || filter.includes(name));
const browser = await webkit.launch();

/**
 * Checks whether a shot returned several named elements rather than one element or none.
 *
 * @param target - What the shot returned.
 * @returns True if it returned several named elements.
 */
function isLocatorSet(target: Locator | Record<string, Locator> | undefined): target is Record<string, Locator> {
  return isDefined(target) && !("screenshot" in target && typeof target.screenshot === "function");
}

/**
 * Waits until nothing on the page is loading, because the Studio keeps a live connection open and the network never
 * goes idle.
 *
 * @param page - The browser page.
 */
async function waitUntilLoaded(page: Page) {
  await page.waitForFunction(
    (selector) => [...document.querySelectorAll(selector)].every((element) => !element.checkVisibility()),
    loadingIndicators,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(
      [...document.images]
        .filter((image) => {
          const { top, bottom } = image.getBoundingClientRect();
          return !image.complete && top < window.innerHeight && bottom > 0;
        })
        .map(async (image) => {
          await image.decode();
        }),
    );
  });
}

/**
 * Saves each part of a screenshot in one appearance.
 *
 * @param parts - Each part's file name, without the appearance suffix, and what to capture.
 * @param folder - The folder to save to.
 * @param colorScheme - The appearance the page is showing.
 * @returns The paths the parts were saved to.
 */
async function saveParts(parts: [string, Locator | Page][], folder: string, colorScheme: "light" | "dark") {
  const files = parts.map(([name]) => path.join(folder, `${name}-${colorScheme}.png`));

  await Promise.all(
    parts.map(async ([, part], index) => {
      await part.screenshot({ path: files[index], animations: "disabled" });
    }),
  );

  return files;
}

/**
 * Takes one screenshot in its own browser page, in the light and then the dark appearance, and saves it to the
 * plugin's folder.
 *
 * @param shot - The screenshot to take.
 * @returns The paths the screenshot was saved to, one for each part and appearance.
 */
async function capture(shot: Shot) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: "light" });
  context.setDefaultTimeout(5000);
  // A Studio that hasn't been opened since it started takes longer than that to load.
  context.setDefaultNavigationTimeout(30_000);

  await context.addInitScript(
    (entries) => {
      for (const [key, value] of entries) localStorage.setItem(key, value);
    },
    [
      [`__studio_auth_token_${projectId}`, JSON.stringify({ token, time: new Date().toISOString() })],
      [commentsOnboardingKey, "true"],
    ] as const,
  );

  const page = await context.newPage();
  const target = await shot.open(page);

  await page.addStyleTag({ content: captureStyles });
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });

  const folder = path.join(import.meta.dirname, ".screenshots", shot.plugin);
  const parts: [string, Locator | Page][] = isLocatorSet(target)
    ? Object.entries(target).map(([key, locator]) => [`${shot.name}-${key}`, locator])
    : [[shot.name, target ?? page]];

  await mkdir(folder, { recursive: true });
  await waitUntilLoaded(page);
  const lightFiles = await saveParts(parts, folder, "light");

  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scheme]")?.dataset["scheme"] === "dark");
  await waitUntilLoaded(page);
  const darkFiles = await saveParts(parts, folder, "dark");

  await context.close();

  return [...lightFiles, ...darkFiles];
}

/**
 * Takes each screenshot in turn, because the Studio shows other sessions of the same user as collaborators.
 *
 * @param queue - The screenshots still to take.
 * @param files - The paths saved so far.
 * @returns The paths of every screenshot saved.
 */
async function captureInTurn(queue: Shot[], files: string[] = []): Promise<string[]> {
  const [next, ...rest] = queue;
  if (!isDefined(next)) return files;

  return captureInTurn(rest, [...files, ...(await capture(next))]);
}

const files = await captureInTurn(selectedShots);

await browser.close();
console.log(files.join("\n"));
