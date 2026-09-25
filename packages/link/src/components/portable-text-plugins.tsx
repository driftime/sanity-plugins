import { useEditor } from "@portabletext/editor";
import { defineBehavior, raise } from "@portabletext/editor/behaviors";
import { isSelectionExpanded } from "@portabletext/editor/selectors";
import { htmlToPortableText } from "@portabletext/html";
import { isDefined } from "@repo/lib/utils";
import { useEffect } from "react";
import type { PortableTextPluginsProps } from "sanity";

import { createUrlLink } from "@/lib/annotations";

/**
 * Keeps links when formatted text is pasted. Sanity only recognises its own default link annotation,
 * so pasted links would otherwise become plain text.
 */
const pasteUrlBehavior = defineBehavior({
  on: "clipboard.paste",
  guard: ({ snapshot, event }) => {
    const html = event.originEvent.dataTransfer.getData("text/html");

    if (!/<a\s[^>]*href/iu.test(html)) return false;

    const blocks = htmlToPortableText(html, {
      schema: snapshot.context.schema,
      keyGenerator: snapshot.context.keyGenerator,
      rules: [
        {
          deserialize(element, next) {
            if (!(element instanceof Element) || element.nodeName.toLowerCase() !== "a") return undefined;

            const url = element.getAttribute("href");
            const link = isDefined(url) ? createUrlLink(snapshot.context.schema, url) : undefined;

            if (!isDefined(link)) return next(element.childNodes);

            return {
              _type: "__annotation",
              markDef: { ...link, _key: snapshot.context.keyGenerator() },
              children: next(element.childNodes),
            };
          },
        },
      ],
    });

    return { blocks };
  },
  actions: [
    ({ snapshot }, { blocks }) => [
      ...(isSelectionExpanded(snapshot) ? [raise({ type: "delete" })] : []),
      raise({ type: "insert.blocks", blocks, placement: "auto" }),
    ],
  ],
});

/**
 * Makes pasted links use this plugin's link type, whether pasted as formatted text or a bare URL. Pass
 * it to a text type's `components.portableText.plugins`.
 *
 * @param props - The Portable Text plugin props from the Studio.
 * @returns The editor's plugins, with link pasting replaced.
 * @public
 */
export function PortableTextLinkPlugins(props: PortableTextPluginsProps) {
  const editor = useEditor();

  useEffect(() => {
    const unregister = editor.registerBehavior({ behavior: pasteUrlBehavior });

    return () => {
      unregister();
    };
  }, [editor]);

  return props.renderDefault({
    ...props,
    plugins: {
      ...props.plugins,
      pasteLink: {
        ...props.plugins.pasteLink,
        link: ({ context, value }) => createUrlLink(context.schema, value.href),
      },
    },
  });
}
