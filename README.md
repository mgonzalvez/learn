# Personal Learning Hub

Personal Learning Hub is a static personal learning portal designed for GitHub Pages. It uses plain HTML, CSS, and vanilla JavaScript, stores user state in `localStorage`, and loads all course content from JSON.

## Documentation

The project now includes a dedicated docs set in [`/docs`](./docs/README.md):

- [Docs Home](./docs/README.md)
- [Project Status](./docs/PROJECT_STATUS.md)
- [Visual Presentation](./docs/VISUAL_PRESENTATION.md)
- [Site Logic](./docs/SITE_LOGIC.md)
- [Instructional Design](./docs/INSTRUCTIONAL_DESIGN.md)
- [Course Authoring](./docs/COURSE_AUTHORING.md)
- [Style Guide](./docs/STYLE_GUIDE.md)

## Features

- Dashboard with featured courses, bookmarks, recent lessons, and progress summaries
- Course catalog with search, filters, sort options, and progress-aware cards
- Course detail and lesson pages powered by JSON content
- Progress tracking that includes lesson completion, checklist activity, and quiz submission
- Notes, bookmarks, recent activity, and theme preference stored locally in the browser
- Course-level and site-level search across courses, lessons, tags, and resources
- Responsive layout with top navigation and a desktop left sidebar for course navigation
- Markdown-first course authoring with Node-based compilation into site JSON
- Local validation and deploy bundling for GitHub Pages

## File Structure

```text
/
  index.html
  courses.html
  course.html
  lesson.html
  progress.html
  notes.html
  resources.html
  404.html
  README.md
  /docs/
    README.md
    PROJECT_STATUS.md
    VISUAL_PRESENTATION.md
    SITE_LOGIC.md
    INSTRUCTIONAL_DESIGN.md
    COURSE_AUTHORING.md
    STYLE_GUIDE.md
  /authoring/
    README.md
    /courses/
      ...
    /templates/
      course.md
      lesson.md
      resources.md
  /assets/
    /css/
      styles.css
    /js/
      app.js
      data.js
      learning.js
      notes.js
      progress.js
      quiz.js
      search.js
      storage.js
      ui.js
    /data/
      courses.json
      course-homelab-foundations.json
      course-board-game-design-workshop.json
      course-local-models-agentic-mac.json
      course-markdown-writing-workshop.json
      resources.legacy.json
      resources.json
    /images/
      homelab-foundations-cover.svg
      board-game-design-cover.svg
      local-models-mac-cover.svg
      markdown-writing-cover.png
```

## Content Model

`assets/data/courses.json` contains generated course summaries used by the dashboard and catalog.

Each individual course file contains:

- course metadata
- modules
- lessons
- lesson content, checklist items, reflection prompts, quiz questions, and related resources

The application links catalog entries to a course file through the `slug`, so adding a normal course does not require JavaScript changes.

## Add a New Course

New authored courses should be created in Markdown, not by hand-editing JSON.

1. Scaffold a new course:
   `npm run new:course -- --title="Your Course Title"`
2. Write the course in `authoring/courses/<slug>/`.
3. Compile the Markdown source:
   `npm run build:courses`
4. Validate the generated site data:
   `npm run validate`

The compiler will generate:

- `assets/data/course-<slug>.json`
- `assets/data/courses.json`
- `assets/data/resources.json`

The catalog, dashboard, course page, lesson page, search, and progress views will pick the course up automatically after the build.

See [docs/COURSE_AUTHORING.md](./docs/COURSE_AUTHORING.md) for the full authoring format.

## Query Parameter Routing

This project uses static query parameters instead of server routing:

- `course.html?course=homelab-foundations`
- `lesson.html?course=homelab-foundations&lesson=docker-compose-basics`

If a required query parameter is missing or invalid, the page shows a friendly error state with a path back to the catalog.

## Local Storage

All personal state stays in the browser:

- completed lessons
- checklist progress
- quiz submissions
- lesson engagement
- activity log
- bookmarks
- notes
- recent lessons
- last visited lesson
- theme preference

Clearing browser storage resets progress for that browser only.

## Build and Deploy

Local commands:

```bash
npm run build:courses
npm run validate
npm run build
```

What they do:

- `build:courses`: compile authored Markdown into JSON and regenerate the course/resource indexes
- `validate`: run local integrity checks and JS syntax checks
- `build`: compile data, validate, and create the deployable `dist/` bundle

## Deploy to GitHub Pages

The repository now includes a GitHub Actions workflow at [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml).

Recommended setup:

1. Push the repository to `mgonzalvez.github.io`.
2. In GitHub, open `Settings > Pages`.
3. Set the site to use GitHub Actions as the source.
4. Push to `main`.

The workflow will:

1. build authored course data
2. validate the site locally in CI
3. create `dist/`
4. deploy `dist/` to GitHub Pages

When you are ready to use `learn.gonzhome.us`, add a `CNAME` file at the repo root containing:

```text
learn.gonzhome.us
```

Then configure the custom domain in GitHub Pages settings and in your DNS.
