import { isDefined } from "@repo/lib/utils";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { logger } from "@/config/defaults";
import { useHandbookDocument } from "@/hooks/use-handbook-document";
import type { SanityHandbookBlockDefinition, SanityHandbookDocumentRole } from "@/plugin";
import type { SanityHandbook } from "@/types";

/** Plugin configuration with every default applied. */
export interface HandbookProviderConfig {
  /** Heading at the top of the sidebar. */
  sidebarTitle: string;
  /** Document roles from the plugin configuration. */
  roles: SanityHandbookDocumentRole[];
  /** Custom blocks added by the site. */
  blocks: SanityHandbookBlockDefinition[];
  /** Message shown for fields without a description. */
  undocumentedFieldMessage: string;
}

/** Provider configuration plus the tab and sidebar state shared by the panes. */
type HandbookContextValues = HandbookProviderConfig & {
  /** ID of the selected tab, or undefined when none is selected. */
  activeTab: string | undefined;
  /** Whether the sidebar is expanded. */
  sidebarExpanded: boolean;
  /** Whether the Handbook document is still loading. */
  loading: boolean;
  /** Handbook document fetched from the dataset. */
  handbook: SanityHandbook | undefined;
  /** Selects a tab by ID. */
  setActiveTab: (id: string) => void;
  /** Expands or collapses the sidebar. */
  setSidebarExpanded: (expanded: boolean) => void;
};

export type HandbookProviderProps = HandbookProviderConfig & {
  children: ReactNode;
};

const HandbookContext = createContext<HandbookContextValues | undefined>(undefined);

/**
 * Reads the Handbook context.
 *
 * @returns The plugin configuration and the shared pane state.
 * @throws When used outside the provider.
 */
export function useHandbookContext() {
  const handbookContext = useContext(HandbookContext);

  if (!isDefined(handbookContext)) {
    throw new Error(logger.format("Handbook context is only available inside the Handbook provider."));
  }

  return handbookContext;
}

/**
 * Provides the plugin configuration, the Handbook document, and the tab state shared by the sidebar and
 * content panes.
 *
 * @returns The provider.
 */
export function HandbookProvider({
  sidebarTitle,
  roles,
  blocks,
  undocumentedFieldMessage,
  children,
}: HandbookProviderProps) {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { handbook, loading } = useHandbookDocument();

  return (
    <HandbookContext
      value={{
        sidebarTitle,
        roles,
        blocks,
        undocumentedFieldMessage,
        activeTab,
        sidebarExpanded,
        loading,
        handbook,
        setActiveTab,
        setSidebarExpanded,
      }}
    >
      {children}
    </HandbookContext>
  );
}
