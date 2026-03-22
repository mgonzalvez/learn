# Site Logic

## Architecture Overview

Personal Learning Hub is a multi-page static site.

It uses:

- HTML for route pages
- CSS for the visual system
- vanilla JavaScript for rendering and interactivity
- generated JSON for runtime content
- `localStorage` for all user state

No backend is involved.

## Routing Model

The site uses static pages plus query parameters.

Primary routes:

- `index.html`
- `courses.html`
- `course.html?course=<slug>`
- `lesson.html?course=<slug>&lesson=<slug>`
- `progress.html`
- `notes.html`
- `resources.html`
- `404.html`

This keeps the site GitHub Pages-friendly without requiring client-side framework routing.

## Rendering Flow

The main runtime lives in `assets/js/app.js`.

At a high level:

1. The page loads.
2. `app.js` reads `data-page` from the `<body>`.
3. The correct page renderer is selected.
4. Data is loaded from JSON.
5. The shell is rendered.
6. Page-specific hydration binds event listeners and interactive behavior.

This architecture keeps the product simple while still allowing richer page-specific logic.

## Core Data Files

### Authoring Source

New custom courses are authored in Markdown under `authoring/courses/`.

A local Node pipeline compiles that authored content into the JSON files the runtime reads.

This keeps the browser runtime simple while making course creation much more humane.

### `assets/data/courses.json`

Used for:

- dashboard summaries
- catalog cards
- category and difficulty filtering
- high-level course metadata

This file is now generated.

### `assets/data/course-<slug>.json`

Used for:

- full course detail pages
- lesson pages
- course search
- progress rollups

Each course contains:

- metadata
- modules
- lessons
- lesson objectives
- lesson content
- checklist items
- reflection prompts
- quizzes
- previous and next lesson relationships

Some of these files are hand-maintained legacy JSON. New authored courses should be generated from Markdown.

### `assets/data/resources.json`

Used for:

- related resources on course pages
- site resource library
- search indexing

This file is now generated from:

- `assets/data/resources.legacy.json`
- any authored `resources.md` files

## Enriched Course Model

Raw course JSON is not used as-is.

The app enriches course data through `assets/js/learning.js`.

This enrichment currently computes:

- lesson timing
- course timing
- lesson count
- module count
- dynamic estimated hours

This is important because the current product no longer trusts static duration metadata blindly. It derives timing from the actual shape of the lesson.

## Timing Model

Lesson timing is split into:

- core study time
- practice time

The current timing estimator uses:

- content word count
- objective density
- code-block count
- heading count
- list density
- checklist load
- reflection load
- quiz load

This yields:

- per-lesson guided time
- per-course guided time
- course-level “core + practice” splits

The timing model is heuristic, not biometric. Its job is to create more believable learning-time estimates than flat placeholder numbers.

## User State Model

All personal state is stored in `localStorage`.

Current state areas include:

- completed lessons
- completed checklist items
- bookmarks
- notes
- recent lessons
- theme preference
- last visited lesson
- quiz results
- lesson engagement
- activity log

This state is intentionally browser-local.

There is no account sync and no cross-device persistence.

## Progress Model

The current progress model is richer than a binary complete/incomplete system.

### Lesson State

A lesson can effectively be:

- `not-started`
- `started`
- `in-progress`
- `completed`

These are inferred from:

- whether the lesson has been viewed
- whether checklist items were used
- whether the quiz was submitted
- whether the lesson was explicitly marked complete

### Lesson Progress

Lesson progress is a weighted rollup of:

- engagement start
- checklist completion ratio
- quiz submission
- explicit completion

This allows the platform to distinguish between:

- “I looked at it”
- “I worked with it”
- “I completed it”

### Course Progress

Course progress is the average of enriched lesson progress values across all lessons in the course.

Additional course-level metrics include:

- completed lessons
- started lessons
- in-progress lessons
- remaining time
- completed study time
- state label

## Activity Model

The site now logs meaningful learning events, such as:

- lesson views
- checklist interactions
- quiz submissions
- note saves
- lesson completion toggles

This supports:

- recent activity summaries
- active-day counts
- streak calculation
- dashboard heatmap visualization

This is a major part of making the static site feel like a living learning platform.

## Search Model

Search is handled entirely client-side.

The site builds an index from:

- course summaries
- lesson content and objectives
- resources

Search supports:

- site-wide global search
- course-level lesson filtering
- notes search
- resource filtering

Search is intentionally lightweight and local-first.

## Notes Model

Notes are lesson-scoped and stored locally.

Notes appear:

- on the lesson page
- on the notes page

This keeps the writing flow contextual while still making later review easy.

## Reset Behavior

Course reset clears:

- completed lessons
- checklist state
- quiz results
- lesson engagement for that course
- recent lesson history for those lessons
- last-visited pointer for that course

Course reset intentionally preserves:

- notes
- bookmarks

This is a product choice, not an accident.

The goal is to allow replay without discarding user-authored thinking.

## Technical Philosophy

The site should continue to behave like a product, not like a pile of utilities.

That means:

- computed data should be meaningful
- state should reflect learning behavior honestly
- UI should expose intelligence, not just storage
- flat-site constraints should lead to elegance, not feature poverty

## Future Logic Opportunities

Possible future site logic additions include:

- focus mode state
- study plan scheduling
- spaced review queues
- personal learning goals
- course roadmap completion heatmaps
- milestone badges tied to meaningful thresholds
- local export and import of progress state

Any future logic should remain compatible with the no-backend, GitHub Pages deployment model unless the product philosophy changes intentionally.
