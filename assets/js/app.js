import { getAllCoursesDetailed, getCourseBySlug, getCourseSummaries, getRelatedResources, getResources, findLessonBySlug } from "./data.js";
import { formatMinutes, formatStudySplit, mergeCourseSummary } from "./learning.js";
import { bindNotesEditor, getAllNotesEntries, updateNote } from "./notes.js";
import {
  getActiveStreak,
  getActivityHeatmap,
  getCourseProgress,
  getCourseProgressDetails,
  getCourseState,
  getLessonProgress,
  getLessonState,
  getProgressSummary,
  getRecentCompletions,
  getResumeLesson,
  getStatusLabel,
} from "./progress.js";
import { bindQuiz, renderQuiz } from "./quiz.js";
import { buildSiteIndex, filterCourses, searchItems } from "./search.js";
import {
  addRecentLesson,
  clearThemePreference,
  deleteNote,
  getBookmarkedLessons,
  getChecklistState,
  getNote,
  getQuizResults,
  getRecentLessons,
  logActivity,
  markLessonEngaged,
  isBookmarked,
  isLessonCompleted,
  resetCourseProgress,
  setLastVisitedLesson,
  setThemePreference,
  toggleBookmark,
  toggleChecklistItem,
  toggleCompletedLesson,
} from "./storage.js";
import { emptyState, escapeHtml, progressBar, shellTemplate, statusPill, toast } from "./ui.js";

const page = document.body.dataset.page;
const shell = document.getElementById("site-shell");

boot();

async function boot() {
  const mainContent = await renderPage(page);
  shell.innerHTML = shellTemplate({ currentPage: normalizePage(page), mainContent });
  bindSharedUI();
  await hydratePage(page);
}

function normalizePage(currentPage) {
  return currentPage === "dashboard" ? "dashboard" : currentPage;
}

async function renderPage(currentPage) {
  try {
    switch (currentPage) {
      case "dashboard":
        return await renderDashboardPage();
      case "courses":
        return await renderCoursesPage();
      case "course":
        return await renderCoursePage();
      case "lesson":
        return await renderLessonPage();
      case "progress":
        return await renderProgressPage();
      case "notes":
        return await renderNotesPage();
      case "resources":
        return await renderResourcesPage();
      case "not-found":
      default:
        return renderNotFoundPage();
    }
  } catch (error) {
    return emptyState("Something went wrong", "The page data did not load correctly. Try refreshing or returning to the catalog.", '<a class="button" href="courses.html">Browse courses</a>');
  }
}

function bindSharedUI() {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const searchPanel = document.querySelector("[data-search-panel]");
  const searchTriggers = document.querySelectorAll("[data-global-search-trigger]");
  const searchInput = document.querySelector("[data-global-search-input]");
  const searchResults = document.querySelector("[data-global-search-results]");
  const closeSearch = document.querySelector("[data-close-search]");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      const open = navLinks.dataset.open === "true";
      navLinks.dataset.open = String(!open);
      mobileToggle.setAttribute("aria-expanded", String(!open));
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setThemePreference(next);
      toast(`Theme set to ${next}`);
    });
    themeToggle.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      clearThemePreference();
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
      toast("Theme reset to system");
    });
  }

  if (searchPanel && searchTriggers.length && searchInput && searchResults) {
    const openSearch = async (initialValue = "") => {
      searchPanel.setAttribute("open", "");
      searchInput.value = initialValue.trim();
      searchInput.focus();
      await runGlobalSearch(searchInput.value, searchResults);
    };
    searchTriggers.forEach((trigger) => {
      trigger.addEventListener("focus", () => openSearch(trigger.value));
      trigger.addEventListener("input", () => openSearch(trigger.value));
      trigger.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          openSearch(trigger.value);
        }
      });
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch("");
      }
      if (event.key === "Escape") {
        searchPanel.removeAttribute("open");
      }
    });
    searchInput.addEventListener("input", () => runGlobalSearch(searchInput.value, searchResults));
    closeSearch?.addEventListener("click", () => searchPanel.removeAttribute("open"));
    searchPanel.addEventListener("click", (event) => {
      if (event.target === searchPanel) {
        searchPanel.removeAttribute("open");
      }
    });
  }
}

async function runGlobalSearch(query, container) {
  const index = await buildSiteIndex();
  const results = searchItems(index, query).slice(0, 12);
  container.innerHTML = results.length
    ? results
        .map(
          (item) => `
            <a class="search-result" href="${item.href}" ${item.external ? 'target="_blank" rel="noreferrer"' : ""}>
              <div class="eyebrow">${item.type}</div>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="muted">${escapeHtml(item.subtitle)}</p>
              <p class="muted">${escapeHtml(item.snippet)}</p>
            </a>
          `
        )
        .join("")
    : emptyState("No results yet", "Try a course title, lesson concept, tag, or resource keyword.");
}

function buildCourseViews(summaries, courses) {
  return summaries.map((summary) => {
    const detailed = courses.find((item) => item.slug === summary.slug);
    const progress = getCourseProgressDetails(detailed);
    return {
      ...mergeCourseSummary(summary, detailed),
      ...progress,
    };
  });
}

function renderHeatmap(items) {
  return `
    <div class="heatmap" aria-label="Recent learning activity">
      ${items
        .map(
          (item) => `
            <span
              class="heatmap-cell"
              data-intensity="${Math.min(item.count, 4)}"
              title="${item.date}: ${item.count} activity ${item.count === 1 ? "signal" : "signals"}"
            ></span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderInsightStat(value, label, note = "") {
  return `
    <article class="insight-stat">
      <strong>${value}</strong>
      <span>${escapeHtml(label)}</span>
      ${note ? `<small>${escapeHtml(note)}</small>` : ""}
    </article>
  `;
}

async function renderDashboardPage() {
  const [summaries, courses] = await Promise.all([getCourseSummaries(), getAllCoursesDetailed()]);
  const recentLessons = getRecentLessons();
  const bookmarks = getBookmarkedLessons();
  const summaryWithProgress = buildCourseViews(summaries, courses);
  const featured = summaryWithProgress.filter((course) => course.featured).slice(0, 3);
  const active = summaryWithProgress.filter((course) => course.state === "started" || course.state === "in-progress").slice(0, 3);
  const recent = getRecentCompletions(courses, recentLessons).slice(0, 4);
  const bookmarkedLessons = courses
    .flatMap((course) =>
      course.modules.flatMap((module) =>
        module.lessons
          .filter((lesson) => bookmarks.includes(lesson.id))
          .map((lesson) => ({ ...lesson, courseSlug: course.slug, courseTitle: course.title }))
      )
    )
    .slice(0, 4);
  const stats = getProgressSummary(courses);
  const streak = getActiveStreak();
  const heatmap = getActivityHeatmap(42);
  const nextCourse = active[0] || featured[0];
  const nextLesson = nextCourse ? getResumeLesson(courses.find((course) => course.slug === nextCourse.slug)) : null;

  return `
    <section class="hero hero-premium">
      <article class="panel hero-copy hero-primary">
        <div class="eyebrow">Premium Static Learning Hub</div>
        <h1>Make self-study feel like a world-class learning product.</h1>
        <p class="lede">
          Structured courses, premium study flow, local-first analytics, and a modern LMS experience built entirely with flat HTML, CSS, JS, and GitHub Pages compatibility.
        </p>
        <div class="insight-grid compact">
          ${renderInsightStat(`${stats.coursesCompletedTotal}`, "Courses completed")}
          ${renderInsightStat(`${stats.coursesInProgressTotal}`, "Deep in progress")}
          ${renderInsightStat(formatMinutes(stats.completedStudyMinutes), "Guided learning completed")}
        </div>
        <div class="button-row">
          <a class="button" href="courses.html">Explore courses</a>
          <a class="button-secondary" href="progress.html">View progress</a>
        </div>
      </article>
      <aside class="panel hero-actions hero-focus">
        <div>
          <p class="eyebrow">Learning Focus</p>
          <h2>${nextCourse ? escapeHtml(nextCourse.title) : "Choose your first course"}</h2>
          <p class="muted">
            ${
              nextLesson
                ? `Next recommended lesson: ${escapeHtml(nextLesson.title)}`
                : "Search the catalog, pick a path, and the hub will keep the next best step ready."
            }
          </p>
        </div>
        ${
          nextCourse && nextLesson
            ? `
              <div class="focus-card">
                <div class="meta-row">
                  ${statusPill(nextCourse.progress)}
                  <span class="chip">${formatStudySplit(nextLesson.timing)}</span>
                </div>
                <p class="muted">${nextCourse.completedLessons}/${nextCourse.totalLessons} lessons complete</p>
                ${progressBar(nextCourse.progress, `${nextCourse.title} progress`)}
                <div class="button-row">
                  <a class="button" href="lesson.html?course=${nextCourse.slug}&lesson=${nextLesson.slug}">Continue learning</a>
                  <a class="button-secondary" href="course.html?course=${nextCourse.slug}">Open syllabus</a>
                </div>
              </div>
            `
            : ""
        }
        <label>
          <span class="muted">Search everything</span>
          <input class="control" type="search" placeholder="Docker, quantization, playtesting..." data-global-search-trigger />
        </label>
      </aside>
    </section>

    <section class="bento-grid" aria-label="Learning intelligence overview">
      <article class="panel panel-body spotlight-card">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Momentum</div>
            <h2>Your learning signal</h2>
          </div>
          <span class="chip">${streak ? `${streak}-day streak` : "Start a streak"}</span>
        </div>
        <div class="insight-grid">
          ${renderInsightStat(`${stats.lessonsStartedTotal}`, "Lessons started")}
          ${renderInsightStat(`${stats.lessonsCompletedTotal}`, "Lessons completed")}
          ${renderInsightStat(`${stats.modulesCompletedTotal}`, "Modules completed")}
          ${renderInsightStat(`${stats.activityDays}`, "Active learning days")}
        </div>
        ${renderHeatmap(heatmap)}
      </article>
      <article class="panel panel-body ring-card">
        <div class="eyebrow">Mastery Progress</div>
        <div class="ring ring-large" style="--value:${stats.averageProgress}"><span>${stats.averageProgress}%</span></div>
        <p class="muted">Average course completion across your current library.</p>
      </article>
      <article class="panel panel-body">
        <div class="eyebrow">Study Time</div>
        <h2>${formatMinutes(stats.remainingStudyMinutes)}</h2>
        <p class="muted">Estimated guided time left across all courses, based on current lesson depth and practice load.</p>
      </article>
      <article class="panel panel-body">
        <div class="eyebrow">Course States</div>
        <div class="state-list">
          <div><strong>${stats.coursesStartedTotal}</strong><span>Started</span></div>
          <div><strong>${stats.coursesInProgressTotal}</strong><span>In progress</span></div>
          <div><strong>${stats.coursesCompletedTotal}</strong><span>Completed</span></div>
        </div>
      </article>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Featured</div>
          <h2>Start with the strongest pathways</h2>
        </div>
      </div>
      <div class="dashboard-grid">
        ${featured.map((course) => renderCourseCard(course)).join("")}
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Continue Learning</div>
          <h2>Pick up where your work left off</h2>
        </div>
      </div>
      <div class="dashboard-grid">
        ${active.length ? active.map((course) => renderCourseCard(course)).join("") : emptyState("No active courses yet", "When you start lessons, your learning cockpit will build a rich continuation queue automatically.", '<a class="button" href="courses.html">Start a course</a>')}
      </div>
    </section>

    <section class="page-section">
      <div class="split-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
        <article class="panel panel-body">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Recent Lessons</div>
              <h2>Last viewed</h2>
            </div>
            <a class="inline-button" href="progress.html">Progress</a>
          </div>
          ${recent.length ? renderRecentLessons(recent) : emptyState("No recent lessons yet", "Open a lesson and it will appear here.")}
        </article>
        <article class="panel panel-body">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Bookmarks</div>
              <h2>Saved for later</h2>
            </div>
            <a class="inline-button" href="notes.html">Notes</a>
          </div>
          ${bookmarkedLessons.length ? renderBookmarks(bookmarkedLessons) : emptyState("No bookmarks yet", "Bookmark lessons from the lesson page to build your own study queue.")}
        </article>
      </div>
    </section>
  `;
}

async function renderCoursesPage() {
  const [summaries, courses] = await Promise.all([getCourseSummaries(), getAllCoursesDetailed()]);
  const enriched = buildCourseViews(summaries, courses);
  const categories = [...new Set(enriched.map((course) => course.category))].sort();
  const difficulties = [...new Set(enriched.map((course) => course.difficulty))];
  const tags = [...new Set(enriched.flatMap((course) => course.tags || []))].sort();

  return `
    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Course Catalog</div>
          <h1>Choose a track with real depth behind it.</h1>
          <p class="section-copy">Search, filter, and sort across structured high-value courses with dynamic timing, local progress intelligence, and premium syllabus views.</p>
        </div>
      </div>
      <div class="toolbar">
        <input class="control" type="search" placeholder="Search courses or tags" data-course-search />
        <select class="select-control" data-filter-category>
          <option value="">All categories</option>
          ${categories.map((item) => `<option value="${item}">${item}</option>`).join("")}
        </select>
        <select class="select-control" data-filter-difficulty>
          <option value="">All difficulties</option>
          ${difficulties.map((item) => `<option value="${item}">${item}</option>`).join("")}
        </select>
        <select class="select-control" data-filter-sort>
          <option value="alphabetical">Alphabetical</option>
          <option value="updated">Recently updated</option>
          <option value="progress">Progress</option>
        </select>
      </div>
      <div class="filters-grid">
        <select class="select-control" data-filter-status>
          <option value="">Any status</option>
          <option value="not-started">Not started</option>
          <option value="started">Started</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select class="select-control" data-filter-tag>
          <option value="">Any tag</option>
          ${tags.map((item) => `<option value="${item}">${item}</option>`).join("")}
        </select>
      </div>
      <div class="catalog-grid" data-catalog-results>
        ${enriched.map((course) => renderCourseCard(course)).join("")}
      </div>
    </section>
  `;
}

async function renderCoursePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("course");
  if (!slug) {
    return emptyState("Missing course", "This page needs a course query parameter.", '<a class="button" href="courses.html">Back to courses</a>');
  }
  const course = await getCourseBySlug(slug);
  if (!course) {
    return emptyState("Course not found", "That course slug did not match any available content.", '<a class="button" href="courses.html">Back to courses</a>');
  }
  const relatedResources = await getRelatedResources(course.id);
  const progress = getCourseProgress(course);
  const details = getCourseProgressDetails(course);
  const resumeLesson = getResumeLesson(course);
  const totalLessons = course.modules.flatMap((module) => module.lessons).length;

  return `
    <div class="course-layout">
      <aside class="course-sidebar">
        <div class="sidebar-card">
          <div class="eyebrow">Course Navigation</div>
          <h3>${escapeHtml(course.title)}</h3>
          <div class="sidebar-nav">
            ${course.modules
              .map(
                (module) => `
                  <a href="#${module.id}">${escapeHtml(module.title)}</a>
                `
              )
              .join("")}
          </div>
        </div>
      </aside>
      <main>
        <section class="panel panel-body course-hero-card">
          <div class="course-hero-grid">
            <div class="course-cover-shell">
              <img src="${course.coverImage}" alt="${escapeHtml(course.title)} cover artwork" class="course-cover-large" />
            </div>
            <div class="course-hero-copy">
              <div class="meta-row">
                <span class="chip">${escapeHtml(course.category)}</span>
                <span class="chip">${escapeHtml(course.difficulty)}</span>
                <span class="chip">${formatStudySplit(course.timing)}</span>
                ${statusPill(progress)}
              </div>
              <h1>${escapeHtml(course.title)}</h1>
              <p class="section-copy">${escapeHtml(course.subtitle)}</p>
              <p class="section-copy">${escapeHtml(course.description)}</p>
              <div class="chip-row">
                ${(course.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
              </div>
              <div class="course-hero-progress">
                ${progressBar(progress, `${course.title} progress`)}
                <div class="meta-row">
                  <span class="muted">${details.completedLessons}/${totalLessons} lessons completed</span>
                  <span class="muted">${details.remainingTimeLabel} remaining</span>
                </div>
              </div>
              <div class="button-row">
                <a class="button" href="lesson.html?course=${course.slug}&lesson=${resumeLesson.slug}">
                  ${progress >= 100 ? "Review course" : progress > 0 ? "Resume course" : "Start course"}
                </a>
                <a class="button-secondary" href="progress.html">View progress</a>
                ${
                  progress > 0
                    ? `<button class="button-danger" type="button" data-reset-course="${course.slug}">Reset progress and restart</button>`
                    : ""
                }
              </div>
            </div>
          </div>
        </section>

        <section class="course-summary-strip">
          ${renderInsightStat(formatMinutes(course.timing.totalMinutes), "Guided course time", `${formatMinutes(course.timing.coreMinutes)} read + ${formatMinutes(course.timing.practiceMinutes)} practice`)}
          ${renderInsightStat(`${course.moduleCount}`, "Modules", `${course.lessonCount} lessons`)}
          ${renderInsightStat(`${relatedResources.length}`, "Source spine", "trusted references")}
          ${renderInsightStat(details.remainingTimeLabel, "Time remaining", `${details.completionTimeLabel} completed`)}
        </section>

        <section class="page-section">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Modules</div>
              <h2>Structured syllabus with live progression</h2>
            </div>
          </div>
          <input class="control" type="search" placeholder="Search lessons inside this course" data-course-lesson-search />
          <div class="accordion">
            ${course.modules
              .map((module, index) => {
                const moduleProgress = getCourseProgress({ modules: [module] });
                const moduleMinutes = module.lessons.reduce((sum, lesson) => sum + (lesson.timing?.totalMinutes || 0), 0);
                return `
                  <article class="accordion-item" id="${module.id}">
                    <button class="accordion-toggle" type="button" data-accordion-toggle aria-expanded="${index === 0 ? "true" : "false"}">
                      <span>
                        <strong>${escapeHtml(module.title)}</strong><br />
                        <span class="muted">${escapeHtml(module.description)} · ${formatMinutes(moduleMinutes)}</span>
                      </span>
                      <span>${moduleProgress}%</span>
                    </button>
                    <div class="accordion-panel ${index === 0 ? "" : "hidden"}">
                      <ul class="lesson-list">
                        ${module.lessons
                          .map(
                            (lesson) => `
                              <li>
                                <a href="lesson.html?course=${course.slug}&lesson=${lesson.slug}">
                                  <span>
                                    <strong>${escapeHtml(lesson.title)}</strong><br />
                                    <span class="muted">${formatStudySplit(lesson.timing)} · ${getLessonProgress(lesson)}% complete · ${renderStateLabel(getLessonState(lesson))}</span>
                                  </span>
                                  <span>${isLessonCompleted(lesson.id) ? "✓" : "→"}</span>
                                </a>
                              </li>
                            `
                          )
                          .join("")}
                      </ul>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>

        <section class="page-section">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Related Resources</div>
              <h2>High-trust sources behind this course</h2>
            </div>
          </div>
          <div class="resource-grid">
            ${relatedResources.map((resource) => renderResourceCard(resource)).join("")}
          </div>
        </section>
      </main>
    </div>
  `;
}

async function renderLessonPage() {
  const params = new URLSearchParams(window.location.search);
  const courseSlug = params.get("course");
  const lessonSlug = params.get("lesson");
  if (!courseSlug || !lessonSlug) {
    return emptyState("Missing lesson route", "This page needs both course and lesson query parameters.", '<a class="button" href="courses.html">Back to courses</a>');
  }
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    return emptyState("Course not found", "That course slug did not match any available content.", '<a class="button" href="courses.html">Back to courses</a>');
  }
  const found = findLessonBySlug(course, lessonSlug);
  if (!found) {
    return emptyState("Lesson not found", "That lesson slug did not match the selected course.", `<a class="button" href="course.html?course=${courseSlug}">Back to course</a>`);
  }
  const { lesson, module } = found;
  const lessonProgress = getLessonProgress(lesson);
  const previousHref = lesson.previousLessonId ? lessonHrefFromId(course, lesson.previousLessonId) : "";
  const nextHref = lesson.nextLessonId ? lessonHrefFromId(course, lesson.nextLessonId) : "";
  const lessonTone = getLessonTone(course);
  const lessonState = getLessonState(lesson);
  const checklistCompleted = (getChecklistState()[lesson.id] || []).length;
  const quizCompleted = lesson.quiz?.length ? "Not submitted" : "No quiz";
  const noteValue = getNote(lesson.id);

  return `
    <div class="lesson-layout ${lessonTone.layoutClass}">
      <aside class="lesson-sidebar">
        <div class="sidebar-card lesson-summary-card">
          <div class="eyebrow">Lesson Summary</div>
          <h3>${escapeHtml(lesson.title)}</h3>
          <p class="muted">${escapeHtml(course.title)} · ${escapeHtml(module.title)}</p>
          <div data-lesson-progress-meter>${progressBar(lessonProgress, `${lesson.title} progress`)}</div>
          <div class="meta-row" style="margin-top:14px;">
            <span class="chip">${formatStudySplit(lesson.timing)}</span>
            <span data-lesson-status>${statusPill(lessonProgress)}</span>
          </div>
          <div class="lesson-meta-stack">
            <div><span>State</span><strong data-lesson-state-label>${renderStateLabel(lessonState)}</strong></div>
            <div><span>Checklist</span><strong data-lesson-checklist-status>${checklistCompleted}/${lesson.checklist.length}</strong></div>
            <div><span>Knowledge check</span><strong data-lesson-quiz-status>${quizCompleted}</strong></div>
            <div><span>Notes</span><strong data-lesson-note-status>${noteValue ? "Saved" : "Empty"}</strong></div>
          </div>
        </div>
      </aside>
      <main>
        <section class="panel panel-body lesson-hero-card">
          <p class="muted"><a href="index.html">Dashboard</a> / <a href="courses.html">Courses</a> / <a href="course.html?course=${course.slug}">${escapeHtml(course.title)}</a></p>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="section-copy">${escapeHtml(module.title)} · ${formatMinutes(lesson.timing.totalMinutes)} guided time</p>
          <div class="lesson-intelligence-strip">
            ${renderInsightStat(formatMinutes(lesson.timing.coreMinutes), "Core read")}
            ${renderInsightStat(formatMinutes(lesson.timing.practiceMinutes), "Practice")}
            ${renderInsightStat(`${lesson.quiz?.length || 0}`, "Knowledge checks")}
            ${renderInsightStat(`${lesson.checklist?.length || 0}`, "Action steps")}
          </div>
          ${
            lessonTone.intro
              ? `<div class="friendly-intro"><strong>${escapeHtml(lessonTone.intro.title)}</strong><p>${escapeHtml(lessonTone.intro.body)}</p></div>`
              : ""
          }
          <div class="lesson-actions">
            <div class="button-row">
              <button class="button-secondary" type="button" data-bookmark-toggle>${isBookmarked(lesson.id) ? "Remove bookmark" : "Bookmark lesson"}</button>
              <button class="button" type="button" data-complete-toggle>${isLessonCompleted(lesson.id) ? "Mark incomplete" : "Mark complete"}</button>
            </div>
          </div>
        </section>

        <section class="panel panel-body">
          <div class="eyebrow">${escapeHtml(lessonTone.objectivesEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.objectivesHeading)}</h2>
          <ul class="content-block">
            ${lesson.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join("")}
          </ul>
        </section>

        <section class="panel panel-body">
          <div class="eyebrow">${escapeHtml(lessonTone.contentEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.contentHeading)}</h2>
          <div class="content-block">${lesson.content}</div>
        </section>

        <section class="panel panel-body">
          <div class="eyebrow">${escapeHtml(lessonTone.checklistEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.checklistHeading)}</h2>
          <ul class="checklist">
            ${lesson.checklist
              .map(
                (item, index) => `
                  <li>
                    <label>
                      <input type="checkbox" data-checklist-item="${index}" ${(getChecklistState()[lesson.id] || []).includes(index) ? "checked" : ""} />
                      <span>${escapeHtml(item)}</span>
                    </label>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>

        <section class="panel panel-body">
          <div class="eyebrow">${escapeHtml(lessonTone.reflectionEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.reflectionHeading)}</h2>
          <ul class="content-block">
            ${lesson.reflectionQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>

        <section class="panel panel-body" data-quiz-container>
          <div class="eyebrow">${escapeHtml(lessonTone.quizEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.quizHeading)}</h2>
          ${renderQuiz(lesson)}
        </section>

        <section class="panel panel-body">
          <div class="eyebrow">${escapeHtml(lessonTone.notesEyebrow)}</div>
          <h2>${escapeHtml(lessonTone.notesHeading)}</h2>
          <textarea class="textarea-control" rows="8" data-lesson-notes placeholder="Capture takeaways, commands, pitfalls, or questions...">${escapeHtml(noteValue)}</textarea>
          <p class="save-status" data-save-status></p>
        </section>

        <section class="panel panel-body">
          <div class="section-heading">
            <div>
              <div class="eyebrow">${escapeHtml(lessonTone.navigationEyebrow)}</div>
              <h2>${escapeHtml(lessonTone.navigationHeading)}</h2>
            </div>
          </div>
          <div class="button-row">
            ${previousHref ? `<a class="button-secondary" href="${previousHref}">Previous lesson</a>` : ""}
            ${nextHref ? `<a class="button" href="${nextHref}">Next lesson</a>` : `<a class="button" href="course.html?course=${course.slug}">Back to course</a>`}
          </div>
        </section>
      </main>
    </div>
  `;
}

async function renderProgressPage() {
  const courses = await getAllCoursesDetailed();
  const summary = getProgressSummary(courses);
  const recent = getRecentCompletions(courses, getRecentLessons()).slice(0, 8);
  const heatmap = getActivityHeatmap(42);
  const streak = getActiveStreak();

  return `
    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Progress Overview</div>
          <h1>See the shape of your momentum.</h1>
          <p class="section-copy">Course state, lesson progression, estimated study time, and recent activity all update from local browser state in real time.</p>
        </div>
      </div>
      <div class="toolbar" style="grid-template-columns:1fr 1fr;">
        <select class="select-control" data-progress-filter>
          <option value="">All course states</option>
          <option value="started">Started</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In progress</option>
          <option value="not-started">Not started</option>
        </select>
      </div>
      <div class="stats-grid premium-stats">
        <article class="stat-card">
          <div class="ring" style="--value:${summary.averageProgress}"><span>${summary.averageProgress}%</span></div>
          <p class="muted">Average course progress</p>
        </article>
        <article class="stat-card"><strong>${summary.lessonsCompletedTotal}</strong><span class="muted">Lessons completed</span></article>
        <article class="stat-card"><strong>${formatMinutes(summary.completedStudyMinutes)}</strong><span class="muted">Estimated time completed</span></article>
        <article class="stat-card"><strong>${streak || 0}</strong><span class="muted">Current active streak</span></article>
      </div>
      <div class="bento-grid progress-bento">
        <article class="panel panel-body spotlight-card">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Course States</div>
              <h2>How your library is moving</h2>
            </div>
          </div>
          <div class="state-list spacious">
            <div><strong>${summary.coursesStartedTotal}</strong><span>Started</span></div>
            <div><strong>${summary.coursesInProgressTotal}</strong><span>In progress</span></div>
            <div><strong>${summary.coursesCompletedTotal}</strong><span>Completed</span></div>
          </div>
          <p class="muted">Started means you have touched the material. In progress means you have real completion signals, not just a first click.</p>
        </article>
        <article class="panel panel-body spotlight-card">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Consistency</div>
              <h2>Recent learning footprint</h2>
            </div>
            <span class="chip">${summary.activityDays} active days</span>
          </div>
          ${renderHeatmap(heatmap)}
        </article>
      </div>
      <div class="dashboard-grid" data-progress-results>
        ${courses
          .map((course) => {
            const details = getCourseProgressDetails(course);
            return `
              <article class="card">
                <div class="card-body">
                  <div class="meta-row">
                    ${statusPill(details.progress)}
                    <span class="chip">${details.completedLessons}/${details.totalLessons} lessons</span>
                  </div>
                  <h3>${escapeHtml(course.title)}</h3>
                  <p class="muted">${escapeHtml(course.subtitle)}</p>
                  ${progressBar(details.progress, `${course.title} progress`)}
                  <div class="meta-row">
                    <span class="muted">${details.remainingTimeLabel} remaining</span>
                    <span class="muted">${formatStudySplit(course.timing)}</span>
                  </div>
                  <div class="button-row" style="margin-top:16px;">
                    <a class="inline-button" href="course.html?course=${course.slug}">View course</a>
                    ${details.progress > 0 ? `<button class="button-danger" type="button" data-reset-course="${course.slug}">Reset course</button>` : ""}
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Recent Activity</div>
          <h2>Recently visited lessons</h2>
        </div>
      </div>
      <div class="dashboard-grid">
        ${recent.length ? renderRecentLessons(recent) : emptyState("No recent activity yet", "Open lessons to build a recent-learning trail.")}
      </div>
    </section>
  `;
}

async function renderNotesPage() {
  const courses = await getAllCoursesDetailed();
  const lessonsById = new Map(
    courses.flatMap((course) =>
      course.modules.flatMap((module) =>
        module.lessons.map((lesson) => [
          lesson.id,
          {
            ...lesson,
            courseTitle: course.title,
            courseSlug: course.slug,
            moduleTitle: module.title,
          },
        ])
      )
    )
  );
  const notes = getAllNotesEntries().map((entry) => ({
    ...entry,
    lesson: lessonsById.get(entry.lessonId),
  }));

  return `
    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Saved Notes</div>
          <h1>Keep the useful parts close.</h1>
          <p class="section-copy">All lesson notes are stored locally and grouped by the lesson they belong to.</p>
        </div>
      </div>
      <input class="control" type="search" placeholder="Search notes" data-notes-search />
      <div class="dashboard-grid" data-notes-results style="margin-top:20px;">
        ${notes.length ? notes.map((entry) => renderNoteCard(entry)).join("") : emptyState("No notes yet", "Write inside any lesson and your notes will appear here.")}
      </div>
    </section>
  `;
}

async function renderResourcesPage() {
  const resources = await getResources();
  const courses = await getCourseSummaries();
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const tags = [...new Set(resources.flatMap((item) => item.tags || []))].sort();

  return `
    <section class="page-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Resource Library</div>
          <h1>Sources, tools, and references worth revisiting.</h1>
          <p class="section-copy">Search by title, filter by tag, and jump directly into related documentation or articles.</p>
        </div>
      </div>
      <div class="toolbar">
        <input class="control" type="search" placeholder="Search resources" data-resource-search />
        <select class="select-control" data-resource-course>
          <option value="">All courses</option>
          ${courses.map((course) => `<option value="${course.id}">${course.title}</option>`).join("")}
        </select>
        <select class="select-control" data-resource-tag>
          <option value="">Any tag</option>
          ${tags.map((tag) => `<option value="${tag}">${tag}</option>`).join("")}
        </select>
      </div>
      <div class="resource-grid" data-resource-results>
        ${resources.map((resource) => renderResourceCard(resource, courseMap.get(resource.relatedCourseId))).join("")}
      </div>
    </section>
  `;
}

function renderNotFoundPage() {
  return `
    <section class="page-section">
      ${emptyState("This page drifted off the map", "Use the dashboard or catalog to get back into the learning flow.", '<div class="button-row"><a class="button" href="index.html">Dashboard</a><a class="button-secondary" href="courses.html">Courses</a></div>')}
    </section>
  `;
}

async function hydratePage(currentPage) {
  switch (currentPage) {
    case "courses":
      return hydrateCoursesPage();
    case "course":
      return hydrateCoursePage();
    case "lesson":
      return hydrateLessonPage();
    case "notes":
      return hydrateNotesPage();
    case "progress":
      return hydrateProgressPage();
    case "resources":
      return hydrateResourcesPage();
    default:
      return undefined;
  }
}

async function hydrateCoursesPage() {
  const [summaries, courses] = await Promise.all([getCourseSummaries(), getAllCoursesDetailed()]);
  const enriched = buildCourseViews(summaries, courses);
  const controls = {
    query: document.querySelector("[data-course-search]"),
    category: document.querySelector("[data-filter-category]"),
    difficulty: document.querySelector("[data-filter-difficulty]"),
    sort: document.querySelector("[data-filter-sort]"),
    status: document.querySelector("[data-filter-status]"),
    tag: document.querySelector("[data-filter-tag]"),
  };
  const results = document.querySelector("[data-catalog-results]");
  const render = () => {
    const filtered = filterCourses(enriched, {
      query: controls.query.value,
      category: controls.category.value,
      difficulty: controls.difficulty.value,
      sort: controls.sort.value,
      status: controls.status.value,
      tag: controls.tag.value,
    });
    results.innerHTML = filtered.length
      ? filtered.map((course) => renderCourseCard(course)).join("")
      : emptyState("No matching courses", "Try broadening the search or clearing one of the filters.");
  };
  Object.values(controls).forEach((control) => control?.addEventListener("input", render));
}

function hydrateCoursePage() {
  bindCourseResetButtons({ redirectOnReset: true });
  document.querySelectorAll("[data-accordion-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("hidden", expanded);
    });
  });
  const search = document.querySelector("[data-course-lesson-search]");
  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase().trim();
      document.querySelectorAll(".accordion-item").forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.classList.toggle("hidden", Boolean(term) && !text.includes(term));
      });
    });
  }
}

async function hydrateLessonPage() {
  const params = new URLSearchParams(window.location.search);
  const course = await getCourseBySlug(params.get("course"));
  if (!course) {
    return;
  }
  const found = findLessonBySlug(course, params.get("lesson"));
  if (!found) {
    return;
  }
  const { lesson } = found;
  markLessonEngaged(lesson.id, { courseSlug: course.slug });
  addRecentLesson({
    lessonId: lesson.id,
    visitedAt: new Date().toISOString(),
  });
  logActivity("lesson-view", { lessonId: lesson.id, courseSlug: course.slug });
  setLastVisitedLesson(course.slug, lesson.slug, lesson.id);

  const bookmarkButton = document.querySelector("[data-bookmark-toggle]");
  const completeButton = document.querySelector("[data-complete-toggle]");
  const noteArea = document.querySelector("[data-lesson-notes]");
  const saveStatus = document.querySelector("[data-save-status]");
  const quizContainer = document.querySelector("[data-quiz-container]");
  const progressMeter = document.querySelector("[data-lesson-progress-meter]");
  const statusNode = document.querySelector("[data-lesson-status]");
  const stateNode = document.querySelector("[data-lesson-state-label]");
  const checklistNode = document.querySelector("[data-lesson-checklist-status]");
  const quizNode = document.querySelector("[data-lesson-quiz-status]");
  const noteNode = document.querySelector("[data-lesson-note-status]");

  const refreshLessonMeta = () => {
    const lessonProgress = getLessonProgress(lesson);
    const checklistCount = (getChecklistState()[lesson.id] || []).length;
    const quizResult = getQuizResults()[lesson.id];
    progressMeter.innerHTML = progressBar(lessonProgress, `${lesson.title} progress`);
    statusNode.innerHTML = statusPill(lessonProgress);
    stateNode.textContent = renderStateLabel(getLessonState(lesson));
    checklistNode.textContent = `${checklistCount}/${lesson.checklist.length}`;
    quizNode.textContent = lesson.quiz?.length ? (quizResult ? `${quizResult.correctCount}/${quizResult.totalQuestions}` : "Not submitted") : "No quiz";
    noteNode.textContent = getNote(lesson.id) ? "Saved" : "Empty";
  };

  document.querySelectorAll("[data-checklist-item]").forEach((input) => {
    input.addEventListener("change", () => {
      toggleChecklistItem(lesson.id, Number(input.dataset.checklistItem));
      markLessonEngaged(lesson.id, { courseSlug: course.slug });
      logActivity("checklist-toggle", { lessonId: lesson.id, courseSlug: course.slug });
      refreshLessonMeta();
      toast("Checklist updated");
    });
  });

  bookmarkButton?.addEventListener("click", () => {
    toggleBookmark(lesson.id);
    bookmarkButton.textContent = isBookmarked(lesson.id) ? "Remove bookmark" : "Bookmark lesson";
    toast(isBookmarked(lesson.id) ? "Lesson bookmarked" : "Bookmark removed");
  });

  completeButton?.addEventListener("click", () => {
    toggleCompletedLesson(lesson.id);
    logActivity(isLessonCompleted(lesson.id) ? "lesson-complete" : "lesson-reopen", { lessonId: lesson.id, courseSlug: course.slug });
    completeButton.textContent = isLessonCompleted(lesson.id) ? "Mark incomplete" : "Mark complete";
    refreshLessonMeta();
    toast(isLessonCompleted(lesson.id) ? "Lesson marked complete" : "Lesson marked incomplete");
  });

  if (noteArea) {
    bindNotesEditor({
      lessonId: lesson.id,
      textarea: noteArea,
      statusNode: saveStatus,
      onSaved: () => {
        markLessonEngaged(lesson.id, { courseSlug: course.slug });
        logActivity("note-save", { lessonId: lesson.id, courseSlug: course.slug });
        refreshLessonMeta();
      },
    });
  }

  bindQuiz(quizContainer, lesson, () => {
    markLessonEngaged(lesson.id, { courseSlug: course.slug });
    logActivity("quiz-submit", { lessonId: lesson.id, courseSlug: course.slug });
    refreshLessonMeta();
    toast("Quiz saved");
  });
  refreshLessonMeta();
}

async function hydrateNotesPage() {
  const courses = await getAllCoursesDetailed();
  const lessonsById = new Map(
    courses.flatMap((course) =>
      course.modules.flatMap((module) =>
        module.lessons.map((lesson) => [
          lesson.id,
          {
            ...lesson,
            courseTitle: course.title,
            courseSlug: course.slug,
          },
        ])
      )
    )
  );
  const results = document.querySelector("[data-notes-results]");
  const query = document.querySelector("[data-notes-search]");
  const render = () => {
    const term = query.value.toLowerCase().trim();
    const entries = getAllNotesEntries()
      .map((entry) => ({ ...entry, lesson: lessonsById.get(entry.lessonId) }))
      .filter((entry) => {
        const text = `${entry.text} ${entry.lesson?.title || ""} ${entry.lesson?.courseTitle || ""}`.toLowerCase();
        return !term || text.includes(term);
      });
    results.innerHTML = entries.length
      ? entries.map((entry) => renderNoteCard(entry)).join("")
      : emptyState("No matching notes", "Try a different search term.");
    bindNoteEditors(render);
  };
  query?.addEventListener("input", render);
  bindNoteEditors(render);
}

function bindNoteEditors(onUpdate) {
  document.querySelectorAll("[data-note-editor]").forEach((textarea) => {
    textarea.addEventListener("change", () => {
      updateNote(textarea.dataset.noteEditor, textarea.value);
      toast("Note updated");
      onUpdate();
    });
  });
  document.querySelectorAll("[data-note-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteNote(button.dataset.noteDelete);
      toast("Note deleted");
      onUpdate();
    });
  });
}

async function hydrateResourcesPage() {
  const resources = await getResources();
  const courses = await getCourseSummaries();
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const controls = {
    query: document.querySelector("[data-resource-search]"),
    course: document.querySelector("[data-resource-course]"),
    tag: document.querySelector("[data-resource-tag]"),
  };
  const results = document.querySelector("[data-resource-results]");
  const render = () => {
    const query = controls.query.value.toLowerCase().trim();
    const selectedCourse = controls.course.value;
    const selectedTag = controls.tag.value;
    const filtered = resources.filter((resource) => {
      const text = `${resource.title} ${resource.description} ${(resource.tags || []).join(" ")}`.toLowerCase();
      return (
        (!query || text.includes(query)) &&
        (!selectedCourse || resource.relatedCourseId === selectedCourse) &&
        (!selectedTag || (resource.tags || []).includes(selectedTag))
      );
    });
    results.innerHTML = filtered.length
      ? filtered.map((resource) => renderResourceCard(resource, courseMap.get(resource.relatedCourseId))).join("")
      : emptyState("No matching resources", "Try another keyword or clear a filter.");
  };
  Object.values(controls).forEach((control) => control?.addEventListener("input", render));
}

async function hydrateProgressPage() {
  const courses = await getAllCoursesDetailed();
  const select = document.querySelector("[data-progress-filter]");
  const results = document.querySelector("[data-progress-results]");
  const render = () => {
    const selected = select.value;
    const filtered = courses.filter((course) => !selected || getCourseState(course) === selected);
    results.innerHTML = filtered.length
      ? filtered
          .map((course) => {
            const details = getCourseProgressDetails(course);
            return `
              <article class="card">
                <div class="card-body">
                  <div class="meta-row">
                    ${statusPill(details.progress)}
                    <span class="chip">${details.completedLessons}/${details.totalLessons} lessons</span>
                  </div>
                  <h3>${escapeHtml(course.title)}</h3>
                  <p class="muted">${escapeHtml(course.subtitle)}</p>
                  ${progressBar(details.progress, `${course.title} progress`)}
                  <div class="meta-row">
                    <span class="muted">${details.remainingTimeLabel} remaining</span>
                    <span class="muted">${formatStudySplit(course.timing)}</span>
                  </div>
                  <div class="button-row" style="margin-top:16px;">
                    <a class="inline-button" href="course.html?course=${course.slug}">View course</a>
                    ${details.progress > 0 ? `<button class="button-danger" type="button" data-reset-course="${course.slug}">Reset course</button>` : ""}
                  </div>
                </div>
              </article>
            `;
          })
          .join("")
      : emptyState("No courses match this state", "Try another progress filter.");
    bindCourseResetButtons({ redirectOnReset: false, rerender: render });
  };
  select?.addEventListener("input", render);
  render();
}

function renderCourseCard(course) {
  const buttonLabel = course.progress > 0 ? "Resume" : "Start";
  return `
    <article class="card course-card">
      <img src="${course.coverImage}" alt="${escapeHtml(course.title)} cover artwork" />
      <div class="card-body">
        <div class="meta-row">
          <span class="chip">${escapeHtml(course.difficulty)}</span>
          <span class="chip">${formatStudySplit(course.timing)}</span>
          ${statusPill(course.progress || 0)}
        </div>
        <h3>${escapeHtml(course.title)}</h3>
        <p class="muted">${escapeHtml(course.description)}</p>
        <div class="meta-row">
          <span class="muted">${formatMinutes(course.timing?.totalMinutes || 0)} guided</span>
          <span class="muted">${course.lessonCount} lessons</span>
          <span class="muted">${course.completedLessons || 0}/${course.totalLessons || course.lessonCount} complete</span>
          <span class="muted">${escapeHtml(course.category)}</span>
        </div>
        <div style="margin:16px 0 14px;">${progressBar(course.progress || 0, `${course.title} progress`)}</div>
        <div class="chip-row">
          ${(course.tags || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="button-row" style="margin-top:16px;">
          <a class="button" href="course.html?course=${course.slug}">${buttonLabel} course</a>
        </div>
      </div>
    </article>
  `;
}

function renderStateLabel(state) {
  const labels = {
    "not-started": "Not started",
    started: "Started",
    "in-progress": "In progress",
    completed: "Completed",
  };
  return labels[state] || "Not started";
}

function renderResourceCard(resource, course) {
  return `
    <article class="card resource-card">
      <div class="card-body">
        <div class="meta-row">
          <span class="chip">${escapeHtml(resource.type)}</span>
          ${course ? `<span class="chip">${escapeHtml(course.title)}</span>` : ""}
        </div>
        <h3>${escapeHtml(resource.title)}</h3>
        <p class="muted">${escapeHtml(resource.description)}</p>
        <div class="chip-row">
          ${(resource.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="button-row" style="margin-top:16px;">
          <a class="button-secondary" href="${resource.url}" target="_blank" rel="noreferrer">Open resource</a>
        </div>
      </div>
    </article>
  `;
}

function renderRecentLessons(items) {
  return items
    .map(
      (item) => `
        <article class="card bookmark-card">
          <div class="card-body">
            <div class="eyebrow">Recently viewed</div>
            <h3>${escapeHtml(item.lesson.title)}</h3>
            <p class="muted">${escapeHtml(item.lesson.courseTitle)}</p>
            <div class="button-row">
              <a class="inline-button" href="lesson.html?course=${item.lesson.courseSlug}&lesson=${item.lesson.slug}">Open lesson</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderBookmarks(items) {
  return items
    .map(
      (item) => `
        <article class="card bookmark-card">
          <div class="card-body">
            <div class="eyebrow">Bookmarked</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="muted">${escapeHtml(item.courseTitle)}</p>
            <div class="button-row">
              <a class="inline-button" href="lesson.html?course=${item.courseSlug}&lesson=${item.slug}">Open lesson</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderNoteCard(entry) {
  if (!entry.lesson) {
    return "";
  }
  return `
    <article class="card">
      <div class="card-body">
        <div class="eyebrow">${escapeHtml(entry.lesson.courseTitle)}</div>
        <h3>${escapeHtml(entry.lesson.title)}</h3>
        <p class="muted">Updated ${new Date(entry.updatedAt).toLocaleString()}</p>
        <textarea class="textarea-control" rows="8" data-note-editor="${entry.lessonId}">${escapeHtml(entry.text)}</textarea>
        <div class="button-row" style="margin-top:16px;">
          <a class="inline-button" href="lesson.html?course=${entry.lesson.courseSlug}&lesson=${entry.lesson.slug}">Open lesson</a>
          <button class="button-danger" type="button" data-note-delete="${entry.lessonId}">Delete note</button>
        </div>
      </div>
    </article>
  `;
}

function lessonHrefFromId(course, lessonId) {
  const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.id === lessonId);
  return lesson ? `lesson.html?course=${course.slug}&lesson=${lesson.slug}` : "";
}

async function bindCourseResetButtons({ redirectOnReset = false, rerender } = {}) {
  const buttons = document.querySelectorAll("[data-reset-course]");
  if (!buttons.length) {
    return;
  }

  const allCourses = await getAllCoursesDetailed();
  const courseMap = new Map(allCourses.map((course) => [course.slug, course]));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const courseSlug = button.dataset.resetCourse;
      const course = courseMap.get(courseSlug);
      if (!course) {
        return;
      }

      const confirmed = window.confirm(`Reset progress for "${course.title}" and start again from lesson one? Notes and bookmarks will be kept.`);
      if (!confirmed) {
        return;
      }

      const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
      const firstLesson = course.modules[0]?.lessons[0];
      resetCourseProgress(lessonIds, course.slug);
      toast("Course progress reset");

      if (redirectOnReset && firstLesson) {
        window.location.href = `lesson.html?course=${course.slug}&lesson=${firstLesson.slug}`;
        return;
      }

      if (typeof rerender === "function") {
        rerender();
      }
    });
  });
}

function getLessonTone(course) {
  if (course.slug === "local-models-agentic-mac") {
    return {
      layoutClass: "friendly-lesson",
      intro: {
        title: "Gentle On-Ramp",
        body: "This course is designed to be read slowly. You do not need to master every term on the first pass, only to leave each lesson feeling a little less foggy than before.",
      },
      objectivesEyebrow: "In Plain English",
      objectivesHeading: "What this lesson is helping you understand",
      contentEyebrow: "Core Idea",
      contentHeading: "The main story",
      checklistEyebrow: "What To Remember",
      checklistHeading: "Small steps to make it stick",
      reflectionEyebrow: "Try This Lens",
      reflectionHeading: "Questions to make it personal",
      quizEyebrow: "Quick Check",
      quizHeading: "See what clicked",
      notesEyebrow: "Your Words",
      notesHeading: "Capture your own version",
      navigationEyebrow: "Keep Going",
      navigationHeading: "Your next step in the path",
    };
  }

  return {
    layoutClass: "",
    intro: null,
    objectivesEyebrow: "Objectives",
    objectivesHeading: "What this lesson is trying to sharpen",
    contentEyebrow: "Lesson Content",
    contentHeading: "Core concepts",
    checklistEyebrow: "Checklist",
    checklistHeading: "Practice and verification",
    reflectionEyebrow: "Reflection",
    reflectionHeading: "Questions worth writing through",
    quizEyebrow: "Quiz",
    quizHeading: "Check your understanding",
    notesEyebrow: "Notes",
    notesHeading: "Your personal notes",
    navigationEyebrow: "Navigation",
    navigationHeading: "Keep moving through the course",
  };
}
