# Project Guidelines

## Suite

**One workspace, separate packages.** Every plugin in `packages/` is developed here and published on its own. This file holds the rules every package follows, and a package's own `CLAUDE.md` holds only what applies to it alone.

**READMEs.** Every `README.md` follows the `readme` skill in `.claude/skills/`. Use it before writing or revising one.

**Check the siblings.** Before changing anything that more than one package shares, read the others. Where they already differ, say where and why before changing any of them.

## Environment

**Package manager.** Use Bun as the package manager and runtime: to install dependencies, run scripts, and execute packages. Install dependencies with exact versions using `-E`, and use `-D` for development dependencies.

**Dependencies.** Tooling and Sanity are devDependencies of the root. A package declares only its runtime and peer dependencies and the `@repo/*` packages it imports. A dependency the Studio also ships takes a range that overlaps what every supported Studio release declares for it, so a consumer installs only one copy. The lower bound is the version the oldest supported `sanity` minor brings, joined with `||` where a later minor moved to a new major, and it only rises when the oldest supported Studio does. The `react` peer stays at the bare major, while the `sanity` peer names the oldest supported minor, so a Studio that would otherwise install a second copy of a shared package gets a warning at install rather than breaking in the browser. `bunfig.toml` hoists the install because the plugins augment `@sanity/types` without declaring it, and `@sanity/pkg-utils` goes through the workspace catalog because `verify-package` requires it in each package.

**Shared code.** Code that more than one package needs lives in `packages/@repo`, with the same layout as everywhere else: `lib/` for helpers and `components/` for components. Each file is imported by its path, such as `@repo/lib/utils` or `@repo/components/field`, with no barrel file. Nothing in `lib/` imports `sanity` or `@sanity/*`, so all of it is safe to use from a plugin's render entry, while `components/` is Studio-only. Both are inlined into each package's `dist`, so neither may hold a `createContext`, a module-level cache, or a symbol, and none of their types may appear in a package's exported types. Files within `@repo` import each other with relative paths.

**Scripts.** Use the scripts in `package.json` rather than running tools directly. Run a tool manually only when no script covers what you need.

**Linting.** Never add a lint suppression comment without explicit approval. If a rule seems worth suppressing, suggest it and wait.

**Local development.** Consumer projects link to the packages through [yalc](https://github.com/wclr/yalc). `bun run push` sends every package's current build, and a package's `bun run dev` rebuilds and pushes on each change.

## Oxlint Configuration

**Ordering.** Keep the rules in `oxlint.config.ts` in alphabetical order.

**Configure before disabling.** Check a rule's options before turning it off. Only disable a rule when no configuration makes it useful.

**Comments.** Every rule needs a comment explaining why it's configured that way, not what the rule does.

**Scope.** One configuration covers the whole workspace. Where one package needs a rule changed, add an `overrides` entry for that package's path, with the reason.

**Tool boundaries.** Oxfmt handles formatting and Oxlint handles linting. Configure them so they don't overlap.

## Behaviour

**British English.** Write everything in this repository in British English: comments, JSDoc, documentation, commit messages, and chat replies. The exceptions are code identifiers and keywords, which use American spelling, and anything read outside the repository, which is American English: every `README.md`, each `package.json` description, the changelogs, and every string an author reads in the Studio. The Studio ships in `en-US`, and the packages are published for a global audience.

**Stay focused.** Work only on what was asked. If you spot problems elsewhere, flag them but don't fix them, because other people or agents may be working on those parts of the codebase.

**Match existing patterns.** Match the structure, naming, and spacing of existing examples of whatever you're creating. If there are no examples, or they conflict with each other, ask before going ahead.

## Structure

**Directories.** `lib/` holds helpers and factories. `config/` holds the definitions they use.

**Cross-references.** The split is about where things are defined, not a rule that imports only go one way. The only hard rule is that no import may create a module cycle.

**Two entry points.** A field plugin exposes `.` for the Studio and `./render` for the site, and nothing reachable from `render.ts` may import `sanity` or `@sanity/ui`. Handbook is a tool and only has `.`.

**The stored format.** How a value is stored is the plugin's own business. Parsing, serialising, and stega cleaning stay internal, and public helpers take a whole stored value, never part of one.

**Schema names.** A module that registers a schema type exports the type's name alongside it. A stored shape read outside the Studio keeps its name and interface in `types.ts`, which imports nothing from `sanity`.

**Icons.** Studio controls use icons from `@sanity/icons` as they are. A plugin's own icons live in `icons/`, built on Lucide's stroke style, and they're the only place `defaultIconProps` is spread.

**Public API.** Only what an entry point re-exports is public. An `export` anywhere else is module scope, and a symbol nothing imports has no `export`. Treat any change to an entry point's re-exports as breaking until proven otherwise.

## Code

**Naming.** Use complete, unabbreviated names. Constants use camelCase like any other variable. Import exports by name rather than through a namespace, and use path aliases rather than relative paths.

**Prefixing.** Types carry a `Sanity` prefix, because they end up in a consumer's own definitions. Functions and values are named after their subject only, never prefixed with `sanity`.

**Ordering.** When a definition sets an order, such as a type, an interface, or a schema, everything that uses or mirrors it follows the same order. That includes destructuring, function parameters, component props, and query fields. Where a spread makes this impractical, the properties after the spread still follow the definition's order.

**File structure.** Order each file as imports, types and interfaces, constants, functions, then components. A helper that only serves the file's main definition goes directly above it, even when that definition is a constant. The one exception is a props type, which goes directly above the component it types rather than with the other types, so a file with several components reads as a run of type-and-component pairs.

**Absence.** Use `undefined` for missing values. Only use `null` where something outside the codebase requires it, such as a third-party API, or a React component that intentionally renders nothing.

**Existence checks.** Use `isDefined` instead of truthiness checks or comparisons with `undefined`. It already treats empty strings, arrays, and objects as absent, so use it instead of a `.length` check, and keep `.length` for actual counts. An array counts as absent unless at least one of its elements is present, so `isDefined([first, second, third])` checks whether any of several values exists. Check real booleans directly.

**Destructuring.** When a function reads several properties from the same object, or reads one property repeatedly, destructure them at the top: `const { links, name } = menu ?? {}` rather than repeated `menu?.…` reads. A single read doesn't need destructuring, and optional chaining is fine. Don't destructure where it would lose a type guard's narrowing or force you to rename properties to avoid a clash.

**Abstraction.** Don't create named constants for trivial or single-use values. Inline a unit conversion, and put a one-off options object at its call site. Only extract values that are shared, act as configuration, or aren't obvious.

**Definition tables.** Only use `as const satisfies T[]` on a list of literals when a type is derived from the value. When the type comes first, use a plain type annotation, which is clearer and keeps the value mutable.

**Styling.** The Studio only loads theme tokens, so style with `@sanity/ui` primitives and use an inline `style` only for what those can't do. Prefer the Studio's CSS custom properties to hardcoded values, so the plugin follows the active theme.

**Bad config.** A configuration that contradicts itself silently falls back to the documented default, and the option's JSDoc states that default. When a fallback is worth reporting, log it once through the package's logger, which names the plugin and only logs in development.

## React

**Memoisation.** React Compiler handles memoisation, so never use `useMemo`, `useCallback`, or `React.memo`.

**Props.** Derive a component's props from `ComponentProps<"element">` for its root element, so standard attributes are inherited rather than redeclared. Export the props type, and spread `{...props}` onto the root element as its last attribute so the consumer's values take precedence.

**Wrapping components.** When wrapping an existing component, derive its props from the wrapped component's type and use `Omit` for the props you handle internally. This keeps the original component's type constraints, including discriminated unions.

**Conditional rendering.** Render conditional elements with `{condition && <Element />}`, never with a ternary whose else branch is `undefined`. This only applies to JSX children; value ternaries like `aria-current={isActive ? "page" : undefined}` are fine.

**Markup.** Only use `ul`, `ol`, and `li` for actual text lists. Lay out card grids, icon groups, tab strips, and pagination with `div` and `span`.

**DOM access.** Target elements with refs, not ids and `querySelector`. When the element and the code that uses it are in different components, share the ref through a small client context. Ids used only as CSS hooks are fine.

## TypeScript

**No `any`.** Never use `any`, and prefer specific types over `unknown` wherever possible.

**Inferred return types.** Let TypeScript infer return types. Only annotate one where the annotation is the contract, such as unifying several branch shapes or typing a callback's parameters, or where a named type reads better on hover than an expanded object. The compiler asking for an annotation is a reason to look, not a reason to add one. If an annotation only makes up for a weak type upstream, fix that type instead.

## Documentation

**What to document.** Add JSDoc to utility functions, hooks, context providers, non-obvious constants (including any returned by a `lib/` or `config/` factory), and interface properties. Types and interfaces in `lib/` also get JSDoc on the definition itself. Don't document React components or their props types, Sanity schema types or their properties (their `description` strings cover them), `variants` objects, constants that are framework conventions or obvious from context, Sanity's `_type` and `_key` properties, or a single property already explained by its definition's JSDoc. None of these exemptions apply to anything an entry point re-exports, since consumers read the published declarations rather than the source. Those take a full block, and the build rejects any without an `@public` release tag, the one tag used beyond those listed below.

**How to document.** Describe what the code does, not how it does it, so the documentation stays true after a refactor; don't mention specific function names or implementation details. Always include `@param` and `@returns` tags without type annotations, and `@throws` when a function throws. Don't use any other tags. A function that returns nothing has no `@returns`. Describe a missing value as "or undefined when …", never "where". Start a boolean's description with "Whether …", or with "True if …" when it narrows a type. Never document a parameter name that isn't in the signature: name each parameter, or let a props type carry the documentation.

**Length.** Write more only when the code does something surprising; importance alone doesn't justify length. Add a second sentence only when the behaviour would catch someone out, and make the point once. Keep reasons out of `@param` and `@returns`, which describe values.

**Layout.** Put a single-sentence block on one line when it fits within the print width. Tags require the multi-line form, with a blank line between the summary and the tags.

**Comments.** JSDoc carries the documentation, so keep inline `//` comments rare. Never add one that narrates or restates the code. Only use one for something the code can't show: a deliberate omission that looks like a mistake, a constraint that isn't visible locally, or the reason behind a decision that someone might otherwise undo. Put the comment next to the code it applies to, keep it to one line within the print width, and never put it inside JSX. Every lint suppression must say why.

## Sanity

**Descriptions.** Give every field a `description` for CMS authors. Write it as a noun phrase naming the value, with no leading article and a full stop at the end. Add a second sentence only for an instruction the author needs to act on. Keep descriptions consistent with the existing ones.

**Type safety.** Use `defineField` for all fields and `defineArrayMember` inside array `of` properties. Use `satisfies` to keep field names in sync with their TypeScript types. An inline `defineArrayMember` needs a singular `name`. One that references a type registered elsewhere uses that type's name instead: a different `name` registers the type again under that name, and the `name` is what's stored as `_type` on the value.

**Validation messages.** A custom validator returns a sentence saying what's wrong and what to do, ending in a full stop. `rule.required()` takes no message, so required fields show the Studio's standard message.

**Previews.** Every document and object type needs a preview. Use `select` to map fields to preview properties, and add `prepare` when the values need transforming or a fallback. Authors can select objects in the CMS just like documents, so objects need useful previews too, including inline array members.

**Titles.** Don't set a `title` on fields or array members unless title-casing the `name` would get it wrong, typically with abbreviations like "SEO" or "URL".

**Queries.** Name GROQ helpers in `groq/` after what they return. A standalone `*[...]` expression is a `*Query`, and a projection spread into a parent query is a `*Fragment`.

**Data strings.** Sanity strings contain invisible stega characters on any fetch that doesn't turn stega off. Rendering one as text is safe, but a string that gets parsed, compared, or put into a URL, key, or filter must go through `stegaClean` first. Otherwise it fails silently, and only in Presentation mode.

## Releasing

Claude runs the release when asked, and confirms before publishing and before pushing.

**Record.** Every change that reaches a published package gets a changeset in `.changeset/` as part of the work, with the packages, the bump, and one consumer-facing line in American English, in the past tense. Before 1.0, a breaking change bumps the minor version and anything else bumps the patch.

**Release.** `bun run version` applies the changesets. Check the bumps and `CHANGELOG.md` entries it writes, fix their wording there, and commit as "Version packages". `bun run release` checks formatting and linting, builds every package, then publishes and tags `<package>@<version>`. Then run `git push --follow-tags`, and for each new tag run `gh release create <tag> --title <tag> --prerelease` with that version's changelog section as the notes.
