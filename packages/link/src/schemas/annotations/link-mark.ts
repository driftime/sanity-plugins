import { createSanityIcon } from "@repo/lib/icons";
import { defineArrayMember } from "sanity";

import { LinkIcon } from "@/icons/link";
import type { SanityLink } from "@/types";
import { linkMarkTypeName, linkTypeName } from "@/types";

/**
 * The link as a Portable Text annotation, for adding to a site's own text types. Its label is the text it
 * wraps, so it has no label field.
 *
 * @public
 */
export const linkAnnotation = defineArrayMember({
  // Named differently from the type on purpose, since the name is what's stored as `_type`.
  name: linkMarkTypeName satisfies SanityLink["_type"],
  type: linkTypeName,
  title: "Link",
  icon: createSanityIcon(LinkIcon),
});
