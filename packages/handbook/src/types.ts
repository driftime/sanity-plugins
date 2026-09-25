import type {
  KeyedSegment,
  PortableTextBlock,
  PortableTextObject,
  PortableTextSpan,
  PortableTextTextBlock,
  SanityDocument,
} from "sanity";

/** Removes a type's index signatures, so a misspelt property is an error rather than `unknown`. */
export type Strict<T> = { [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K] };

/** Array whose items carry the `_key` Sanity gives array members. */
export type SanityKeyedArray<T> = (KeyedSegment & T)[];

/**
 * A Handbook guide, written in rich text and shown in the tool.
 *
 * @public
 */
export type SanityHandbookGuide = Strict<SanityDocument> & {
  _type: typeof guideTypeName;
  /** Guide title. */
  title: string;
  /** Short description below the guide heading. */
  description?: string;
  /** Portable Text content. */
  content: SanityKeyedArray<PortableTextBlock>;
};

/** Schema type name of the guide document. */
export const guideTypeName = "handbook.guide";

/**
 * A group of guides in the sidebar, in order.
 *
 * @public
 */
export interface SanityHandbookGuideGroup {
  /** Group title in the sidebar. */
  title: string;
  /** Guides in the group, in order. */
  guides: SanityKeyedArray<SanityHandbookGuide>;
}

/**
 * The Handbook document, listing the guide groups in sidebar order.
 *
 * @public
 */
export type SanityHandbook = Strict<SanityDocument> & {
  _type: typeof handbookTypeName;
  /** Guide groups, in order. */
  groups: SanityKeyedArray<SanityHandbookGuideGroup>;
};

/** Schema type name of the Handbook document. */
export const handbookTypeName = "handbook.handbook";

/**
 * An image in a guide, with its caption and alternative text.
 *
 * @public
 */
export type SanityHandbookImage = Strict<PortableTextObject> & {
  _type: typeof imageTypeName;
  /** Image asset, reduced by the query to its URL. */
  asset?: { url?: string };
  /** Text shown below the image. */
  caption?: string;
  /** Alternative text. */
  alt?: string;
};

/** Schema type name of the image block. */
export const imageTypeName = "handbook.image";

/**
 * A video in a guide, with its caption.
 *
 * @public
 */
export type SanityHandbookVideo = Strict<PortableTextObject> & {
  _type: typeof videoTypeName;
  /** Video asset, reduced by the query to its URL. */
  asset?: { url?: string };
  /** Text shown below the video. */
  caption?: string;
};

/** Schema type name of the video block. */
export const videoTypeName = "handbook.video";

/**
 * A code block, highlighted for its language.
 *
 * @public
 */
export type SanityHandbookCode = Strict<PortableTextObject> & {
  _type: typeof codeTypeName;
  /** Code to display. */
  code?: string;
  /** Language used for syntax highlighting. */
  language?: string;
};

/** Schema type name of the code block. */
export const codeTypeName = "handbook.code";

/**
 * Kind of callout, which sets its icon and tone.
 *
 * @public
 */
export type SanityHandbookCalloutVariant = "tip" | "info" | "warning";

/**
 * A highlighted message in a guide.
 *
 * @public
 */
export type SanityHandbookCallout = Strict<PortableTextObject> & {
  _type: typeof calloutTypeName;
  /** Kind of callout. */
  variant: SanityHandbookCalloutVariant;
  /** Portable Text inside the callout, without inline objects. */
  body: SanityKeyedArray<PortableTextTextBlock<PortableTextSpan>>;
};

/** Schema type name of the callout block. */
export const calloutTypeName = "handbook.callout";

/**
 * A divider between sections of a guide.
 *
 * @public
 */
export type SanityHandbookHorizontalRule = Strict<PortableTextObject> & {
  _type: typeof horizontalRuleTypeName;
};

/** Schema type name of the horizontal rule block. */
export const horizontalRuleTypeName = "handbook.horizontalRule";

/**
 * A link on a run of guide text.
 *
 * @public
 */
export type SanityHandbookLink = Strict<PortableTextObject> & {
  _type: "link";
  /** Web address the link points to. */
  href?: string;
};
