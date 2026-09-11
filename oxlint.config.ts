import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    reportUnusedDisableDirectives: "error",
    typeAware: true,
    typeCheck: true,
  },
  env: {
    browser: true,
    node: true,
  },
  plugins: ["eslint", "import", "jsdoc", "jsx-a11y", "oxc", "promise", "react", "typescript", "unicorn"],
  categories: {
    correctness: "error",
    // Nursery rules are unfinished and can fire on correct code, so they should not fail the build.
    nursery: "warn",
    pedantic: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error",
  },
  rules: {
    // Conditional rendering accumulates branches, making cyclomatic complexity misleading for components.
    complexity: "off",

    // Single-line blocks are visually unambiguous; braces are only needed when blocks span multiple lines.
    curly: ["error", "multi-line", "consistent"],

    // TypeScript infers return types reliably; explicit annotations add noise without safety.
    "explicit-function-return-type": "off",

    // TypeScript infers return types reliably, and the generated declarations carry them to consumers.
    "explicit-module-boundary-types": "off",

    // React and Sanity conventions both use function declarations.
    "func-style": ["error", "declaration"],

    // Naming conventions are enforced through code review, not arbitrary length limits.
    "id-length": "off",

    // Inline exports alongside declarations are clearer than a separate export block at the end.
    "import/exports-last": "off",

    // Consolidating exports into a single block separates declaration from export for no benefit.
    "import/group-exports": "off",

    // Modern codebases naturally have many imports; an arbitrary limit does not reflect complexity.
    "import/max-dependencies": "off",

    // Tooling configuration files are consumed as default exports.
    "import/no-default-export": "off",

    // Named exports enable tree shaking and explicit imports.
    "import/no-named-export": "off",

    // Tooling configuration runs in Node rather than the browser, so builtins are legitimate there.
    "import/no-nodejs-modules": "off",

    // Single-export files do not need to be default exports.
    "import/prefer-default-export": "off",

    // Destructured parameters are documented by their type definitions.
    "jsdoc/require-param": ["error", { checkDestructured: false }],

    // TypeScript handles parameter types; JSDoc type annotations are redundant.
    "jsdoc/require-param-type": "off",

    // TypeScript handles return types; JSDoc type annotations are redundant.
    "jsdoc/require-returns-type": "off",

    // The tag names the condition a function throws under rather than a class, so a type says nothing.
    "jsdoc/require-throws-type": "off",

    // Arbitrary numeric limits do not reflect actual code complexity.
    "max-depth": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-params": "off",
    "max-statements": "off",

    // React components are uppercase functions, not constructors.
    "new-cap": ["error", { capIsNew: false }],

    // Console logging is a core part of the local debugging workflow.
    "no-console": "off",

    // Continue is a valid control flow statement in loops.
    "no-continue": "off",

    // Separate type imports from the same module are intentional, not duplicates.
    "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],

    // Inline comments annotate code at the point of reference where adjacency carries meaning.
    "no-inline-comments": "off",

    // Numbers in this codebase are self-evident in context; naming them adds noise without clarity.
    "no-magic-numbers": "off",

    // All target environments support optional chaining natively.
    "no-optional-chaining": "off",

    // Flat ternaries are the clearest way to express conditional values; JSX children are the exception and use `&&`.
    "no-ternary": "off",

    // The undefined keyword has been read-only since ES5; void 0 is unnecessary.
    "no-undefined": "off",

    // Sanity's system fields and the query metadata sitting beside them are leading-underscore by convention.
    "no-underscore-dangle": "off",

    // Function declarations are hoisted, so this project's constants-before-functions order is safe.
    "no-use-before-define": ["error", { functions: false }],

    // Void as a statement is useful for discarding return values in arrow functions.
    "no-void": ["error", { allowAsStatement: true }],

    // Declarations stay one per statement, so each JSDoc block keeps the declaration it documents.
    "one-var": ["error", "never"],

    // All target environments support async/await natively.
    "oxc/no-async-await": "off",

    // Spreading inside map calls is a standard pattern for constructing new objects.
    "oxc/no-map-spread": "off",

    // Object rest and spread are fundamental to React component prop forwarding.
    "oxc/no-rest-spread-properties": "off",

    // React and Sanity types do not export readonly variants, making this impractical.
    "prefer-readonly-parameter-types": "off",

    // The only props this rule forbids are `className` and `style`, which are how this project styles components.
    "react/forbid-component-props": "off",

    // React and Sanity conventions both use function declarations, matching `func-style`.
    "react/function-component-definition": [
      "error",
      { namedComponents: "function-declaration", unnamedComponents: "function-expression" },
    ],

    // TypeScript projects use .tsx for JSX, not .jsx.
    "react/jsx-filename-extension": "off",

    // Component architecture naturally controls nesting depth; an arbitrary limit adds no value.
    "react/jsx-max-depth": "off",

    // The React Compiler memoises prop values, including context provider values.
    "react/jsx-no-constructed-context-values": "off",

    // These plugins ship a single set of English strings, so JSX text has no translation layer to route through.
    "react/jsx-no-literals": "off",

    // Single-expression fragments are valid when returning dynamic children.
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

    // Prop spreading is a deliberate pattern for forwarding HTML attributes to underlying elements.
    "react/jsx-props-no-spreading": "off",

    // React composition patterns require multiple related components in a single file.
    "react/no-multi-comp": "off",

    // Co-locating types and constants with components is more valuable than Fast Refresh optimisation.
    "react/only-export-components": "off",

    // The automatic JSX transform does not require React in scope.
    "react/react-in-jsx-scope": "off",

    // Oxfmt owns declaration ordering; the linter only needs to enforce member ordering.
    "sort-imports": ["error", { ignoreDeclarationSort: true }],

    // Semantic grouping in schemas and component props is more meaningful than alphabetical order.
    "sort-keys": "off",

    // Sanity schema definitions nest define* calls to express containment, which is structure, not complexity.
    "unicorn/max-nested-calls": "off",

    // React components use null to indicate an intentionally empty render.
    "unicorn/no-null": "off",

    // Explicit undefined is necessary for consistent return paths in functions with mixed returns.
    "unicorn/no-useless-undefined": "off",
  },
  overrides: [
    {
      files: ["packages/icon/**"],
      rules: {
        // The rule maps list-like roles to native tags, which a searchable virtualised icon grid cannot use.
        // ARIA roles are the only way to give the picker set semantics.
        "jsx-a11y/prefer-tag-over-role": "off",
      },
    },
    {
      files: ["packages/@repo/lib/**"],
      rules: {
        // Shared helpers must stay importable from a plugin's render entry, which never imports the Studio.
        "no-restricted-imports": ["error", { paths: ["react-dom", "sanity"], patterns: ["@sanity/*"] }],
      },
    },
  ],
});
