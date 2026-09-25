import { imageTypeName, videoTypeName } from "@/types";

/** Expands an image or video block's asset to just its URL. */
const assetUrlFragment = `"asset": { "url": asset.asset->url }`;

/** Expands the image and video blocks in guide content. */
const guideContentFragment = `
  _type == "${imageTypeName}" => { ..., ${assetUrlFragment} },
  _type == "${videoTypeName}" => { ..., ${assetUrlFragment} }
`;

/** Expands a guide reference, including the asset URLs in its content. */
export const guideFragment = `...@-> {
  ...,
  content[] { ..., ${guideContentFragment} }
}`;
