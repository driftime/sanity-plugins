import { parentPort, workerData } from "node:worker_threads";

import { isDefined, isRecord } from "@repo/lib/utils";

import { createCustomAdapter } from "@/build/adapters/custom";
import { iconAdapters } from "@/build/adapters/index";

/**
 * Reads one library style in a worker thread, so every package is imported afresh, and posts the icons back.
 *
 * @param data - The library, style, and where to read from.
 * @returns The icons as the library ships them.
 */
async function readInWorker(data: unknown) {
  if (!isRecord(data)) return [];

  const { library, folder, style, root, directory } = data;
  if (typeof library !== "string" || typeof style !== "string") return [];
  if (typeof root !== "string" || typeof directory !== "string") return [];

  const adapter =
    typeof folder === "string"
      ? createCustomAdapter(library, folder)
      : iconAdapters.find((candidate) => candidate.library === library);

  if (!isDefined(adapter)) return [];

  const icons = await adapter.read({ directory, style, root });

  return icons;
}

parentPort?.postMessage(await readInWorker(workerData));
