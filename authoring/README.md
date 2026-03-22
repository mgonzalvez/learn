# Course Authoring Workspace

This folder is the Markdown source-of-truth area for new custom courses.

Each authored course lives in:

```text
authoring/courses/<course-slug>/
  course.md
  resources.md
  lessons/
    01-lesson.md
    02-lesson.md
    ...
```

## Quick Start

1. Scaffold a new course:

```bash
npm run new:course -- --title="Your Course Title"
```

2. Fill in:

- `course.md`
- `resources.md`
- the lesson files in `lessons/`

3. Compile Markdown into site JSON:

```bash
npm run build:courses
```

4. Validate authored content and generated site data:

```bash
npm run validate
```

5. Build the deployable GitHub Pages bundle:

```bash
npm run build
```

## What Gets Generated

- `assets/data/course-<slug>.json`
- `assets/data/courses.json`
- `assets/data/resources.json`
- `dist/` for deployment

Do not treat the generated JSON as the source of truth for authored courses.

For the full format and authoring rules, see [docs/COURSE_AUTHORING.md](../docs/COURSE_AUTHORING.md).
