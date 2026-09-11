# Project Guidelines

## Suite

**One workspace, separate packages.** Every plugin in `packages/` is developed here and published on its own. This file holds what every package follows; a package's `CLAUDE.md` holds only what is true of it alone.

**READMEs.** Every `README.md` follows the `readme` skill in `.claude/skills/`. Invoke it before writing or revising one.

**Check the siblings.** Before changing anything more than one package shares, read the others. Where they already differ, say where and why before changing any of them.

## Environment

**Package manager.** This project uses Bun. Install dependencies with exact versions using `-E`, and use `-D` for development dependencies.

**Dependencies.** Tooling and Sanity are devDependencies of the root; a package declares only its runtime and peer dependencies and the `@repo/*` packages it imports. A dependency the Studio also carries takes a range that overlaps what every supported Studio release declares for it, so a consumer resolves one copy — the floor is the version the oldest supported `sanity` minor brings, joined with `||` where a later minor moved to a new major, and it is only raised when the oldest supported Studio moves. The `react` peer stays at the bare major, while the `sanity` peer names the oldest supported minor, so a Studio that would otherwise install a second copy of a shared package is warned at install rather than breaking in the browser. `bunfig.toml` hoists the install because the plugins augment `@sanity/types` without declaring it; `@sanity/pkg-utils` goes through the workspace catalog because `verify-package` requires it per package.

**Shared code.** Code more than one package needs lives under `packages/@repo`, laid out as it is everywhere else: `lib/` holds the helpers and `components/` the components, and each file is imported by its path, such as `@repo/lib/utils` or `@repo/components/field`, with no barrel between them. Nothing in `lib/` imports `sanity` or `@sanity/*`, so any of it is safe from a plugin's render entry, while `components/` is Studio side only. Both are inlined into each `dist`, so nothing in them may hold a `createContext`, a module-level cache, or a symbol, none of their types may appear in a package's exported types, and their imports of each other are relative within a package.

**Scripts.** Prefer scripts defined in `package.json` over running tools directly — manual invocation is fine when needed, but project scripts should be the default.

**Linting.** Never add lint suppression comments without explicit approval. If a rule seems worth suppressing, suggest it and wait.

**Local development.** Consumer projects link through [yalc](https://github.com/wclr/yalc). `bun run push` sends every package's current build; a package's `bun run dev` rebuilds and pushes on each change.

## Oxlint Configuration

**Ordering.** Rules in `oxlint.config.ts` are sorted alphabetically. Maintain this when adding new ones.

**Configure before disabling.** Explore a rule's options before reaching for `"off"`. Only disable a rule when no configuration makes it useful.

**Comments.** Every rule must have a comment explaining why it's configured that way, not what the rule does.

**Scope.** One configuration covers the workspace. A rule one package departs from is an `overrides` entry on that package's path, with its reason.

**Tool boundaries.** Oxfmt owns formatting and Oxlint owns linting. Configure them so they don't overlap.

## Behaviour

**British English.** All written content in this repository uses British English — comments, JSDoc, documentation, commit messages, and replies in chat. The exceptions are code identifiers and programming keywords, which use American spelling, and anything a reader outside the repository sees: every `README.md`, each `package.json` description, the changelogs, and every string an author reads in the Studio, which are American English because the Studio ships `en-US` and the packages are published for a global audience.

**Stay focused.** Work only on what has been asked. If you spot issues elsewhere, flag them but don't fix them. Other people or agents may be working on other parts of the codebase.

**Match existing patterns.** Match the existing examples of whatever you're creating — structure, naming, spacing. Where none exist, or they conflict with each other, raise it before proceeding.

## Structure

**Directories.** `lib/` takes the helpers and factories; `config/` takes the definitions that bind them.

**Cross-references.** The split describes where a thing is defined, not a layering that only points one way. The only hard constraint is that no import may close a module cycle.

**Two entry points.** A field plugin exposes `.` for the Studio and `./render` for the site, and nothing reachable from `render.ts` may import `sanity` or `@sanity/ui`. Handbook is a tool and has only `.`.

**The stored format.** How a value is stored is the plugin's business: parsing, serialising and stega cleaning stay internal, and public helpers take a whole stored value, never a piece of one.

**Schema names.** A module registering a schema type exports its name alongside it; a stored shape read outside the Studio keeps its name and interface in `types.ts`, which imports nothing from `sanity`.

**Icons.** Studio controls take icons from `@sanity/icons`, used bare. A plugin's own icons live in `icons/` on the Lucide stroke skeleton and are the only place `defaultIconProps` is spread.

**Public API.** Only what an entry point re-exports is public; an `export` anywhere else is module scope, and a symbol nothing imports has no `export`. A change to an entry point's re-exports is breaking until proven otherwise.

## Code

**Naming.** Use complete, unabbreviated identifiers. Constants use camelCase like any other variable. Import specific exports by name rather than accessing them through a namespace. Use path aliases rather than relative paths.

**Prefixing.** Types carry `Sanity`, because they float into a consumer's own definitions. Functions and values carry only the subject, never `sanity` prefixed to it.

**Ordering.** When a definition establishes an order — a type, an interface, a schema — everything that consumes or mirrors it follows the same order, including destructuring, function parameters, component props, and query fields. Where a spread makes strict ordering impractical, the properties after the spread still respect the definition's order relative to each other.

**File structure.** Files follow a consistent top-to-bottom order: imports, type and interface definitions, constants, functions, then component functions. A helper that exists only to serve the file's principal definition sits immediately above it, even when that definition is a constant. A props type is the exception that proves it — it sits immediately above the component it types rather than with the other types, so a file holding several components reads as a run of type-and-component pairs.

**Absence.** Always use `undefined` to represent missing values. Only use `null` where something outside the codebase deals in it — a third-party API that requires it, or a React component's intentionally empty render.

**Existence checks.** Use `isDefined` rather than truthiness or a comparison against `undefined`. It already treats empty strings, arrays, and objects as absent, so it replaces a `.length` check rather than joining one — reserve `.length` for genuine counts. An array is absent unless one of its elements is present, which makes `isDefined([first, second, third])` the way to ask whether any one of several sources holds a value. Check genuine booleans directly.

**Destructuring.** When a function reads several properties off the same object, or reads one of them repeatedly, destructure them together at the top — `const { links, name } = menu ?? {}` rather than a scattering of `menu?.…` reads. A single access needs nothing, and optional chaining is fine in itself. Skip destructuring where it would discard a type guard's narrowing or force properties to be renamed around a collision.

**Abstraction.** Don't extract named constants for trivial or single-use values — a unit conversion reads better inlined than named, and a one-off options object belongs at its call site. Hoist only what is genuinely shared, configuration-like, or non-obvious.

**Definition tables.** Write a list of literals `as const satisfies T[]` only where a type is derived from the value; where the type comes first, a plain annotation says the same thing more plainly and leaves the value mutable.

**Styling.** The Studio loads theme tokens only, so styling comes from `@sanity/ui` primitives, with an inline `style` reserved for what those can't express. Prefer the Studio's CSS custom properties over hardcoded values, so the plugin follows the active theme.

**Bad config.** A configuration that contradicts itself falls back silently to the documented default, and the option's JSDoc states that default. A fallback worth reporting goes through the package's logger, which names the plugin and speaks only in development, and fires once.

## React

**Memoisation.** The packages use React 19 with React Compiler, which handles memoisation automatically. Never use `useMemo`, `useCallback`, or `React.memo`.

**Props.** Derive component props from `ComponentProps<"element">` matching the root element, so standard attributes are inherited rather than redeclared. Export the props type, and spread `{...props}` onto that root element as the final attribute, after every explicit one, so consumer values win predictably.

**Wrapping components.** When wrapping an existing component, derive props from its type and use `Omit` for any props you're handling internally. This preserves the original component's type constraints, including discriminated unions.

**Conditional rendering.** Render conditional elements with `{condition && <Element />}`, never a ternary whose else branch is `undefined`. This applies to JSX children only — value ternaries such as `aria-current={isActive ? "page" : undefined}` stay as they are.

**Markup.** Reserve `ul`, `ol`, and `li` for genuine text lists. Card grids, icon groups, tab strips, and pagination are laid out with `div` and `span` — list semantics describe prose, not layout.

**DOM access.** Target elements with refs rather than ids and `querySelector`. When the element and the code acting on it live in different components, share the ref through a small client context. Ids used purely as CSS hooks are fine.

## TypeScript

**No `any`.** Prefer specific types over `unknown` wherever possible, and never use `any`.

**Inferred return types.** Let TypeScript infer them. An annotation earns its place only where it _is_ the contract — normalising several branch shapes into one, or typing a callback's parameters — or where a named type reads better on hover than an expanded anonymous object. The compiler asking for one is a prompt to look, not a reason on its own. Where it only compensates for a weak type upstream, fix that type.

## Documentation

**What to document.** JSDoc goes on utility functions, hooks, context providers, non-obvious constants — including any a `lib/` or `config/` factory returns — and interface properties. Types and interfaces in `lib/` also take definition-level JSDoc. Exempt: React components and their prop types, Sanity schema types and their properties (schema `description` strings cover those), `variants` objects, constants that are framework conventions or self-evident from context, Sanity's own `_type` and `_key` properties, and a lone property whose name the definition's block already explains. Every exemption lapses for anything an entry point re-exports, since a consumer reads the published declarations and never the source — those take a full block, and the build additionally rejects any of them missing an `@public` release tag.

**How to document.** Describe what code accomplishes, not how. Summaries should survive refactoring — avoid referencing specific function names or implementation details. Always include `@param` and `@returns` tags, without type annotations, and `@throws` where a function throws; no other tags are in use. A function that returns nothing takes no `@returns`. Describe absence as "or undefined when …", never "where". A boolean is "Whether …" unless it narrows a type, in which case it is "True if …". Never document a parameter name the signature does not have — name each one, or let a props type carry the docs.

**Length.** Documentation earns its length from how surprising the code is, not how important it is. A second sentence belongs only where the behaviour would catch someone out, and it makes its point once. Keep rationale out of `@param` and `@returns`, which describe values.

**Layout.** A block holding a single sentence sits on one line wherever the print width allows, whatever it documents. Tags force the multi-line form, with a blank line between the summary and the tags.

**Comments.** JSDoc carries the documentation here, and inline `//` comments stay rare by design — never add one to narrate what a line does or to restate the code in prose. Keep them for the cases where a developer genuinely needs something the code cannot show: a deliberate omission that reads as a mistake, a constraint that isn't visible locally, or the reasoning behind a decision that would otherwise invite an innocent-looking change. A comment sits at the call site it governs, fits on one line within the print width, and never sits inside JSX. Lint suppressions must always state why.

## Sanity

**Descriptions.** Every field should have a `description` for CMS authors. A description is a noun phrase naming the value, without a leading article and ending in a full stop, with a second sentence only where the author has an instruction to act on. Write descriptions that are consistent in tone and structure with the existing ones across the codebase.

**Type safety.** Use `defineField` for all fields and `defineArrayMember` within array `of` properties. Use the `satisfies` operator to keep field names synchronised with their TypeScript types. An inline `defineArrayMember` needs a singular `name`. One that references a type registered elsewhere takes that type's own name instead — a differing `name` re-registers the type under it, and it is the `name` that gets stored as `_type` on the value.

**Validation messages.** A custom validator reports a sentence that says what is wrong and what to do, ending in a full stop. `rule.required()` takes no message, so a required field reads as the Studio's own.

**Previews.** All document and object types should have preview configuration. Use `select` to map document fields to preview properties, and add `prepare` when the selected values need transformation or fallback logic. Objects are selectable in the CMS just as documents are, so they need meaningful previews, and an inline array member is an object like any other.

**Titles.** Don't define a `title` on fields or array members unless title-casing the `name` would mangle it — abbreviations like "SEO" or "URL" are the typical exception.

**Queries.** Name GROQ helpers in `groq/` by what they return. A standalone `*[...]` expression is a `*Query`; a projection spread into a parent query is a `*Fragment`.

**Data strings.** Sanity strings carry invisible stega characters on any fetch that doesn't opt out. Rendering one as text is safe, but a string that gets parsed, compared, or interpolated into a URL, key, or filter must pass through `stegaClean` first — otherwise it fails silently, and only in Presentation mode.

## Releasing

Claude runs the release when asked and confirms before publishing and before pushing.

**Record.** Every change that reaches a published package gets a changeset in `.changeset/` as part of the work: the packages, the bump, and one consumer-facing line in American English, past tense. Pre-1.0, a breaking change bumps the minor and anything else the patch.

**Release.** `bun run version` applies the changesets; read the bumps and `CHANGELOG.md` entries it wrote, fix wording there, and commit as "Version packages". `bun run release` publishes and tags `<package>@<version>`; then `git push --follow-tags`, and for each new tag `gh release create <tag> --title <tag> --prerelease` with that version's changelog section as the notes.
