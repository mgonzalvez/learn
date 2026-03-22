import { flattenLessons, getAllCoursesDetailed, getCourseSummaries, getResources } from "./data.js";
import { getCourseProgress } from "./progress.js";

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ");
}

function createSnippet(text, query) {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const index = normalize(normalizedText).indexOf(normalize(query));
  if (index === -1) {
    return normalizedText.slice(0, 160);
  }
  const start = Math.max(0, index - 50);
  const end = Math.min(normalizedText.length, index + 110);
  return `${start > 0 ? "..." : ""}${normalizedText.slice(start, end)}${end < normalizedText.length ? "..." : ""}`;
}

export async function buildSiteIndex() {
  const [summaries, courses, resources] = await Promise.all([getCourseSummaries(), getAllCoursesDetailed(), getResources()]);
  const courseItems = summaries.map((course) => ({
    type: "course",
    id: course.id,
    href: `course.html?course=${course.slug}`,
    title: course.title,
    subtitle: course.subtitle,
    body: `${course.description} ${(course.tags || []).join(" ")}`,
    tags: course.tags || [],
    progress: getCourseProgress(courses.find((item) => item.slug === course.slug)),
  }));
  const lessonItems = courses.flatMap((course) =>
    flattenLessons(course).map((lesson) => ({
      type: "lesson",
      id: lesson.id,
      href: `lesson.html?course=${course.slug}&lesson=${lesson.slug}`,
      title: lesson.title,
      subtitle: `${course.title} · ${lesson.moduleTitle}`,
      body: `${stripHtml(lesson.content)} ${(lesson.objectives || []).join(" ")} ${(lesson.resources || []).join(" ")}`,
      tags: course.tags || [],
      progress: 0,
    }))
  );
  const resourceItems = resources.map((resource) => ({
    type: "resource",
    id: resource.id,
    href: resource.url,
    title: resource.title,
    subtitle: resource.type,
    body: `${resource.description} ${(resource.tags || []).join(" ")}`,
    tags: resource.tags || [],
    progress: 0,
    external: true,
  }));
  return [...courseItems, ...lessonItems, ...resourceItems];
}

export function searchItems(items, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }
  return items
    .map((item) => {
      const haystack = normalize(`${item.title} ${item.subtitle} ${item.body} ${(item.tags || []).join(" ")}`);
      const score =
        (normalize(item.title).includes(normalizedQuery) ? 5 : 0) +
        (normalize(item.subtitle).includes(normalizedQuery) ? 3 : 0) +
        (haystack.includes(normalizedQuery) ? 1 : 0);
      return score
        ? {
            ...item,
            score,
            snippet: createSnippet(`${item.subtitle}. ${item.body}`, query),
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function filterCourses(courses, filters = {}) {
  const query = normalize(filters.query);
  const difficulty = filters.difficulty || "";
  const category = filters.category || "";
  const status = filters.status || "";
  const tag = filters.tag || "";
  const sort = filters.sort || "alphabetical";

  const filtered = courses.filter((course) => {
    const progress = course.progress ?? 0;
    const state = course.state || (progress >= 100 ? "completed" : progress > 0 ? "in-progress" : "not-started");
    const matchesQuery = !query
      || normalize(`${course.title} ${course.subtitle} ${course.description} ${(course.tags || []).join(" ")}`).includes(query);
    const matchesDifficulty = !difficulty || course.difficulty === difficulty;
    const matchesCategory = !category || course.category === category;
    const matchesTag = !tag || (course.tags || []).includes(tag);
    const matchesStatus =
      !status || state === status;
    return matchesQuery && matchesDifficulty && matchesCategory && matchesTag && matchesStatus;
  });

  const sorters = {
    alphabetical: (a, b) => a.title.localeCompare(b.title),
    updated: (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
    progress: (a, b) => (b.progress ?? 0) - (a.progress ?? 0),
  };

  return filtered.sort(sorters[sort] || sorters.alphabetical);
}
