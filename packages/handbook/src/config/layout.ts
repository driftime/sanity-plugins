/** Default sidebar width in pixels, until it's resized. */
export const sidebarWidth = 350;

/** Minimum sidebar width in pixels before it collapses to a vertical label. */
export const sidebarMinimumWidth = 320;

/** Maximum sidebar width in pixels. */
export const sidebarMaximumWidth = 640;

/** Minimum content pane width in pixels. */
export const contentMinimumWidth = 320;

/** Share of the space the content pane takes relative to the sidebar. */
export const contentFlex = 2.5;

/** Width in pixels of a pane collapsed to a vertical label. */
export const collapsedPaneWidth = 51;

/** Estimated sidebar row height in pixels, corrected once rows are measured. */
export const sidebarItemHeight = 37;

/** Minimum tool width in pixels before the Studio scrolls horizontally. */
export const toolMinimumWidth = 320;

/** Maximum width in pixels of the text column in the content pane. */
export const contentWidth = 640;

/** Space in pixels on either side of the text column. */
export const contentPaddingInline = 20;

/** Space in pixels above a content panel's heading. */
export const contentPaddingBlockStart = 32;

/** Space in pixels below a content panel's last element, so long content doesn't end at the pane's edge. */
export const contentPaddingBlockEnd = 220;

/** Vertical spacing in pixels for guide content and content panels. */
export const contentSpacing = {
  section: 48,
  paragraph: 16,
  heading: 48,
  media: 24,
  callout: 32,
  blockquote: 32,
  list: 32,
  nestedList: 12,
  rule: 40,
};
