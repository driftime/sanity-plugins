import type { ComponentProps, ComponentType } from "react";

import { ExternalLinkIcon } from "@/icons/external-link";
import { FileDownIcon } from "@/icons/file-down";
import { FileSymlinkIcon } from "@/icons/file-symlink";
import { HashIcon } from "@/icons/hash";
import { MailIcon } from "@/icons/mail";
import { PhoneIcon } from "@/icons/phone";
import type { SanityLinkDestination } from "@/types";

/** One kind of destination a link may point at, as the Studio offers it. */
interface LinkTypeDefinition {
  /** Value stored to discriminate the link. */
  name: SanityLinkDestination;
  /** Icon shown beside the destination wherever it is named. */
  icon: ComponentType<ComponentProps<"svg">>;
  /** The one name this destination goes by, on its tab and anywhere else it is named. */
  label: string;
  /** Fields this destination shows. A field may be shared, as the anchor is by a page and a section. */
  fields: string[];
}

/**
 * The kinds of destination a link may point at, offered in this order. The stored union, the schema's
 * fields, the tabs, and the resolver all follow it.
 */
export const linkTypes = [
  { name: "page", icon: FileSymlinkIcon, label: "Page", fields: ["reference", "anchor", "searchParams"] },
  { name: "anchor", icon: HashIcon, label: "Anchor", fields: ["anchor"] },
  { name: "url", icon: ExternalLinkIcon, label: "URL", fields: ["url"] },
  { name: "email", icon: MailIcon, label: "Email", fields: ["email", "subject"] },
  { name: "phone", icon: PhoneIcon, label: "Phone", fields: ["phone"] },
  { name: "file", icon: FileDownIcon, label: "File", fields: ["file"] },
] as const satisfies LinkTypeDefinition[];

/** Destinations offered where nothing narrows them. */
export const defaultDestinations: SanityLinkDestination[] = linkTypes.map((linkType) => linkType.name);
