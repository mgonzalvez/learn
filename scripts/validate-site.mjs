import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { enrichCourse } from "../assets/js/learning.js";
import {
  COURSE_INDEX_PATH,
  DATA_DIR,
  findAuthoredCourseDirs,
  loadAllCourseFiles,
  parseFrontmatter,
  readText,
  relative,
  RESOURCES_PATH,
  ROOT_DIR,
  assert,
} from "./course-authoring-lib.mjs";

const errors = [];

function collect(fn) {
  try {
    fn();
  } catch (error) {
    errors.push(error.message);
  }
}

collect(() => {
  JSON.parse(readText(COURSE_INDEX_PATH));
  JSON.parse(readText(RESOURCES_PATH));
});

const authoredDirs = findAuthoredCourseDirs();
for (const courseDir of authoredDirs) {
  collect(() => {
    const coursePath = path.join(courseDir, "course.md");
    parseFrontmatter(readText(coursePath), coursePath);
  });
}

const resources = JSON.parse(readText(RESOURCES_PATH));
const courseSummaries = JSON.parse(readText(COURSE_INDEX_PATH));
const summaryById = new Map(courseSummaries.map((course) => [course.id, course]));
const resourceTitles = new Set(resources.map((resource) => resource.title));
const resourceIds = new Set();
const courseIds = new Set();
const courseSlugs = new Set();
const lessonIds = new Set();

for (const resource of resources) {
  collect(() => {
    assert(resource.id && !resourceIds.has(resource.id), `Duplicate or missing resource id: ${resource.id}`);
    resourceIds.add(resource.id);
    assert(resource.title, "Every resource needs a title.");
    assert(resource.url, `Resource "${resource.title}" is missing a URL.`);
    assert(summaryById.has(resource.relatedCourseId), `Resource "${resource.title}" points to unknown course id "${resource.relatedCourseId}".`);
  });
}

for (const { path: coursePath, course } of loadAllCourseFiles()) {
  collect(() => {
    assert(course.id && !courseIds.has(course.id), `Duplicate or missing course id: ${course.id}`);
    courseIds.add(course.id);
    assert(course.slug && !courseSlugs.has(course.slug), `Duplicate or missing course slug: ${course.slug}`);
    courseSlugs.add(course.slug);
    assert(course.title, `Course file ${relative(coursePath)} is missing a title.`);
    assert(course.coverImage, `Course "${course.title}" is missing a cover image path.`);
    assert(fs.existsSync(path.join(ROOT_DIR, course.coverImage)), `Course "${course.title}" references missing image ${course.coverImage}.`);

    const enriched = enrichCourse(course);
    const summary = summaryById.get(course.id);
    assert(summary, `Course "${course.title}" is missing from courses.json.`);
    assert(Math.abs(summary.estimatedHours - enriched.estimatedHours) < 0.11, `Course summary hours are stale for "${course.title}". Run build:courses.`);
    assert(summary.lessonCount === enriched.lessonCount, `Lesson count mismatch for "${course.title}" in courses.json.`);
    assert(summary.moduleCount === enriched.moduleCount, `Module count mismatch for "${course.title}" in courses.json.`);

    const flatLessons = course.modules.flatMap((module) => module.lessons);
    flatLessons.forEach((lesson, index) => {
      assert(lesson.id && !lessonIds.has(lesson.id), `Duplicate or missing lesson id: ${lesson.id}`);
      lessonIds.add(lesson.id);
      assert(lesson.title, `A lesson in "${course.title}" is missing a title.`);
      assert(Array.isArray(lesson.objectives) && lesson.objectives.length >= 2, `Lesson "${lesson.title}" should have at least two objectives.`);
      assert(Array.isArray(lesson.checklist) && lesson.checklist.length >= 2, `Lesson "${lesson.title}" should have at least two checklist items.`);
      assert(Array.isArray(lesson.reflectionQuestions) && lesson.reflectionQuestions.length >= 2, `Lesson "${lesson.title}" should have at least two reflection prompts.`);
      assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 2, `Lesson "${lesson.title}" should have at least two quiz questions.`);
      assert(typeof lesson.content === "string" && lesson.content.trim().length > 120, `Lesson "${lesson.title}" content looks too short.`);
      lesson.quiz.forEach((question, questionIndex) => {
        assert(Array.isArray(question.choices) && question.choices.length === 4, `Lesson "${lesson.title}" question ${questionIndex + 1} must have exactly four choices.`);
        assert(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex <= 3, `Lesson "${lesson.title}" question ${questionIndex + 1} has an invalid correctIndex.`);
        assert(question.explanation, `Lesson "${lesson.title}" question ${questionIndex + 1} is missing an explanation.`);
      });
      (lesson.resources || []).forEach((resourceTitle) => {
        assert(resourceTitles.has(resourceTitle), `Lesson "${lesson.title}" references missing resource "${resourceTitle}".`);
      });
      const expectedPrevious = index > 0 ? flatLessons[index - 1].id : null;
      const expectedNext = index < flatLessons.length - 1 ? flatLessons[index + 1].id : null;
      assert(lesson.previousLessonId === expectedPrevious, `Lesson "${lesson.title}" has an incorrect previousLessonId.`);
      assert(lesson.nextLessonId === expectedNext, `Lesson "${lesson.title}" has an incorrect nextLessonId.`);
    });
  });
}

const filesToCheck = [
  "assets/js/app.js",
  "assets/js/data.js",
  "assets/js/learning.js",
  "assets/js/notes.js",
  "assets/js/progress.js",
  "assets/js/quiz.js",
  "assets/js/search.js",
  "assets/js/storage.js",
  "assets/js/ui.js",
  "scripts/build-course-data.mjs",
  "scripts/build-dist.mjs",
  "scripts/course-authoring-lib.mjs",
  "scripts/generate-course-cover.mjs",
  "scripts/new-course.mjs",
  "scripts/validate-site.mjs",
];

for (const file of filesToCheck) {
  collect(() => {
    execFileSync(process.execPath, ["--check", file], {
      cwd: ROOT_DIR,
      stdio: "ignore",
    });
  });
}

if (errors.length) {
  console.error("Validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Validation passed.");
