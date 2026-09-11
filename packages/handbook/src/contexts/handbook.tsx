import { isDefined } from "@repo/lib/utils";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { logger } from "@/config/defaults";
import { useHandbookDocument } from "@/hooks/use-handbook-document";
import type { SanityHandbookBlockDefinition, SanityHandbookDocumentRole } from "@/plugin";
import type { SanityHandbook } from "@/types";

/** Plugin configuration with every optional value already resolved to a concrete one. */
export interface HandbookProviderConfig {
  /** Heading displayed at the top of the sidebar. */
  sidebarTitle: string;
  /** Document roles from the plugin configuration. */
  roles: SanityHandbookDocumentRole[];
  /** Custom block definitions registered by the consumer. */
  blocks: SanityHandbookBlockDefinition[];
  /** Fallback message shown when a field has no description. */
  undocumentedFieldMessage: string;
}

/** Provider configuration alongside the tab and sidebar state the panes share. */
type HandbookContextValues = HandbookProviderConfig & {
  /** Identifier of the currently selected tab, or undefined when none is selected. */
  activeTab: string | undefined;
  /** Whether the sidebar is currently expanded. */
  sidebarExpanded: boolean;
  /** Whether Handbook data is still loading from the dataset. */
  loading: boolean;
  /** Handbook singleton fetched from the dataset. */
  handbook: SanityHandbook | undefined;
  /** Sets the active tab by identifier. */
  setActiveTab: (id: string) => void;
  /** Toggles the sidebar expanded state. */
  setSidebarExpanded: (expanded: boolean) => void;
};

export type HandbookProviderProps = HandbookProviderConfig & {
  children: ReactNode;
};

const HandbookContext = createContext<HandbookContextValues | undefined>(undefined);

/**
 * Accesses the Handbook context for tab state and plugin configuration.
 *
 * @returns The resolved plugin configuration alongside the state the panes share.
 * @throws If used outside the provider.
 */
export function useHandbookContext() {
  const handbookContext = useContext(HandbookContext);

  if (!isDefined(handbookContext)) {
    throw new Error(logger.format("Handbook context is only available inside the Handbook provider."));
  }

  return handbookContext;
}

/**
 * Provides the tab state the sidebar and content panes share, alongside the plugin configuration and
 * the handbook singleton fetched from the dataset.
 *
 * @returns The provider wrapping its children.
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
