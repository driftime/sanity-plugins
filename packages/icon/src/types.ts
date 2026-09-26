/** Schema type name of the icon object. */
export const iconTypeName = "icon";

/**
 * Stored icon: which library it came from, its name, and the shapes it's drawn from.
 *
 * @public
 */
export interface SanityIcon {
  _type: typeof iconTypeName;
  /** Identifier of the library the icon came from. */
  library?: string;
  /** Identifier of the library style the icon came from. */
  style?: string;
  /** Name of the icon in its library. */
  name?: string;
  /** Shapes the icon is drawn from, saved when it's chosen. */
  node?: string;
}
