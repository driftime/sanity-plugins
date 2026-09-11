import { isDefined } from "@repo/lib/utils";
import { ChevronRightIcon } from "@sanity/icons/ChevronRight";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";

import { contentSpacing } from "@/config/layout";
import { useHandbookContext } from "@/contexts/handbook";
import { resolveDescription, resolveIcon, resolveTitle } from "@/lib/display";

export function DocumentTypesOverview() {
  const { roles, setActiveTab, setSidebarExpanded } = useHandbookContext();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: contentSpacing.section }}>
      {roles.map((role) => {
        const { title, description, documents } = role;

        return (
          <Stack key={title} gap={2}>
            <Stack gap={3}>
              <Flex align="center" paddingY={1}>
                <Text size={1} weight="medium">
                  {title}
                </Text>
              </Flex>
              {isDefined(description) && (
                <Text size={1} muted>
                  {description}
                </Text>
              )}
            </Stack>
            <Box marginTop={1}>
              <Stack gap={2}>
                {documents.map((document) => {
                  const Icon = resolveIcon(document);
                  const documentDescription = resolveDescription(document);

                  return (
                    <Card
                      key={document.name}
                      as="button"
                      padding={3}
                      radius={2}
                      sizing="border"
                      tone="inherit"
                      onClick={() => {
                        setActiveTab(document.name);
                        setSidebarExpanded(false);
                      }}
                      style={{
                        width: "calc(100% + 24px)",
                        marginLeft: "-12px",
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Flex align="center" gap={3}>
                        <Box flex={1}>
                          <Stack gap={3}>
                            <Flex align="center" gap={2} style={{ marginLeft: "-4px" }}>
                              {isDefined(Icon) && (
                                <Flex
                                  align="center"
                                  justify="center"
                                  style={{ width: 25, height: 25, color: "var(--card-icon-color)" }}
                                >
                                  <Icon />
                                </Flex>
                              )}
                              <Text size={1} weight="medium">
                                {resolveTitle(document)}
                              </Text>
                            </Flex>
                            {isDefined(documentDescription) && (
                              <Box paddingBottom={1}>
                                <Text size={1} muted>
                                  {documentDescription}
                                </Text>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                        <Box flex="none" style={{ opacity: 0.5 }}>
                          <Text muted size={1}>
                            <ChevronRightIcon />
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        );
      })}
    </div>
  );
}
