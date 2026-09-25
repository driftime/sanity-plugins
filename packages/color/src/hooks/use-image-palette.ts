import { isDefined } from "@repo/lib/utils";
import { useEffect, useState } from "react";
import { useClient } from "sanity";

import { apiVersion } from "@/config/defaults";
import { imagePaletteQuery } from "@/groq/documents";
import type { SanityImagePalette } from "@/types";

/**
 * Loads the palette Sanity generated for an image. Nothing is fetched until a field names an image.
 *
 * @param reference - The image asset ID.
 * @returns The palette, or undefined until it loads.
 */
export function useImagePalette(reference: string | undefined) {
  const client = useClient({ apiVersion });
  const [palette, setPalette] = useState<SanityImagePalette>();

  useEffect(() => {
    let active = true;

    async function load() {
      if (!isDefined(reference)) {
        setPalette(undefined);

        return;
      }

      try {
        const result = await client.fetch<SanityImagePalette | undefined>(imagePaletteQuery, { id: reference });

        if (active) setPalette(result);
      } catch {
        // An unreadable palette just offers no swatches.
        if (active) setPalette(undefined);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [client, reference]);

  return palette;
}
