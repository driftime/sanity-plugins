import { defaultIconProps } from "@repo/lib/icons";
import { Flex, Stack, Text } from "@sanity/ui";

import { hintKinds } from "@/config/hints";
import { contentSpacing } from "@/config/layout";

/** What each hint kind means, shown next to its icon as a key. */
const hintDescriptions = {
  tip: "Tips and suggested practices for people editing content.",
  info: "More detail about how and where the field is used.",
  caution: "Warnings about restrictions or problems the field can cause.",
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
          The sidebar lists everything in the Handbook: these introductory pages first, then the document types you can
          create, grouped by their role on the site, and then any guides your team has written. Select an entry to open
          it here.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Understanding Fields
          </Text>
        </Flex>
        <Text size={1} muted>
          Selecting a document type lists its fields, with each field’s name, the kind of value it holds, and what it’s
          for. This documentation is generated from the content model, so it always matches what you see in the editor.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Hints and Warnings
          </Text>
        </Flex>
        <Text size={1} muted>
          Icons next to a field’s name hold extra guidance that would make its description too long. Hover over or click
          an icon to read it, and use the key below to see what each icon means.
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
          Some fields contain subfields, such as a content block with a heading and body text. A button below the
          description shows how many there are and expands to list them, each documented like any other field.
        </Text>
      </Stack>
      <Stack gap={3}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="medium">
            Guides
          </Text>
        </Flex>
        <Text size={1} muted>
          Below the document types, you may find guides written by your team rather than generated from the content
          model. They cover things a field description can’t, such as house style, editorial process, and how everything
          fits together.
        </Text>
      </Stack>
    </div>
  );
}
