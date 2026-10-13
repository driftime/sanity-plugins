---
"@driftime/sanity-plugin-icon": minor
---

Fixed Next.js builds that failed to find a newly installed icon library when they reused an earlier build's cache. `withIcons` now converts the libraries before Next.js starts building, so it returns an async configuration function instead of an object.
