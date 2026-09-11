import { isDefined, readPath } from "@repo/lib/utils";
import { useEffect, useState } from "react";
import { useDocumentPreviewStore } from "sanity";

import { getLocalDetail, getReferencedId } from "@/lib/summary";
import type { SanityLink } from "@/types";

/** What was read, kept with the destination it was read for so a stale answer is never shown. */
interface ReadDetail {
  /** Identifier of the destination the description was read for. */
  id: string;
  /** Description of where the link leads, absent when the destination holds nothing to read. */
  detail?: string;
}

/**
 * Describes where a link leads, reading the title or filename held by the document it points at.
 * Read through the Studio's preview store, so links share one subscription and a rename updates them.
 *
 * @param value - The link being authored.
 * @param titleField - Field an internal link's destination holds its title in.
 * @returns Where the link leads, or undefined while it is being read or when there is nothing to read.
 */
export function useDestinationDetail(value: Partial<SanityLink> | undefined, titleField: string) {
  const previewStore = useDocumentPreviewStore();

  const local = getLocalDetail(value);
  const id = getReferencedId(value);
  const isFile = value?.type === "file";

  const [read, setRead] = useState<ReadDetail>();

  useEffect(() => {
    if (!isDefined(id)) return undefined;

    // Held under its own name so the closure below keeps the narrowing the guard above established.
    const destinationId = id;
    const path = (isFile ? "originalFilename" : titleField).split(".");

    const subscription = previewStore.observePaths({ _ref: destinationId }, [path]).subscribe((document) => {
      const detail = readPath(document, path);

      setRead({ id: destinationId, detail: typeof detail === "string" ? detail : undefined });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [previewStore, id, isFile, titleField]);

  const observed = isDefined(read) && read.id === id ? read.detail : undefined;

  return local ?? observed;
}
