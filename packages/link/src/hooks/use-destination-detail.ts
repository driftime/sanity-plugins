import { isDefined, readPath } from "@repo/lib/utils";
import { useEffect, useState } from "react";
import { useDocumentPreviewStore } from "sanity";

import { getLocalDetail, getReferencedId } from "@/lib/summary";
import type { SanityLink } from "@/types";

/** A fetched description, kept with its destination so an outdated one is never shown. */
interface ReadDetail {
  /** ID of the destination the description belongs to. */
  id: string;
  /** Description of the destination, or undefined when there's nothing to show. */
  detail?: string;
}

/**
 * Describes where a link leads, using the title or filename of the document it points to. It reads
 * through the Studio's preview store, so it updates when that document changes.
 *
 * @param value - The link being edited.
 * @param titleField - The field a linked page's title is read from.
 * @returns The description, or undefined while loading or when there's nothing to show.
 */
export function useDestinationDetail(value: Partial<SanityLink> | undefined, titleField: string) {
  const previewStore = useDocumentPreviewStore();

  const local = getLocalDetail(value);
  const id = getReferencedId(value);
  const isFile = value?.type === "file";

  const [read, setRead] = useState<ReadDetail>();

  useEffect(() => {
    if (!isDefined(id)) return undefined;

    // Copied to a constant so the closure below keeps the guard's narrowing.
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
