import type { ComponentProps, ComponentType } from "react";

import { ExternalLinkIcon } from "@/icons/external-link";
import { FileDownIcon } from "@/icons/file-down";
import { FileSymlinkIcon } from "@/icons/file-symlink";
import { HashIcon } from "@/icons/hash";
import { MailIcon } from "@/icons/mail";
import { PhoneIcon } from "@/icons/phone";
import type { SanityLinkDestination } from "@/types";

/** A kind of destination, as offered in the Studio. */
interface LinkTypeDefinition {
  /** Value stored to identify the destination. */
  name: SanityLinkDestination;
  /** Icon shown wherever the destination is named. */
  icon: ComponentType<ComponentProps<"svg">>;
  /** Name shown on its tab and anywhere else it's named. */
  label: string;
  /** Fields this destination shows. A field can be shared, as the anchor is by page and anchor links. */
  fields: string[];
}

/**
 * The kinds of destination, in the order offered. The stored union, schema fields, tabs, and resolver all
 * follow this order.
 */
export const linkTypes = [
  { name: "page", icon: FileSymlinkIcon, label: "Page", fields: ["reference", "anchor", "searchParams"] },
  { name: "anchor", icon: HashIcon, label: "Anchor", fields: ["anchor"] },
  { name: "url", icon: ExternalLinkIcon, label: "URL", fields: ["url"] },
  { name: "email", icon: MailIcon, label: "Email", fields: ["email", "subject"] },
  { name: "phone", icon: PhoneIcon, label: "Phone", fields: ["phone"] },
  { name: "file", icon: FileDownIcon, label: "File", fields: ["file"] },
] as const satisfies LinkTypeDefinition[];

/** Destinations offered when none are configured. */
export const defaultDestinations: SanityLinkDestination[] = linkTypes.map((linkType) => linkType.name);
