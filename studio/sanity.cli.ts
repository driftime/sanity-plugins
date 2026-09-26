import { withIcons } from "@driftime/sanity-plugin-icon/vite";
import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "@/environment";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  vite: (config) => withIcons()({ ...config, resolve: { ...config.resolve, tsconfigPaths: true } }),
});
