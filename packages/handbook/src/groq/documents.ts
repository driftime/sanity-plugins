import { guideFragment } from "@/groq/fragments";
import { defineTypedQuery } from "@/lib/groq";
import type { SanityHandbook, SanityHandbookGuide } from "@/types";
import { guideTypeName, handbookTypeName } from "@/types";

/** Handbook document with its guide references expanded. */
export const handbookQuery = defineTypedQuery<SanityHandbook>(`
  *[_type == "${handbookTypeName}"][0] {
    ...,
    groups[] {
      ...,
      guides[] {
        ...,
        ${guideFragment}
      }
    }
  }
`);

/** Handbook and guide documents, listened to so the tool refetches when they change. */
export const handbookDocumentsQuery = defineTypedQuery<SanityHandbook | SanityHandbookGuide>(
  `*[_type == "${handbookTypeName}" || _type == "${guideTypeName}"]`,
);
