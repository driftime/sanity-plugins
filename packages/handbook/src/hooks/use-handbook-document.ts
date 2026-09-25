import { useEffect, useState } from "react";
import { useClient } from "sanity";

import { apiVersion } from "@/config/defaults";
import { handbookDocumentsQuery, handbookQuery } from "@/groq/documents";
import { fetchQuery } from "@/lib/groq";
import type { SanityHandbook } from "@/types";

/**
 * Fetches the Handbook document with its guides expanded, refetching when any Handbook document changes.
 *
 * @returns The Handbook document, and whether it's still loading.
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
