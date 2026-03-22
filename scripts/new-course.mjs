import fs from "node:fs";
import path from "node:path";

import {
  AUTHORING_DIR,
  ensureDir,
  parseArgs,
  slugify,
  toCourseId,
} from "./course-authoring-lib.mjs";
import { renderCourseCoverSvg } from "./generate-course-cover.mjs";

const args = parseArgs();
const title = args.title;

if (!title) {
  throw new Error('Use `npm run new:course -- --title="Your Course Title"` to scaffold a new authored course.');
}

const slug = args.slug || slugify(title);
const courseId = args.id || toCourseId(slug);
const courseDir = path.join(AUTHORING_DIR, slug);
const lessonsDir = path.join(courseDir, "lessons");

if (fs.existsSync(courseDir)) {
  throw new Error(`Course folder already exists: ${courseDir}`);
}

ensureDir(lessonsDir);

const coverImage = `assets/images/${slug}-cover.svg`;
const modules = [
  "1. Foundations | Define the mental model and orient the learner.",
  "2. First Practice | Move from theory into real use.",
  "3. Stronger Habits | Reinforce technique, judgment, and repetition.",
  "4. Confident Use | Tackle nuance, edge cases, and next steps.",
].join("\n");

fs.writeFileSync(
  path.join(courseDir, "course.md"),
  `---
id: ${courseId}
slug: ${slug}
title: ${title}
subtitle: Add a clear one-line promise for the course
description: Add a catalog-ready description that explains the learner outcome and why the course matters.
category: Custom
difficulty: Beginner
tags:
  - custom
featured: false
coverImage: ${coverImage}
coverTheme: ocean
coverIcon: spark
---

# Course Blueprint

Use this file for course-level metadata and module planning.

## Modules
${modules}
`
);

fs.writeFileSync(
  path.join(courseDir, "resources.md"),
  `# Course Resources

List the 3 to 5 highest-trust sources for the course here.

### Example Resource
- Type: reference
- URL: https://example.com
- Description: Replace this with a concise explanation of why the source is trustworthy and useful.
- Tags: official, example
`
);

const lessonTemplate = (index, moduleNumber, lessonTitle) => `---
title: ${lessonTitle}
slug: ${slugify(lessonTitle)}
module: ${moduleNumber}
order: ${index}
---

## Objectives
- Add a practical learning objective
- Add a second concrete objective
- Add a third objective if needed

## Lesson
Write the lesson in Markdown here.

Use normal Markdown for:

- lists
- links
- tables
- code fences
- blockquotes

You can also use callout-style blockquotes:

> [!TIP]
> Add a short tip here.

## Checklist
- Add one action step
- Add one verification step
- Add one habit-building step

## Reflection
- Add one reflective prompt that connects the lesson to your real workflow
- Add a second prompt that helps with transfer or memory

## Quiz
### Question 1
Write the prompt here.
- [ ] Wrong answer
- [x] Correct answer
- [ ] Wrong answer
- [ ] Wrong answer
Explanation: Explain the distinction the learner should understand.

### Question 2
Write the prompt here.
- [x] Correct answer
- [ ] Wrong answer
- [ ] Wrong answer
- [ ] Wrong answer
Explanation: Explain why the correct answer matters.

## Resources
- Example Resource
`;

const lessonSeeds = [
  [1, 1, "Start Here"],
  [2, 1, "Core Mental Model"],
  [3, 2, "First Practical Workflow"],
  [4, 2, "Repeat the Workflow with Confidence"],
  [5, 3, "Common Mistakes and Better Habits"],
  [6, 3, "Practice and Troubleshooting"],
  [7, 4, "More Advanced Use"],
  [8, 4, "What to Do Next"],
];

lessonSeeds.forEach(([index, moduleNumber, lessonTitle]) => {
  fs.writeFileSync(path.join(lessonsDir, `${String(index).padStart(2, "0")}-${slugify(lessonTitle)}.md`), lessonTemplate(index, moduleNumber, lessonTitle));
});

const coverPath = path.join(process.cwd(), coverImage);
ensureDir(path.dirname(coverPath));
fs.writeFileSync(
  coverPath,
  renderCourseCoverSvg({
    title,
    subtitle: "Draft cover generated automatically",
    theme: "ocean",
    icon: "spark",
  })
);

console.log(`Scaffolded ${path.relative(process.cwd(), courseDir)}`);
console.log(`Generated ${coverImage}`);
console.log("Next steps:");
console.log("1. Fill in course.md, resources.md, and the lesson files.");
console.log("2. Run `npm run build:courses`.");
console.log("3. Run `npm run validate`.");

