import { isDefined } from "@repo/lib/utils";
import { AddIcon } from "@sanity/icons/Add";
import { CloseIcon } from "@sanity/icons/Close";
import { Box, Button, Flex, Stack, TextInput } from "@sanity/ui";
import { randomKey } from "@sanity/util/content";
import type { ChangeEvent } from "react";
import type { ArrayOfObjectsInputProps } from "sanity";
import { insert, set, setIfMissing, unset } from "sanity";

import type { SanityLinkSearchParam } from "@/types";
import { searchParamTypeName } from "@/types";

/**
 * Reads a row's pair, which arrives as the bare keyed item the array input is typed with rather than
 * as the parameter it holds.
 *
 * @param param - The stored row.
 * @returns The name and value the row carries, either of which may be unwritten.
 */
function readParam(param: { _key: string }) {
  return {
    key: "key" in param && typeof param.key === "string" ? param.key : undefined,
    value: "value" in param && typeof param.value === "string" ? param.value : undefined,
  };
}

export type SearchParamsProps = ArrayOfObjectsInputProps;

export function SearchParams({ id, value, onChange, readOnly }: SearchParamsProps) {
  const params = value ?? [];

  function handleEdit(key: string, field: keyof SanityLinkSearchParam, next: string) {
    onChange(isDefined(next) ? set(next, [{ _key: key }, field]) : unset([{ _key: key }, field]));
  }

  return (
    <Stack gap={2}>
      {params.map((param, index) => {
        const { key, value: parameterValue } = readParam(param);
        const position = String(index + 1);

        return (
          <Flex key={param._key} gap={2} align="center">
            <Box flex={1}>
              <TextInput
                id={index === 0 ? id : undefined}
                value={key ?? ""}
                placeholder="Name"
                readOnly={readOnly}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  handleEdit(param._key, "key", event.currentTarget.value);
                }}
                aria-label={`Name of parameter ${position}`}
              />
            </Box>
            <Box flex={1}>
              <TextInput
                value={parameterValue ?? ""}
                placeholder="Value"
                readOnly={readOnly}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  handleEdit(param._key, "value", event.currentTarget.value);
                }}
                aria-label={`Value of parameter ${position}`}
              />
            </Box>
            <Button
              type="button"
              mode="bleed"
              tone="critical"
              icon={<CloseIcon />}
              disabled={readOnly}
              onClick={() => {
                onChange(unset([{ _key: param._key }]));
              }}
              aria-label={`Remove parameter ${position}`}
            />
          </Flex>
        );
      })}
      <Flex>
        <Button
          type="button"
          mode="ghost"
          icon={<AddIcon />}
          text="Add parameter"
          disabled={readOnly}
          onClick={() => {
            onChange([setIfMissing([]), insert([{ _type: searchParamTypeName, _key: randomKey(12) }], "after", [-1])]);
          }}
        />
      </Flex>
    </Stack>
  );
}
