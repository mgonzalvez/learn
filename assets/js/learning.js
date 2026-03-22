function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ");
}

function countWords(text) {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized ? normalized.split(" ").length : 0;
}

function countMatches(text, pattern) {
  return (String(text || "").match(pattern) || []).length;
}

export function estimateLessonTiming(lesson) {
  const contentText = stripHtml(lesson.content);
  const contentWords = countWords(contentText);
  const objectiveWords = countWords((lesson.objectives || []).join(" "));
  const checklistCount = lesson.checklist?.length || 0;
  const reflectionCount = lesson.reflectionQuestions?.length || 0;
  const quizCount = lesson.quiz?.length || 0;
  const codeBlockCount = countMatches(lesson.content, /<pre><code>/g);
  const headingCount = countMatches(lesson.content, /<h[2-4][^>]*>/g);
  const listCount = countMatches(lesson.content, /<li>/g);

  const coreMinutes = Math.max(
    10,
    Math.ceil(contentWords / 120 + objectiveWords / 180 + codeBlockCount * 1.15 + headingCount * 0.45 + listCount * 0.18 + 1)
  );
  const practiceMinutes = Math.max(
    5,
    Math.ceil(checklistCount * 1.15 + reflectionCount * 2.3 + quizCount * 1.7)
  );

  return {
    coreMinutes,
    practiceMinutes,
    totalMinutes: coreMinutes + practiceMinutes,
  };
}

export function enrichCourse(course) {
  const modules = (course.modules || []).map((module) => ({
    ...module,
    lessons: (module.lessons || []).map((lesson) => {
      const timing = estimateLessonTiming(lesson);
      return {
        ...lesson,
        timing,
        durationMinutes: timing.totalMinutes,
      };
    }),
  }));

  const lessons = modules.flatMap((module) => module.lessons);
  const totalCoreMinutes = lessons.reduce((sum, lesson) => sum + lesson.timing.coreMinutes, 0);
  const totalPracticeMinutes = lessons.reduce((sum, lesson) => sum + lesson.timing.practiceMinutes, 0);
  const totalMinutes = totalCoreMinutes + totalPracticeMinutes;

  return {
    ...course,
    modules,
    lessonCount: lessons.length,
    moduleCount: modules.length,
    timing: {
      coreMinutes: totalCoreMinutes,
      practiceMinutes: totalPracticeMinutes,
      totalMinutes,
    },
    estimatedHours: Number((totalMinutes / 60).toFixed(1)),
  };
}

export function mergeCourseSummary(summary, course) {
  return {
    ...summary,
    lessonCount: course.lessonCount,
    moduleCount: course.moduleCount,
    estimatedHours: course.estimatedHours,
    timing: course.timing,
  };
}

export function formatMinutes(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }
  if (hours) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

export function formatStudySplit(timing) {
  if (!timing) {
    return "";
  }
  return `${formatMinutes(timing.coreMinutes)} core + ${formatMinutes(timing.practiceMinutes)} practice`;
}
