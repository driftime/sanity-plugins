import type { SourceIcon } from "@/build/convert";

/** How to read one icon library's installed package. */
export interface IconAdapter {
  /** Identifier of the library, used in the plugin's configuration. */
  library: string;
  /** Readable name of the library. */
  label: string;
  /** Package the library is installed from, or undefined for a family of packages or the project's own icons. */
  packageName: string | undefined;
  /**
   * Shared start of the names of a family of packages, one per style, such as `@central-icons-react/`. Each installed
   * package becomes a style named after the rest of its name.
   */
  packagePrefix?: string;
  /** Package to suggest installing, for a family of packages. */
  packageExample?: string;
  /**
   * Matches every package the library publishes, such as its versions for each framework, so the Studio can tell a
   * project that uses the library on its site which package to add. Undefined for a family of packages.
   */
  packagePattern?: RegExp;
  /** Styles the library offers, the first being the default. Empty for a family, whose styles are its packages. */
  styles: string[];
  /**
   * Reads every icon of one style.
   *
   * @param context - Where the package is installed, the style to read, and the project folder.
   * @returns The icons as the library ships them.
   */
  read: (context: { directory: string; style: string; root: string }) => Promise<SourceIcon[]>;
}
