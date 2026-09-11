import type {
  KeyedSegment,
  PortableTextBlock,
  PortableTextObject,
  PortableTextSpan,
  PortableTextTextBlock,
  SanityDocument,
} from "sanity";

/**
 * Drops a type's catch-all index signature, so a mistyped field name is an error rather than an
 * unknown value.
 *
 */
export type Strict<T> = { [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K] };

/**
 * Array of objects each carrying the key Sanity assigns to array items, keeping members identifiable.
 *
 */
export type SanityKeyedArray<T> = (KeyedSegment & T)[];

/**
 * A single Handbook page, authored as rich text and rendered in the tool.
 *
 * @public
 */
export type SanityHandbookGuide = Strict<SanityDocument> & {
  _type: typeof guideTypeName;
  /** Display title for this guide. */
  title: string;
  /** Brief description shown beneath the guide heading. */
  description?: string;
  /** Portable Text content of the guide. */
  content: SanityKeyedArray<PortableTextBlock>;
};

/** Document type name of an individual guide. */
export const guideTypeName = "handbook.guide";

/**
 * A titled run of guides in the sidebar, holding them in the order they appear.
 *
 * @public
 */
export interface SanityHandbookGuideGroup {
  /** Display title for this group in the sidebar. */
  title: string;
  /** Ordered array of guide references. */
  guides: SanityKeyedArray<SanityHandbookGuide>;
}

/**
 * The singleton naming every guide group and the order the sidebar lists them in.
 *
 * @public
 */
export type SanityHandbook = Strict<SanityDocument> & {
  _type: typeof handbookTypeName;
  /** Ordered array of groups, each containing a title and guide references. */
  groups: SanityKeyedArray<SanityHandbookGuideGroup>;
};

/** Document type name of the Handbook singleton. */
export const handbookTypeName = "handbook.handbook";

/**
 * An image placed in a guide, with the caption and alternative text shown alongside it.
 *
 * @public
 */
export type SanityHandbookImage = Strict<PortableTextObject> & {
  _type: typeof imageTypeName;
  /** Uploaded image asset, narrowed by the query to the URL the viewer renders. */
  asset?: { url?: string };
  /** Text displayed beneath the image. */
  caption?: string;
  /** Alternative text for screen readers. */
  alt?: string;
};

/** Type name of the image block. */
export const imageTypeName = "handbook.image";

/**
 * A video placed in a guide, with the caption shown beneath it.
 *
 * @public
 */
export type SanityHandbookVideo = Strict<PortableTextObject> & {
  _type: typeof videoTypeName;
  /** Uploaded video asset, narrowed by the query to the URL the viewer renders. */
  asset?: { url?: string };
  /** Text displayed beneath the video. */
  caption?: string;
};

/** Type name of the video block. */
export const videoTypeName = "handbook.video";

/**
 * A block of source code, rendered with syntax highlighting for its language.
 *
 * @public
 */
export type SanityHandbookCode = Strict<PortableTextObject> & {
  _type: typeof codeTypeName;
  /** Source code to display. */
  code?: string;
  /** Programming language used for syntax highlighting. */
  language?: string;
};

/** Type name of the code block. */
export const codeTypeName = "handbook.code";

/**
 * The intent a callout is drawn with, choosing its icon and tone.
 *
 * @public
 */
export type SanityHandbookCalloutVariant = "tip" | "info" | "warning";

/**
 * A highlighted message set apart from the surrounding guide text.
 *
 * @public
 */
export type SanityHandbookCallout = Strict<PortableTextObject> & {
  _type: typeof calloutTypeName;
  /** Visual style and intent of the callout. */
  variant: SanityHandbookCalloutVariant;
  /** Portable Text content displayed inside the callout, which offers no inline objects. */
  body: SanityKeyedArray<PortableTextTextBlock<PortableTextSpan>>;
};

/** Type name of the callout block. */
export const calloutTypeName = "handbook.callout";

/**
 * A divider between sections of a guide, carrying no authored content of its own.
 *
 * @public
 */
export type SanityHandbookHorizontalRule = Strict<PortableTextObject> & {
  _type: typeof horizontalRuleTypeName;
};

/** Type name of the horizontal rule block. */
export const horizontalRuleTypeName = "handbook.horizontalRule";

/**
 * A web address applied to a run of guide text.
 *
 * @public
 */
export type SanityHandbookLink = Strict<PortableTextObject> & {
  _type: "link";
  /** Web address the link points to. */
  href?: string;
};
