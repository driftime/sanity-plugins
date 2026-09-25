/** Schema type name of the icon object. */
export const iconTypeName = "icon";

/**
 * Stored icon: its name and the shapes it's drawn from.
 *
 * @public
 */
export interface SanityIcon {
  _type: typeof iconTypeName;
  /** Name of the icon in Lucide. */
  name?: string;
  /** Shapes the icon is drawn from, saved when it's chosen. */
  node?: string;
}
