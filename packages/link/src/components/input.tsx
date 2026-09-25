import { defaultIconProps } from "@repo/lib/icons";
import { isDefined } from "@repo/lib/utils";
import { CloseIcon } from "@sanity/icons/Close";
import { Box, Button, Dialog, Flex, Stack, Tab, TabList, TabPanel } from "@sanity/ui";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ObjectInputProps, ObjectSchemaType } from "sanity";
import { set, setIfMissing, unset } from "sanity";

import { useDestinationDetail } from "@/hooks/use-destination-detail";
import { LinkIcon } from "@/icons/link";
import { getLinkType, getStaleFields } from "@/lib/link-types";
import type { LinkType } from "@/lib/options";
import { getOfferedLinkTypes, resolveLinkOptions } from "@/lib/options";
import { composeSummary } from "@/lib/summary";
import type { SanityLinkConfig, SanityLinkOptions } from "@/plugin";
import type { SanityLink, SanityLinkDestination } from "@/types";

interface DestinationsProps {
  id: string;
  offered: LinkType[];
  selected: LinkType;
  showTabs: boolean;
  readOnly: boolean | undefined;
  onSelect: (type: SanityLinkDestination) => void;
  children: ReactNode;
}

function Destinations({ id, offered, selected, showTabs, readOnly, onSelect, children }: DestinationsProps) {
  return (
    <Stack gap={4}>
      {showTabs && (
        <TabList gap={1}>
          {offered.map((linkType) => (
            <Tab
              key={linkType.name}
              id={`${id}-tab-${linkType.name}`}
              aria-controls={`${id}-panel`}
              icon={<linkType.icon {...defaultIconProps} />}
              label={linkType.label}
              selected={linkType.name === selected.name}
              disabled={readOnly}
              onClick={() => {
                onSelect(linkType.name);
              }}
            />
          ))}
        </TabList>
      )}
      {showTabs && (
        <TabPanel id={`${id}-panel`} aria-labelledby={`${id}-tab-${selected.name}`} paddingTop={3}>
          {children}
        </TabPanel>
      )}
      {!showTabs && children}
    </Stack>
  );
}

/** Compiled link field type, with the field's own options. */
interface LinkSchemaType extends ObjectSchemaType {
  options?: SanityLinkOptions;
}

export type InputProps = ObjectInputProps<Partial<SanityLink>, LinkSchemaType>;

/**
 * Builds the patches that switch a link to another destination, clearing the fields the previous one set.
 * Otherwise they'd stay hidden in the document and reappear if the author switched back.
 *
 * @param typeName - The link type's schema name.
 * @param type - The new destination.
 * @returns The patches.
 */
function createDestinationPatches(typeName: string, type: SanityLinkDestination) {
  return [
    setIfMissing({ _type: typeName }),
    set(type, ["type" satisfies keyof SanityLink]),
    ...getStaleFields(type).map((field) => unset([field])),
  ];
}

/**
 * Creates the link field input, bound to the plugin's configuration. A field's own destinations replace
 * the plugin's rather than adding to them.
 *
 * @param titleField - The field a linked page's title is read from.
 * @param config - The plugin configuration.
 * @returns The input component.
 */
export function createInput(titleField: string, config: SanityLinkConfig) {
  function Input(props: InputProps) {
    const { id, path, schemaType, value, onChange, readOnly, renderDefault } = props;

    const [open, setOpen] = useState(false);

    const { destinations } = resolveLinkOptions(schemaType.options, config);
    const offered = getOfferedLinkTypes(destinations);
    const [defaultLinkType] = offered;

    const stored = getLinkType(value?.type);
    const selected = stored ?? defaultLinkType;
    const detail = useDestinationDetail(value, titleField);
    const summary = composeSummary(value?.label, detail) ?? stored?.label;
    const Icon = stored?.icon ?? LinkIcon;

    // An array item's path ends in a keyed segment, while a plain field's ends in a name.
    const isArrayItem = typeof path.at(-1) === "object";

    const showTabs = offered.length > 1;

    function handleSelectType(type: SanityLinkDestination) {
      onChange(createDestinationPatches(schemaType.name, type));
    }

    // Array items don't get our button, which normally sets the destination, so it's set on mount instead.
    useEffect(() => {
      if (!isArrayItem || isDefined(stored)) return;

      onChange(createDestinationPatches(schemaType.name, selected.name));
    }, [isArrayItem, stored, selected, onChange, schemaType.name]);

    if (isArrayItem) {
      return (
        <Destinations
          id={id}
          offered={offered}
          selected={selected}
          showTabs={showTabs}
          readOnly={readOnly}
          onSelect={handleSelectType}
        >
          {renderDefault(props)}
        </Destinations>
      );
    }

    return (
      <Flex gap={2}>
        <Button
          id={id}
          type="button"
          mode="ghost"
          icon={<Icon {...defaultIconProps} />}
          text={summary ?? "Add link"}
          disabled={readOnly}
          onClick={() => {
            if (!isDefined(stored)) handleSelectType(selected.name);

            setOpen(true);
          }}
          aria-label={isDefined(summary) ? `Edit link: ${summary}` : "Add link"}
        />
        {isDefined(value) && (
          <Button
            type="button"
            mode="ghost"
            tone="critical"
            icon={<CloseIcon />}
            text="Clear"
            disabled={readOnly}
            onClick={() => {
              onChange(unset());
            }}
            aria-label="Clear the link"
          />
        )}
        {open && (
          <Dialog
            id={`${id}-dialog`}
            header="Link"
            width={1}
            onClose={() => {
              setOpen(false);
            }}
            onClickOutside={() => {
              setOpen(false);
            }}
          >
            <Box padding={4}>
              <Destinations
                id={id}
                offered={offered}
                selected={selected}
                showTabs={showTabs}
                readOnly={readOnly}
                onSelect={handleSelectType}
              >
                {renderDefault(props)}
              </Destinations>
            </Box>
          </Dialog>
        )}
      </Flex>
    );
  }

  return Input;
}
