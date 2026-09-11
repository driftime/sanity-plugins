import { convertCase, isDefined } from "@repo/lib/utils";
import { ChevronDownIcon } from "@sanity/icons/ChevronDown";
import { ChevronRightIcon } from "@sanity/icons/ChevronRight";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import type { StackProps } from "@sanity/ui";
import { useState } from "react";
import type { FieldDefinition } from "sanity";
import { useSchema } from "sanity";

import { FieldHints } from "@/components/documentation/hints";
import { useHandbookContext } from "@/contexts/handbook";
import { resolveDescription, resolveTitle } from "@/lib/display";
import type { NormalizedField } from "@/lib/schema";
import { getSubfields } from "@/lib/schema";

export type DocumentedFieldProps = StackProps & {
  field: FieldDefinition | NormalizedField;
  ancestors?: Set<string>;
};

/** Shared empty ancestor set, so the default prop keeps a stable reference across renders. */
const noAncestors = new Set<string>();

export function DocumentedField({ field, ancestors = noAncestors, ...props }: DocumentedFieldProps) {
  const schema = useSchema();
  const { undocumentedFieldMessage } = useHandbookContext();
  const [expanded, setExpanded] = useState(false);

  const effectiveTitle = resolveTitle(field);
  const effectiveDescription = resolveDescription(field) ?? undocumentedFieldMessage;

  const { example, tip, info, caution } = field.handbook ?? {};
  const hasHints = isDefined([tip, info, caution]);

  const isCycle = ancestors.has(field.type);
  const subfields = isCycle ? undefined : getSubfields(field, schema);
  const hasSubfields = isDefined(subfields);

  return (
    <Stack gap={2} {...props}>
      <Stack gap={3}>
        <Flex align="center" paddingY={1} gap={2}>
          <Box flex={1}>
            <Flex align="center" gap={2}>
              <Text size={1} weight="medium">
                {effectiveTitle}
              </Text>
              <Text size={0} muted style={{ marginTop: 2 }}>
                {field.type}
              </Text>
            </Flex>
          </Box>
          {hasHints && <FieldHints tip={tip} info={info} caution={caution} />}
        </Flex>
        {isDefined(effectiveDescription) && (
          <Text size={1} muted>
            {effectiveDescription}
          </Text>
        )}
        {isDefined(example) && (
          <Box marginTop={1}>
            <Text size={1} muted style={{ fontStyle: "italic" }}>
              e.g. {example}
            </Text>
          </Box>
        )}
      </Stack>
      {isCycle && (
        <Box marginTop={2}>
          <Text size={1} muted style={{ fontStyle: "italic" }}>
            See {convertCase(field.type, "title")} above.
          </Text>
        </Box>
      )}
      {hasSubfields && (
        <>
          <Card
            as="button"
            padding={3}
            radius={2}
            sizing="border"
            tone="transparent"
            onClick={() => {
              setExpanded(!expanded);
            }}
            style={{ marginTop: 16, textAlign: "left", border: "none", cursor: "pointer" }}
          >
            <Flex align="center" gap={2}>
              <Text size={0}>{expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
              <Text size={1} muted weight="medium">
                {subfields.length} subfield{subfields.length === 1 ? "" : "s"}
              </Text>
            </Flex>
          </Card>
          {expanded && (
            <Box
              style={{
                marginTop: 16,
                marginBottom: 8,
                paddingLeft: 16,
                borderLeft: "1px solid var(--card-border-color)",
              }}
            >
              <Stack gap={5}>
                {subfields.map((subfield) => (
                  <DocumentedField
                    key={subfield.name}
                    field={subfield}
                    ancestors={new Set([...ancestors, field.type])}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}
