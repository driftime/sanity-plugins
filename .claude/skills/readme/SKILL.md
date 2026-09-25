---
name: readme
description: Write or revise a plugin README in the suite's shared voice and structure. Use before touching any README.md in this repository.
---

# Plugin READMEs

The plugin READMEs share a voice and a structure, and this skill describes both. Apply it as judgement rather than a template: a rule can bend where a plugin needs it to, and the other READMEs in `packages/*/README.md` show how it has been applied so far. When asked to rewrite a README, start from a blank page rather than editing the existing one. When asked to review one, read the whole file and check its structure and consistency as closely as its sentences.

## Audience

A README is for the developer configuring the plugin, and every line should help them. So don't describe the author's experience in the Studio; a screenshot and a caption do that better. Don't describe what the plugin doesn't do, what would happen without it, or how other approaches compare. The one exception is a single sentence about something the plugin doesn't do where a reader would otherwise assume it does, such as an editors list that isn't access control. Present a use case as an example rather than a rule, and check every claim about behaviour against the source before writing it.

## Voice

The overview is there to sell the plugin. In a couple of flowing paragraphs, concrete and a touch poetic, it explains what the plugin adds to the Studio and how it works, without naming a function, listing return values, or counting variants. It opens with the plugin's main capability, never with what the Studio lacks, why the reader is looking, or a secondary feature. After the overview, each section starts by saying what the thing is and why it exists, then covers the mechanics in plain, literal sentences. No metaphors, idioms, or second person: write about the site, the Studio, and the schema, and prefer the plain word to a turn of phrase. A pairing is legible or illegible, a color has the higher contrast, and nothing "reads", "sits close at hand", or "writes itself". Use the developer's own terms, such as reference, origin, `href`, Portable Text, Next.js, and the Presentation Tool, and keep brand names out of examples. READMEs are in American English.

## Grammar

Use a colon to introduce a list or a table, not to join a sentence to its continuation, and don't add "below" or "each covered in" to a lead sentence that ends in one. Code comes after the sentence that explains it, not after a label such as "A minimal component:". Each sentence holds one idea, so avoid both run-on sentences packing in several options and runs of clipped fragments. Paragraphs should flow, so join a run of short sentences into ones that lead into each other.

## Structure

The document follows the order a developer meets the plugin: overview, installation, what happens in the Studio, what happens on the site, then reference material. Those stages are usually H2 groups, each opened by a sentence or two about what the group covers, with H3 sections for the things a developer configures or calls and H4s for parts of a larger section. The sections a plugin needs depend on what it does, so a plugin with no site half, or with several site functions, shapes its groups to suit rather than copying another plugin's outline. Every exported function gets its own section, with a lead sentence, an example whose output was checked against the build, and a table where it takes several inputs or returns several values; never group helpers into one sentence. Every README states what the plugin registers, and that a Studio with a clashing name should rename it before installing. Reference material comes last, covering the stored shape, the runtime exports, and the exported types. Headings are in Title Case.

## Tables and Examples

Introduce something configurable with a lead sentence, a complete multi-line example, and then a table of its options. A table has whatever columns it needs, often the option, its type, its default, and its purpose, and a required option is marked in the table rather than in a sentence. Returned values and function inputs suit the same treatment, with rows linking to the sections that explain them. Document each fact once, so one section doesn't repeat another's table, and a table describing stored data covers every field, including the shared ones. An option worth mentioning in prose usually deserves its own example, at plugin level and at field level, showing only that option above `// ...`. The two levels show different scopes, a site-wide setting on the plugin and a field-specific one on the field, never the same list in both places. Names, values, and roles in the text next to a screenshot match what the screenshot shows. Component examples use only the props they need, comments describe the code below them, and bold is only for constraints a developer must not miss.

## Consistency

The READMEs are read side by side, so a decision made in one is the starting point for the others. Before writing, read the others and reuse what already works: the header and footer, the installation paragraph, how a section opens, and the columns a comparable table uses. Depart from them where the plugin genuinely differs, and say so, rather than forcing a fit or inventing a new convention. An export appears once in the API and Types tables, under one import path; if an export seems to need "either", that's a defect in the code to fix, not a fact to document. The description under the title takes the form "X for Sanity Studio, distinguishing clause", and it's identical in the package description, the README header, and the root README.
