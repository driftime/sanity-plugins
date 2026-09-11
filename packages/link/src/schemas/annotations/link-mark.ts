import { createSanityIcon } from "@repo/lib/icons";
import { defineArrayMember } from "sanity";

import { LinkIcon } from "@/icons/link";
import type { SanityLink } from "@/types";
import { linkMarkTypeName, linkTypeName } from "@/types";

/**
 * The link as a Portable Text annotation, for a consumer's own text types to offer alongside their
 * other annotations. An annotated link takes the text it wraps as its label, so it never asks for
 * one of its own.
 *
 * @public
 */
export const linkAnnotation = defineArrayMember({
  // The name differs from the type deliberately: it is the name that gets stored as `_type`.
  name: linkMarkTypeName satisfies SanityLink["_type"],
  type: linkTypeName,
  title: "Link",
  icon: createSanityIcon(LinkIcon),
});
