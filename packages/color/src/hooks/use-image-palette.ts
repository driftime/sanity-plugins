import { isDefined } from "@repo/lib/utils";
import { useEffect, useState } from "react";
import { useClient } from "sanity";

import { apiVersion } from "@/config/defaults";
import { imagePaletteQuery } from "@/groq/documents";
import type { SanityImagePalette } from "@/types";

/**
 * Reads the palette Sanity derived for an image, which the form holds only a reference to. Nothing
 * is fetched until a field actually names an image, so a color field without swatches makes no
 * request at all.
 *
 * @param reference - Identifier of the image asset to read.
 * @returns The palette, or undefined until it arrives.
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
        // A palette that cannot be read simply offers no swatches, which is not worth reporting.
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
