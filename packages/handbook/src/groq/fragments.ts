import { imageTypeName, videoTypeName } from "@/types";

/** Resolves a Portable Text asset reference to the single URL the viewer renders it from. */
const assetUrlFragment = `"asset": { "url": asset.asset->url }`;

/** Expands guide content members with resolved asset URLs. */
const guideContentFragment = `
  _type == "${imageTypeName}" => { ..., ${assetUrlFragment} },
  _type == "${videoTypeName}" => { ..., ${assetUrlFragment} }
`;

/** Expands a guide reference with resolved asset URLs throughout its content. */
export const guideFragment = `...@-> {
  ...,
  content[] { ..., ${guideContentFragment} }
}`;
