import { guideFragment } from "@/groq/fragments";
import { defineTypedQuery } from "@/lib/groq";
import type { SanityHandbook, SanityHandbookGuide } from "@/types";
import { guideTypeName, handbookTypeName } from "@/types";

/** Fetches the Handbook singleton with expanded guide references. */
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

/** Matches the documents whose changes the Handbook tool refetches on. */
export const handbookDocumentsQuery = defineTypedQuery<SanityHandbook | SanityHandbookGuide>(
  `*[_type == "${handbookTypeName}" || _type == "${guideTypeName}"]`,
);
