/** Type name of the link object. */
export const linkTypeName = "link";

/**
 * Type name a link takes as a Portable Text annotation. It is stored as `_type`, which is how the
 * label field and the resolver tell an annotated span from a link field.
 */
export const linkMarkTypeName = "linkMark";

/** Type name of one search parameter on an internal link. */
export const searchParamTypeName = "linkSearchParam";

/** Kinds of destination a link may point at, in the order the Studio offers them. */
export const linkDestinations = ["page", "anchor", "url", "email", "phone", "file"] as const;

/**
 * Which kind of destination a link points at, discriminating the stored union.
 *
 * @public
 */
export type SanityLinkDestination = (typeof linkDestinations)[number];

/**
 * Values filling a document's route parameters, present once a query spreads the route params fragment.
 *
 * @public
 */
export type SanityLinkRouteParams = Record<string, string | null | undefined>;

/**
 * A pointer to another document, holding the raw reference until a query expands it into the document
 * itself.
 *
 * @public
 */
export type SanityLinkReference<T> = { _ref: string } | T;

/**
 * The document an internal link points at, holding as much of it as resolution reads. Narrow this to
 * a consumer's own routed document type wherever a stored link is typed.
 *
 * @public
 */
export interface SanityLinkDocument {
  _id: string;
  _type: string;
  /** Values filling this document's route parameters, absent when its query left them unfetched. */
  _routeParams?: SanityLinkRouteParams;
  /** Title the link borrows when no label was written. */
  title?: string;
}

/**
 * The file a download link serves, holding as much of it as resolution reads.
 *
 * @public
 */
export interface SanityLinkFileAsset {
  _id: string;
  _type: string;
  /** Address the file is served from. */
  url?: string;
  /** Name the file was uploaded under, offered to the browser as the name to save it by. */
  originalFilename?: string;
}

/**
 * A file field, whose asset stays a raw reference until a query expands it.
 *
 * @public
 */
export interface SanityLinkFile {
  _type: "file";
  /** The uploaded file itself. */
  asset?: SanityLinkReference<SanityLinkFileAsset>;
}

/**
 * One query string parameter appended to an internal link's address.
 *
 * @public
 */
export interface SanityLinkSearchParam {
  _type: typeof searchParamTypeName;
  _key: string;
  /** Name the parameter is read under. */
  key?: string;
  /** Value the parameter carries. */
  value?: string;
}

/**
 * A link to a page on the site itself, pointing at the document rather than its address so the link
 * survives that document's slug changing.
 *
 * @public
 */
export interface SanityPageLink<TDocument = SanityLinkDocument> {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "page";
  /** Document the link points at. */
  reference?: SanityLinkReference<TDocument>;
  /** Section of the destination page to arrive at, stored without its leading hash. */
  anchor?: string;
  /** Query string parameters appended to the destination's address. */
  searchParams?: SanityLinkSearchParam[];
  /** Text a visitor reads, standing in front of the destination document's own title. */
  label?: string;
}

/**
 * A link to a section of the page it is drawn on, for moving a visitor within a page rather than
 * between them.
 *
 * @public
 */
export interface SanityAnchorLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "anchor";
  /** Section of this page to arrive at, stored without its leading hash. */
  anchor?: string;
  /** Text a visitor reads. */
  label?: string;
}

/**
 * A link to an address elsewhere, covering any web page the site does not serve itself.
 *
 * @public
 */
export interface SanityUrlLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "url";
  /** Address the link points at, including the scheme in front of it. */
  url?: string;
  /** Text a visitor reads. */
  label?: string;
}

/**
 * A link that opens a message to an address, rather than asking an author to know a URI scheme.
 *
 * @public
 */
export interface SanityEmailLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "email";
  /** Address the message is sent to. */
  email?: string;
  /** Subject the message opens with. */
  subject?: string;
  /** Text a visitor reads. */
  label?: string;
}

/**
 * A link that starts a call to a number, rather than asking an author to know a URI scheme.
 *
 * @public
 */
export interface SanityPhoneLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "phone";
  /** Number the call is placed to. */
  phone?: string;
  /** Text a visitor reads. */
  label?: string;
}

/**
 * A link to a file a visitor downloads, held with the link rather than addressed elsewhere.
 *
 * @public
 */
export interface SanityFileLink {
  _type: typeof linkTypeName | typeof linkMarkTypeName;
  type: "file";
  /** File the link serves. */
  file?: SanityLinkFile;
  /** Text a visitor reads. */
  label?: string;
}

/**
 * A link an author authored, discriminated by the kind of destination it points at.
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
