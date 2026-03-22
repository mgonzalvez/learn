# Course Authoring

## Why This Exists

The site's learning experience is rich enough now that writing raw JSON directly is a poor authoring experience.

New custom courses should be authored in Markdown as the source of truth.

The JSON in `assets/data/` is generated output.

## Authoring Model

Each authored course lives in its own folder:

```text
authoring/courses/<course-slug>/
  course.md
  resources.md
  lessons/
    01-lesson.md
    02-lesson.md
    ...
```

### `course.md`

This file holds:

- course metadata
- catalog description
- tags
- cover settings
- the module map

### `resources.md`

This file holds the course source spine.

The intended standard is roughly 3 to 5 high-value sources:

1. official documentation
2. primary or canonical source texts
3. highly respected secondary practical sources

### `lessons/*.md`

Each lesson gets its own Markdown file.

This is the main authoring surface.

## Quick Workflow

### 1. Scaffold a course

```bash
npm run new:course -- --title="Your Course Title"
```

This creates:

- the course folder
- a starter `course.md`
- a starter `resources.md`
- 8 starter lesson files
- an SVG cover image

### 2. Write the course

Edit:

- `course.md`
- `resources.md`
- the lesson Markdown files

### 3. Compile Markdown to JSON

```bash
npm run build:courses
```

This generates:

- `assets/data/course-<slug>.json`
- `assets/data/courses.json`
- `assets/data/resources.json`

### 4. Validate everything

```bash
npm run validate
```

### 5. Build the Pages bundle

```bash
npm run build
```

This also creates `dist/`, which is the deploy artifact for GitHub Pages.

## `course.md` Format

Use simple frontmatter plus a module list.

```md
---
id: course-example
slug: example-course
title: Example Course
subtitle: A short promise
description: Catalog-ready description here.
category: Custom
difficulty: Beginner
tags:
  - example
  - notes
featured: false
coverImage: assets/images/example-course-cover.svg
coverTheme: ocean
coverIcon: spark
---

## Modules
1. Foundations | Start with the mental model.
2. First Practice | Move into real use.
3. Better Habits | Reinforce technique.
4. Confident Use | Tackle nuance and next steps.
```

### Notes

- `slug` drives the generated file name: `assets/data/course-<slug>.json`
- `id` should stay stable once you start using the course, because progress data keys off lesson IDs derived from it
- `coverTheme` and `coverIcon` are for generated cover art helpers

## `resources.md` Format

Use one `###` block per resource.

```md
### Pro Git
- Type: reference
- URL: https://git-scm.com/book/en/v2
- Description: Canonical free Git book and one of the best primary learning sources.
- Tags: git, official, book

### Great Walkthrough Video
- Type: video
- URL: https://www.youtube.com/watch?v=example
- Description: Strong beginner walkthrough for the first practical workflow.
- Tags: video, walkthrough
```

### Resource Rules

- prefer high-trust sources
- keep descriptions concise and useful
- use `video` for watchable resources
- lesson `Resources` sections should reference resource titles exactly

## Lesson Format

Each lesson uses frontmatter plus fixed sections.

```md
---
title: Example Lesson
slug: example-lesson
module: 1
order: 1
---

## Objectives
- Objective one
- Objective two

## Lesson
Write the lesson in normal Markdown.

## Checklist
- Action step
- Verification step

## Reflection
- Reflection prompt one
- Reflection prompt two

## Quiz
### Question 1
Prompt here.
- [ ] Wrong answer
- [x] Correct answer
- [ ] Wrong answer
- [ ] Wrong answer
Explanation: Explain the distinction being tested.

## Resources
- Pro Git
```

## Supported Markdown

The compiler supports the Markdown features most useful for course writing:

- headings
- paragraphs
- unordered lists
- ordered lists
- blockquotes
- fenced code blocks
- links
- inline code
- emphasis and strong text
- simple tables
- images

It also supports callout-style blockquotes:

```md
> [!TIP]
> Use a small, high-signal tip here.
```

## What the Validation Phase Checks

The validation phase uses local scripts only.

No LLM calls or API tokens are involved.

It checks things like:

- JSON parses cleanly
- authored Markdown frontmatter is valid
- course IDs, slugs, and lesson IDs are unique
- cover images exist
- lesson structure is complete
- quiz blocks are well-formed
- `correctIndex` values are valid
- lesson resources reference real resource titles
- `courses.json` matches the generated course files
- JS files pass `node --check`

If validation fails, the script prints concrete local errors that you can fix directly.

## Cover Art Workflow

The scaffold command creates a default SVG cover.

You can also generate or refresh one manually:

```bash
npm run generate:cover -- --course=authoring/courses/example-course
```

Optional PNG export:

```bash
npm run generate:cover -- --course=authoring/courses/example-course --png
```

The PNG export uses ImageMagick if `magick` is available locally.

If not, the SVG still works perfectly in the site.

## Best Authoring Practices

- start simple and increase complexity gradually
- write lesson content to teach, not merely describe
- include examples, not just abstractions
- use checklist items for action and verification
- make reflection prompts specific and alive
- make quizzes test real understanding, not trivia
- keep resource lists curated, not bloated

## Strong Recommendation

Treat `authoring/` as your studio and `assets/data/` as compiled output.

If you stay disciplined about that, adding new courses becomes much easier and much safer.
