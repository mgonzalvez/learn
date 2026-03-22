const PREFIX = "plh-";

const KEYS = {
  completedLessons: `${PREFIX}completed-lessons`,
  completedChecklistItems: `${PREFIX}completed-checklist-items`,
  bookmarkedLessons: `${PREFIX}bookmarked-lessons`,
  notes: `${PREFIX}notes`,
  recentLessons: `${PREFIX}recent-lessons`,
  themePreference: `${PREFIX}theme-preference`,
  lastVisitedLesson: `${PREFIX}last-visited-lesson`,
  quizResults: `${PREFIX}quiz-results`,
  lessonEngagement: `${PREFIX}lesson-engagement`,
  activityLog: `${PREFIX}activity-log`,
};

export function getState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function setState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getCompletedLessons() {
  return getState(KEYS.completedLessons, []);
}

export function toggleCompletedLesson(lessonId) {
  const lessons = new Set(getCompletedLessons());
  if (lessons.has(lessonId)) {
    lessons.delete(lessonId);
  } else {
    lessons.add(lessonId);
  }
  return setState(KEYS.completedLessons, Array.from(lessons));
}

export function isLessonCompleted(lessonId) {
  return getCompletedLessons().includes(lessonId);
}

export function getChecklistState() {
  return getState(KEYS.completedChecklistItems, {});
}

export function toggleChecklistItem(lessonId, itemIndex) {
  const checklist = getChecklistState();
  const selected = new Set(checklist[lessonId] || []);
  if (selected.has(itemIndex)) {
    selected.delete(itemIndex);
  } else {
    selected.add(itemIndex);
  }
  checklist[lessonId] = Array.from(selected).sort((a, b) => a - b);
  return setState(KEYS.completedChecklistItems, checklist);
}

export function getBookmarkedLessons() {
  return getState(KEYS.bookmarkedLessons, []);
}

export function toggleBookmark(lessonId) {
  const bookmarks = new Set(getBookmarkedLessons());
  if (bookmarks.has(lessonId)) {
    bookmarks.delete(lessonId);
  } else {
    bookmarks.add(lessonId);
  }
  return setState(KEYS.bookmarkedLessons, Array.from(bookmarks));
}

export function isBookmarked(lessonId) {
  return getBookmarkedLessons().includes(lessonId);
}

export function getNotes() {
  return getState(KEYS.notes, {});
}

export function saveNote(lessonId, text) {
  const notes = getNotes();
  notes[lessonId] = {
    text,
    updatedAt: new Date().toISOString(),
  };
  return setState(KEYS.notes, notes);
}

export function deleteNote(lessonId) {
  const notes = getNotes();
  delete notes[lessonId];
  return setState(KEYS.notes, notes);
}

export function getNote(lessonId) {
  return getNotes()[lessonId]?.text || "";
}

export function getRecentLessons() {
  return getState(KEYS.recentLessons, []);
}

export function addRecentLesson(lessonRecord) {
  const next = [lessonRecord, ...getRecentLessons().filter((item) => item.lessonId !== lessonRecord.lessonId)].slice(0, 8);
  return setState(KEYS.recentLessons, next);
}

export function setLastVisitedLesson(courseSlug, lessonSlug, lessonId) {
  return setState(KEYS.lastVisitedLesson, {
    courseSlug,
    lessonSlug,
    lessonId,
    updatedAt: new Date().toISOString(),
  });
}

export function getLastVisitedLesson() {
  return getState(KEYS.lastVisitedLesson, null);
}

export function getThemePreference() {
  return localStorage.getItem(KEYS.themePreference);
}

export function setThemePreference(theme) {
  localStorage.setItem(KEYS.themePreference, theme);
  return theme;
}

export function clearThemePreference() {
  localStorage.removeItem(KEYS.themePreference);
}

export function getQuizResults() {
  return getState(KEYS.quizResults, {});
}

export function saveQuizResult(lessonId, payload) {
  const results = getQuizResults();
  results[lessonId] = {
    ...payload,
    submittedAt: new Date().toISOString(),
  };
  return setState(KEYS.quizResults, results);
}

export function getLessonEngagement() {
  return getState(KEYS.lessonEngagement, {});
}

export function markLessonEngaged(lessonId, meta = {}) {
  const engagement = getLessonEngagement();
  const existing = engagement[lessonId] || {};
  engagement[lessonId] = {
    firstViewedAt: existing.firstViewedAt || new Date().toISOString(),
    lastViewedAt: new Date().toISOString(),
    visitCount: (existing.visitCount || 0) + 1,
    ...existing,
    ...meta,
  };
  return setState(KEYS.lessonEngagement, engagement);
}

export function getActivityLog() {
  return getState(KEYS.activityLog, []);
}

export function logActivity(type, payload = {}) {
  const entry = {
    type,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  const next = [...getActivityLog(), entry].slice(-500);
  return setState(KEYS.activityLog, next);
}

export function resetCourseProgress(lessonIds, courseSlug) {
  const lessonIdSet = new Set(lessonIds);

  const completedLessons = getCompletedLessons().filter((lessonId) => !lessonIdSet.has(lessonId));
  setState(KEYS.completedLessons, completedLessons);

  const checklistState = getChecklistState();
  for (const lessonId of lessonIdSet) {
    delete checklistState[lessonId];
  }
  setState(KEYS.completedChecklistItems, checklistState);

  const quizResults = getQuizResults();
  for (const lessonId of lessonIdSet) {
    delete quizResults[lessonId];
  }
  setState(KEYS.quizResults, quizResults);

  const lessonEngagement = getLessonEngagement();
  for (const lessonId of lessonIdSet) {
    delete lessonEngagement[lessonId];
  }
  setState(KEYS.lessonEngagement, lessonEngagement);

  const recentLessons = getRecentLessons().filter((item) => !lessonIdSet.has(item.lessonId));
  setState(KEYS.recentLessons, recentLessons);

  const lastVisitedLesson = getLastVisitedLesson();
  if (lastVisitedLesson?.courseSlug === courseSlug) {
    localStorage.removeItem(KEYS.lastVisitedLesson);
  }
}

export { KEYS };
