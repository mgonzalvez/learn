import {
  getActivityLog,
  getChecklistState,
  getCompletedLessons,
  getLastVisitedLesson,
  getLessonEngagement,
  getQuizResults,
  isLessonCompleted,
} from "./storage.js";
import { formatMinutes } from "./learning.js";

export function getLessonState(lesson) {
  if (isLessonCompleted(lesson.id)) {
    return "completed";
  }

  const engagement = getLessonEngagement()[lesson.id];
  const checklistCount = (getChecklistState()[lesson.id] || []).length;
  const quizSubmitted = Boolean(getQuizResults()[lesson.id]);

  if (checklistCount > 0 || quizSubmitted) {
    return "in-progress";
  }

  if (engagement) {
    return "started";
  }

  return "not-started";
}

export function getLessonProgress(lesson) {
  const completedLessons = getCompletedLessons();
  const engagement = getLessonEngagement();
  const checklistState = getChecklistState();
  const quizResults = getQuizResults();
  const checklistCount = lesson.checklist?.length || 0;
  const checkedCount = (checklistState[lesson.id] || []).length;
  const checklistRatio = checklistCount ? checkedCount / checklistCount : 1;
  const isComplete = completedLessons.includes(lesson.id) ? 1 : 0;
  const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
  const quizSubmitted = hasQuiz && quizResults[lesson.id] ? 1 : hasQuiz ? 0 : 1;
  const started = engagement[lesson.id] ? 1 : 0;

  const weights = [
    { weight: 0.15, value: started },
    { weight: checklistCount ? 0.25 : 0, value: checklistRatio },
    { weight: hasQuiz ? 0.2 : 0, value: quizSubmitted },
    { weight: 0.4, value: isComplete },
  ].filter((item) => item.weight > 0);

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0) || 1;
  const weighted = weights.reduce((sum, item) => sum + item.weight * item.value, 0);
  return Math.round((weighted / totalWeight) * 100);
}

export function getModuleProgress(module) {
  const lessons = module.lessons || [];
  if (!lessons.length) {
    return 0;
  }
  const total = lessons.reduce((sum, lesson) => sum + getLessonProgress(lesson), 0);
  return Math.round(total / lessons.length);
}

export function getCourseProgress(course) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (!lessons.length) {
    return 0;
  }
  const total = lessons.reduce((sum, lesson) => sum + getLessonProgress(lesson), 0);
  return Math.round(total / lessons.length);
}

export function getStatusLabel(progress) {
  if (progress >= 100) {
    return "completed";
  }
  if (progress > 0 && progress < 35) {
    return "started";
  }
  if (progress > 0) {
    return "in-progress";
  }
  return "not-started";
}

export function getCourseState(course) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (!lessons.length) {
    return "not-started";
  }
  if (lessons.every((lesson) => getLessonState(lesson) === "completed")) {
    return "completed";
  }
  if (lessons.some((lesson) => getLessonState(lesson) === "in-progress" || getLessonState(lesson) === "completed")) {
    return "in-progress";
  }
  if (lessons.some((lesson) => getLessonState(lesson) === "started")) {
    return "started";
  }
  return "not-started";
}

export function getCompletedLessonCount(course) {
  return course.modules.flatMap((module) => module.lessons).filter((lesson) => isLessonCompleted(lesson.id)).length;
}

export function getProgressSummary(courses) {
  const lessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons));
  const completedLessons = getCompletedLessons();
  const quizResults = getQuizResults();
  const checklistState = getChecklistState();
  const activityLog = getActivityLog();
  const lessonsCompletedTotal = lessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
  const lessonsStartedTotal = lessons.filter((lesson) => getLessonState(lesson) !== "not-started").length;
  const modulesCompletedTotal = courses.reduce((sum, course) => {
    return (
      sum +
      course.modules.filter((module) => module.lessons.every((lesson) => completedLessons.includes(lesson.id))).length
    );
  }, 0);
  const coursesStartedTotal = courses.filter((course) => getCourseState(course) === "started").length;
  const coursesInProgressTotal = courses.filter((course) => getCourseState(course) === "in-progress").length;
  const coursesCompletedTotal = courses.filter((course) => getCourseState(course) === "completed").length;
  const recentActivity = Object.values(quizResults).length + Object.keys(checklistState).length + completedLessons.length;
  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + getCourseProgress(course), 0) / courses.length)
    : 0;
  const totalStudyMinutes = courses.reduce((sum, course) => sum + (course.timing?.totalMinutes || 0), 0);
  const completedStudyMinutes = courses.reduce((sum, course) => {
    return (
      sum +
      course.modules
        .flatMap((module) => module.lessons)
        .filter((lesson) => isLessonCompleted(lesson.id))
        .reduce((lessonSum, lesson) => lessonSum + (lesson.timing?.totalMinutes || 0), 0)
    );
  }, 0);
  const activityDays = new Set(activityLog.map((entry) => entry.timestamp?.slice(0, 10)).filter(Boolean));
  return {
    lessonsCompletedTotal,
    lessonsStartedTotal,
    modulesCompletedTotal,
    coursesStartedTotal,
    coursesInProgressTotal,
    coursesCompletedTotal,
    recentActivity,
    averageProgress,
    totalStudyMinutes,
    completedStudyMinutes,
    remainingStudyMinutes: Math.max(totalStudyMinutes - completedStudyMinutes, 0),
    activityDays: activityDays.size,
  };
}

export function getResumeLesson(course) {
  const lastVisited = getLastVisitedLesson();
  const flatLessons = course.modules.flatMap((module) => module.lessons);
  if (lastVisited?.courseSlug === course.slug) {
    const matching = flatLessons.find((lesson) => lesson.slug === lastVisited.lessonSlug);
    if (matching && !isLessonCompleted(matching.id)) {
      return matching;
    }
  }
  return flatLessons.find((lesson) => !isLessonCompleted(lesson.id)) || flatLessons[0];
}

export function getRecentCompletions(courses, recentLessons) {
  const byId = new Map(
    courses.flatMap((course) =>
      course.modules.flatMap((module) =>
        module.lessons.map((lesson) => [
          lesson.id,
          {
            ...lesson,
            courseSlug: course.slug,
            courseTitle: course.title,
          },
        ])
      )
    )
  );
  return recentLessons
    .filter((item) => byId.has(item.lessonId))
    .map((item) => ({
      ...item,
      lesson: byId.get(item.lessonId),
    }));
}

export function getCompletionMinutes(course) {
  return course.modules
    .flatMap((module) => module.lessons)
    .filter((lesson) => isLessonCompleted(lesson.id))
    .reduce((sum, lesson) => sum + (lesson.timing?.totalMinutes || 0), 0);
}

export function getRemainingMinutes(course) {
  return Math.max((course.timing?.totalMinutes || 0) - getCompletionMinutes(course), 0);
}

export function getCourseProgressDetails(course) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const states = lessons.map((lesson) => getLessonState(lesson));
  const startedLessons = states.filter((state) => state !== "not-started").length;
  const completedLessons = states.filter((state) => state === "completed").length;
  const inProgressLessons = states.filter((state) => state === "in-progress").length;
  return {
    state: getCourseState(course),
    progress: getCourseProgress(course),
    startedLessons,
    completedLessons,
    inProgressLessons,
    totalLessons: lessons.length,
    completionMinutes: getCompletionMinutes(course),
    remainingMinutes: getRemainingMinutes(course),
    completionTimeLabel: formatMinutes(getCompletionMinutes(course)),
    remainingTimeLabel: formatMinutes(getRemainingMinutes(course)),
  };
}

export function getActivityHeatmap(days = 42) {
  const log = getActivityLog();
  const byDay = new Map();
  for (const entry of log) {
    const key = entry.timestamp?.slice(0, 10);
    if (!key) {
      continue;
    }
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }

  const today = new Date();
  const items = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    items.push({
      date: key,
      count: byDay.get(key) || 0,
    });
  }
  return items;
}

export function getActiveStreak() {
  const heatmap = getActivityHeatmap(90);
  let streak = 0;
  for (let index = heatmap.length - 1; index >= 0; index -= 1) {
    if (heatmap[index].count > 0) {
      streak += 1;
    } else if (streak > 0) {
      break;
    }
  }
  return streak;
}
