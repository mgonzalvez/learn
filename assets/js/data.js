import { enrichCourse } from "./learning.js";

const DATA_ROOT = "./assets/data";

let courseSummariesPromise;
let resourcesPromise;
const courseCache = new Map();

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export function getCourseSummaries() {
  if (!courseSummariesPromise) {
    courseSummariesPromise = fetchJson(`${DATA_ROOT}/courses.json`);
  }
  return courseSummariesPromise;
}

export function getResources() {
  if (!resourcesPromise) {
    resourcesPromise = fetchJson(`${DATA_ROOT}/resources.json`);
  }
  return resourcesPromise;
}

export async function getCourseBySlug(slug) {
  if (courseCache.has(slug)) {
    return courseCache.get(slug);
  }
  try {
    const course = enrichCourse(await fetchJson(`${DATA_ROOT}/course-${slug}.json`));
    courseCache.set(slug, course);
    return course;
  } catch (error) {
    return null;
  }
}

export async function getAllCoursesDetailed() {
  const summaries = await getCourseSummaries();
  return Promise.all(summaries.map((summary) => getCourseBySlug(summary.slug)));
}

export function flattenLessons(course) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      moduleId: module.id,
      moduleTitle: module.title,
    }))
  );
}

export function findLessonBySlug(course, lessonSlug) {
  for (const module of course.modules) {
    const lesson = module.lessons.find((item) => item.slug === lessonSlug);
    if (lesson) {
      return { lesson, module };
    }
  }
  return null;
}

export async function getRelatedResources(courseId) {
  const resources = await getResources();
  return resources.filter((resource) => resource.relatedCourseId === courseId);
}
