---
name: readme
description: Write or revise a plugin README in the suite's shared voice and organisation. Use before touching any README.md in this repository.
---

# Plugin READMEs

The plugin READMEs share a voice and a way of being organised, and this skill describes both. Treat it as judgement to apply rather than a template to fill: a rule here bends where a plugin genuinely calls for it, and the sibling READMEs in `packages/*/README.md` show how the judgement has been applied so far. When asked to rewrite a README, start from a blank page rather than editing what is there. When asked to re-read one, read the whole file, and check its structure and consistency as closely as its sentences.

## Audience

A README is written for the developer configuring the plugin, and every line has to earn its place by helping them. That rules out narrating the author's experience in the Studio, which a screenshot and a descriptive caption cover better. It also rules out describing what the plugin does not do, what would happen without it, or how other approaches compare, with one exception: a claim about what the plugin does not do earns a single sentence where a reader would otherwise assume it does, such as an editors list that is not access control. Present a use case as an example rather than a rule, and check every claim about behaviour against the source before writing it.

## Voice

The overview exists to sell. In a couple of flowing paragraphs, concrete and a touch poetic, it explains what the plugin adds to the Studio and how it works, without naming a function, listing return values, or counting the plugin's variants. It leads with the capability itself and lets the rest follow from it, so it never names what the Studio lacks, states why the reader is looking, or opens on a secondary feature. From there on, each section opens by saying what the thing is and why it exists, then moves to the mechanics in plain, literal sentences. Metaphors, idioms, and the second person stay out, so the text speaks of the site, the Studio, and the schema, and it prefers the plain word to the turn of phrase: a pairing is legible or illegible, a color has the higher contrast, and nothing "reads", "sits close at hand", or "writes itself". It uses the developer's own terms, such as reference, origin, `href`, Portable Text, Next.js, and the Presentation Tool, and it keeps brand names out of examples. READMEs are American English.

## Grammar

A colon introduces a list or a table; it does not join a sentence to its continuation, and a lead sentence that ends with one needs no "below" or "each covered in". Code follows the sentence that explains it rather than a label such as "A minimal component:". Sentences hold one idea each, which rules out both a run-on packing several options and a run of clipped fragments, and paragraphs flow, so a run of short sentences is joined into ones that carry from one to the next.

## Organisation

The document runs in the order a developer meets the plugin: overview, installation, what happens in the Studio, what happens on the site, then reference material. Those stages usually become H2 groups, each opened by a sentence or two saying what the group covers, with H3 sections for the things a developer configures or calls and H4s for the parts of a larger section. Which sections a plugin needs follows from what it does, so a plugin with no site half, or with several site functions, shapes its groups to suit rather than fitting another plugin's outline. Every exported function has a section of its own, with a lead sentence, an example whose output was run against the build, and a table where it takes several inputs or returns several values, so helpers are never grouped into one sentence. Every plugin states what it registers and that a Studio with a clashing name renames it before installing. Reference material closes the document, covering the stored shape, the runtime exports, and the exported types. Headings are Title Case.

## Tables and examples

Something configurable is usually introduced with a lead sentence, a complete multi-line example, and then a table of its options. A table's columns are whatever it needs, often the option, its type, its default, and its purpose, and a required option is marked as such in the table rather than in a sentence. Returned values and function inputs suit the same treatment, with rows linking to the sections that explain them. A fact is documented once, so one section does not repeat another's table, and a table describing stored data covers every field, the shared ones included. An option worth mentioning in prose is usually worth an example of its own, at plugin level and field level alike, showing only that option above `// ...`, and the two levels show different scopes, a site-wide setting on the plugin and a field-specific one on the field, never the same list in both places. Names, values, and roles in the text beside a screenshot match what the screenshot shows. Component examples take only the props they use, comments describe the code beneath them, and bold is reserved for constraints a developer must not miss.

## Consistency

The READMEs are read side by side, so a decision made in one is the starting point for the rest. Before writing, read the others and carry across what already works: the header and footer, the installation paragraph, the way a section opens, the columns a comparable table uses. Depart from them where the plugin genuinely differs, and say so, rather than either forcing a fit or inventing a new convention. An export appears once in the API and Types tables, under one import path, and "either" is a defect in the code to fix rather than a fact to document. The description under the title takes the shape "X for Sanity Studio, distinguishing clause", identical in the package description, the README header, and the root README.
