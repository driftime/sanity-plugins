/** Schema type name of the link object. */
export const linkTypeName = "link";

/**
 * Schema type name of the link annotation. It's stored as `_type`, which is how the label field and the resolver
 * tell annotations from link fields.
 */
export const linkMarkTypeName = "linkMark";

/** Schema type name of a page link's query parameter. */
export const searchParamTypeName = "linkSearchParam";

/** Kinds of destination, in the order the Studio offers them. */
export const linkDestinations = ["page", "anchor", "url", "email", "phone", "file"] as const;

/**
 * The kind of destination a link points to.
 *
 * @public
 */
export type SanityLinkDestination = (typeof linkDestinations)[number];

/**
 * A document's route parameter values, present when the query includes the route parameters fragment.
 *
 * @public
 */
export type SanityLinkRouteParams = Record<string, string | null | undefined>;

/**
 * Reference to a document, or the document itself once a query expands it.
 *
 * @public
 */
export type SanityLinkReference<T> = { _ref: string } | T;

/**
 * The document a page link points to, with the fields resolution reads. Narrow it to the site's own
 * document type wherever links are typed.
 *
 * @public
 */
export interface SanityLinkDocument {
  _id: string;
  _type: string;
  /** Route parameter values, or undefined when the query didn't fetch them. */
  _routeParams?: SanityLinkRouteParams;
  /** Title used as the link text when there's no label. */
  title?: string;
}

/**
 * The file asset a file link points to, with the fields resolution reads.
 *
 * @public
 */
export interface SanityLinkFileAsset {
  _id: string;
  _type: string;
  /** URL the file is served from. */
  url?: string;
  /** Name the file was uploaded with, used as the downloaded file's name. */
  originalFilename?: string;
}

/**
 * File field whose asset reference may be expanded.
 *
 * @public
 */
export interface SanityLinkFile {
  _type: "file";
  /** The uploaded file. */
  asset?: SanityLinkReference<SanityLinkFileAsset>;
}

/**
 * A query parameter added to a page link's address.
 *
 * @public
 */
export interface SanityLinkSearchParam {
  _type: typeof searchParamTypeName;
  _key: string;
  /** Parameter name. */
  key?: string;
  /** Parameter value. */
  value?: string;
}

/**
 * A link to a page on the site. It references the document rather than storing its address, so it keeps
 * working when the slug changes.
 *
 * @public
 */
export interface SanityPageLink<TDocument = SanityLinkDocument> {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "page";
  /** Document the link points to. */
  reference?: SanityLinkReference<TDocument>;
  /** Section of the page to link to, without the leading `#`. */
  anchor?: string;
  /** Query parameters added to the address. */
  searchParams?: SanityLinkSearchParam[];
  /** Link text, used instead of the page's title. */
  label?: string;
}

/**
 * A link to a section of the current page.
 *
 * @public
 */
export interface SanityAnchorLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "anchor";
  /** Section to link to, without the leading `#`. */
  anchor?: string;
  /** Link text. */
  label?: string;
}

/**
 * A link to a web address.
 *
 * @public
 */
export interface SanityUrlLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "url";
  /** Full URL, including the scheme. */
  url?: string;
  /** Link text. */
  label?: string;
}

/**
 * A link that opens an email to an address.
 *
 * @public
 */
export interface SanityEmailLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "email";
  /** Recipient's address. */
  email?: string;
  /** Subject line. */
  subject?: string;
  /** Link text. */
  label?: string;
}

/**
 * A link that calls a phone number.
 *
 * @public
 */
export interface SanityPhoneLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "phone";
  /** Phone number. */
  phone?: string;
  /** Link text. */
  label?: string;
}

/**
 * A link that downloads a file stored with the link.
 *
 * @public
 */
export interface SanityFileLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  /** Kind of destination. */
  type: "file";
  /** The file to download. */
  file?: SanityLinkFile;
  /** Link text. */
  label?: string;
}

/**
 * A stored link, discriminated by its kind of destination.
 *
 * @public
 */
export type SanityLink<TDocument = SanityLinkDocument> =
  | SanityPageLink<TDocument>
  | SanityAnchorLink
  | SanityUrlLink
  | SanityEmailLink
  | SanityPhoneLink
  | SanityFileLink;
