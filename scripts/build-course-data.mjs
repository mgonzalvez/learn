import path from "node:path";

import {
  buildCombinedResources,
  buildCourseSummaries,
  cleanupMissingAuthoredCourseFiles,
  findAuthoredCourseDirs,
  getCourseJsonPath,
  loadAuthoredCourse,
  loadCourseIndex,
  relative,
  RESOURCES_PATH,
  COURSE_INDEX_PATH,
  writeJson,
} from "./course-authoring-lib.mjs";

cleanupMissingAuthoredCourseFiles();

const authoredDirs = findAuthoredCourseDirs();
const authoredResources = [];

for (const courseDir of authoredDirs) {
  const { course, resources } = loadAuthoredCourse(courseDir);
  writeJson(getCourseJsonPath(course.slug), course);
  authoredResources.push(...resources);
  console.log(`Built ${relative(getCourseJsonPath(course.slug))} from ${relative(courseDir)}`);
}

const previousSummaries = loadCourseIndex();
writeJson(COURSE_INDEX_PATH, buildCourseSummaries(previousSummaries));
writeJson(RESOURCES_PATH, buildCombinedResources(authoredResources));

console.log(`Updated ${relative(COURSE_INDEX_PATH)}`);
console.log(`Updated ${relative(RESOURCES_PATH)}`);

