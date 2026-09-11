import { defaultIconProps } from "@repo/lib/icons";
import { Flex, Stack, Text } from "@sanity/ui";

import { hintKinds } from "@/config/hints";
import { contentSpacing } from "@/config/layout";

/** What each hint kind signals to an editor, shown as a legend alongside its icon. */
const hintDescriptions = {
  tip: "Helpful tips and best practices for content editors.",
  info: "Additional context about how the field is used.",
  caution: "Important warnings about constraints or potential issues.",
} satisfies Record<(typeof hintKinds)[number]["name"], string>;

export function HowToUse() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: contentSpacing.section }}>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Navigating the Handbook
          </Text>
        </Flex>
        <Text size={1} muted>
          The sidebar lists everything the Handbook holds: these introductory pages, then the document types you can
          create, grouped by the role they play on the site, and finally any guides your team has written. Selecting an
          entry opens it here.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Understanding Fields
          </Text>
        </Flex>
        <Text size={1} muted>
          Selecting a document type lists its fields, each showing its name, the kind of value it holds, and what the
          field is for. The documentation is generated from the content model, so what you read always matches what you
          see while editing.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Hints and Warnings
          </Text>
        </Flex>
        <Text size={1} muted>
          Icons beside a field name carry the guidance that would crowd its description if written into it. Hover or
          click one to read what it says, and use the key below to tell the three kinds apart.
        </Text>
        <Stack gap={3} marginTop={2}>
          {hintKinds.map(({ name, icon: Icon }) => (
            <Flex key={name} align="center" gap={3}>
              <Flex align="center" flex="none" style={{ fontSize: "16px", color: "var(--card-icon-color)" }}>
                <Icon {...defaultIconProps} />
              </Flex>
              <Text size={1} muted>
                {hintDescriptions[name]}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Nested Fields
          </Text>
        </Flex>
        <Text size={1} muted>
          Some fields hold subfields of their own, such as a content block pairing a heading with body text. A control
          beneath the description counts them and expands to show each one, documented exactly as a top-level field is.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Guides
          </Text>
        </Flex>
        <Text size={1} muted>
          Beneath the document types you may find guides, written by your team rather than generated from the content
          model. They carry what a field description cannot: house style, editorial process, and how all the pieces fit
          together.
        </Text>
      </Stack>
    </div>
  );
}
