---
"@driftime/sanity-plugin-link": minor
---

Added `defineLinkRoutes`, which declares a route table checked and typed on its own, and exported `SanityCheckedLinkRoutes`. A route definition's type now accepts keys beyond `path` and `params`, as the runtime already did. A parameter a path does not declare is reported with the path it was checked against.
