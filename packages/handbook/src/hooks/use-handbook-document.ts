import { useEffect, useState } from "react";
import { useClient } from "sanity";

import { apiVersion } from "@/config/defaults";
import { handbookDocumentsQuery, handbookQuery } from "@/groq/documents";
import { fetchQuery } from "@/lib/groq";
import type { SanityHandbook } from "@/types";

/**
 * Fetches the Handbook singleton from the dataset with its guide references expanded, refetching
 * whenever one of the documents it draws on changes.
 *
 * @returns The Handbook and a flag for whether it is still loading.
 */
export function useHandbookDocument() {
  const client = useClient({ apiVersion });
  const [handbook, setHandbook] = useState<SanityHandbook | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHandbook() {
      setHandbook(await fetchQuery(client, handbookQuery));
      setLoading(false);
    }

    void fetchHandbook();

    const subscription = client.listen(handbookDocumentsQuery).subscribe(() => {
      void fetchHandbook();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return { handbook, loading };
}
