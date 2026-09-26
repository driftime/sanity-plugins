import { centralAdapter } from "@/build/adapters/central";
import { heroiconsAdapter } from "@/build/adapters/heroicons";
import { hugeiconsAdapter } from "@/build/adapters/hugeicons";
import { iconoirAdapter } from "@/build/adapters/iconoir";
import { lucideAdapter } from "@/build/adapters/lucide";
import { nucleoAdapter } from "@/build/adapters/nucleo";
import { phosphorAdapter } from "@/build/adapters/phosphor";
import { tablerAdapter } from "@/build/adapters/tabler";
import type { IconAdapter } from "@/build/adapters/types";

/** Every library the build step knows how to read from its package. */
export const iconAdapters: IconAdapter[] = [
  centralAdapter,
  heroiconsAdapter,
  hugeiconsAdapter,
  iconoirAdapter,
  lucideAdapter,
  nucleoAdapter,
  phosphorAdapter,
  tablerAdapter,
];
