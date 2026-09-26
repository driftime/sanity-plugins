import { isDefined } from "@repo/lib/utils";
import { SearchIcon } from "@sanity/icons/Search";
import { Box, Dialog, Flex, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Library } from "@/components/picker/library";
import { Problem } from "@/components/picker/problem";
import { Recent } from "@/components/picker/recent";
import { Tooltip } from "@/components/picker/tooltip";
import { gridHeight, gridRowHeight } from "@/config/grid";
import { useIconLibrary } from "@/hooks/use-icon-library";
import { useIconTooltip } from "@/hooks/use-icon-tooltip";
import { useRecentIcons } from "@/hooks/use-recent-icons";
import { getCenteredScrollTop, getNextIndex, getRevealedScrollTop, getVisibleRows } from "@/lib/grid";
import type { LibraryIcon } from "@/lib/library";
import { normalizeTerms, selectIcons } from "@/lib/library";
import { getIconSetKey } from "@/lib/registry";

export type PickerProps = Omit<
  ComponentProps<typeof Dialog>,
  "children" | "header" | "width" | "selected" | "onSelect"
> & {
  library: string | undefined;
  iconStyle: string | undefined;
  allowed: string[] | undefined;
  selected: string | undefined;
  onSelect: (icon: LibraryIcon) => void;
};

export function Picker({ library: libraryName, iconStyle, allowed, selected, onSelect, ...props }: PickerProps) {
  const result = useIconLibrary(libraryName, iconStyle);
  const library = result?.icons;
  const icons = selectIcons(library ?? [], allowed);
  const { recent, remember, forget } = useRecentIcons(getIconSetKey(libraryName ?? "", iconStyle ?? "default"));

  const [search, setSearch] = useState("");
  const [scrollRow, setScrollRow] = useState(0);
  const [movedIndex, setMovedIndex] = useState<number>();
  const [scrolling, setScrolling] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const activeCell = useRef<HTMLButtonElement>(null);
  const focusIndex = useRef<number>(undefined);
  const scrollFrame = useRef<number>(undefined);
  const scrollStop = useRef<ReturnType<typeof setTimeout>>(undefined);

  const query = normalizeTerms(search);
  const searching = isDefined(query);
  const results = icons.filter((icon) => !searching || icon.terms.includes(query));

  const byName = new Map(icons.map((icon) => [icon.name, icon]));
  const recentIcons = searching
    ? []
    : recent.flatMap((entry) => {
        const icon = byName.get(entry);

        return isDefined(icon) ? [icon] : [];
      });

  const { hovered, handleHover, clearHover } = useIconTooltip(scrolling);

  const rows = getVisibleRows(scrollRow, results.length);

  const selectedIndex = searching || !isDefined(selected) ? -1 : icons.findIndex((icon) => icon.name === selected);
  const activeIndex = movedIndex ?? Math.max(0, selectedIndex);

  useEffect(() => {
    const element = scroller.current;
    if (!isDefined(element) || selectedIndex === -1) return;

    element.scrollTop = getCenteredScrollTop(selectedIndex);
  }, [scroller, selectedIndex]);

  useEffect(
    () => () => {
      if (isDefined(scrollFrame.current)) cancelAnimationFrame(scrollFrame.current);
      if (isDefined(scrollStop.current)) clearTimeout(scrollStop.current);
    },
    [],
  );

  useEffect(() => {
    if (focusIndex.current !== activeIndex) return;

    focusIndex.current = undefined;
    if (isDefined(activeCell.current)) activeCell.current.focus();
  }, [activeIndex]);

  function handleSelect(icon: LibraryIcon) {
    remember(icon.name);
    onSelect(icon);
  }

  function clearSearch() {
    setSearch("");
    setMovedIndex(undefined);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.currentTarget.value);
    setMovedIndex(undefined);

    if (isDefined(scroller.current)) scroller.current.scrollTop = 0;
  }

  function selectActive() {
    const icon = results[activeIndex];

    if (isDefined(icon)) handleSelect(icon);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      selectActive();

      return;
    }

    if (event.key !== "ArrowDown") return;

    event.preventDefault();

    if (isDefined(activeCell.current)) activeCell.current.focus();
  }

  function handleScroll() {
    clearHover();
    if (!scrolling) setScrolling(true);

    if (isDefined(scrollStop.current)) clearTimeout(scrollStop.current);
    scrollStop.current = setTimeout(() => {
      setScrolling(false);
    }, 150);

    if (isDefined(scrollFrame.current)) return;

    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = undefined;

      const element = scroller.current;
      if (isDefined(element)) setScrollRow(Math.floor(element.scrollTop / gridRowHeight));
    });
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = results.length - 1;
    if (last < 0) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectActive();

      return;
    }

    const next = getNextIndex(event.key, activeIndex, last);
    if (!isDefined(next)) return;

    event.preventDefault();

    const index = Math.min(Math.max(next, 0), last);
    focusIndex.current = index;
    setMovedIndex(index);

    const element = scroller.current;
    if (!isDefined(element)) return;

    element.scrollTop = getRevealedScrollTop(index, element.scrollTop);
  }

  return (
    <Dialog header="Select icon" width={1} {...props}>
      <Stack gap={4} padding={4}>
        {!isDefined(result?.problem) && (
          <TextInput
            icon={<SearchIcon />}
            placeholder="Search by name or keyword"
            value={search}
            onChange={handleSearch}
            onKeyDown={handleSearchKeyDown}
            disabled={!isDefined(library) || !isDefined(icons)}
            aria-label="Search the icon library"
          />
        )}
        {!isDefined(result) && (
          <Flex align="center" justify="center" style={{ height: gridHeight }}>
            <Spinner muted />
          </Flex>
        )}
        {isDefined(result?.problem) && <Problem problem={result.problem} />}
        {isDefined(recentIcons) && (
          <Recent
            icons={recentIcons}
            selected={selected}
            onSelect={handleSelect}
            onHover={handleHover}
            onForget={forget}
            onMouseLeave={clearHover}
          />
        )}
        {isDefined(library) && (
          <Stack gap={3}>
            <Box paddingY={2}>
              <Text size={1} weight="medium" muted>
                All icons ({results.length.toLocaleString("en-US")})
              </Text>
            </Box>
            {!isDefined(icons) && (
              <Flex align="center" justify="center" paddingTop={5} paddingBottom={6}>
                <Text size={1} muted>
                  No icons available.
                </Text>
              </Flex>
            )}
            {isDefined(icons) && (
              <Library
                ref={scroller}
                icons={results}
                rows={rows}
                selected={selected}
                activeIndex={activeIndex}
                activeCell={activeCell}
                search={search}
                onSelect={handleSelect}
                onHover={handleHover}
                onClearSearch={clearSearch}
                onScroll={handleScroll}
                onMouseLeave={clearHover}
                onKeyDown={handleGridKeyDown}
              />
            )}
          </Stack>
        )}
        <Tooltip key={hovered?.icon.name} hovered={hovered} query={query} />
      </Stack>
    </Dialog>
  );
}
