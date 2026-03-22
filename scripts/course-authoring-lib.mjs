import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { enrichCourse } from "../assets/js/learning.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "..");
export const AUTHORING_DIR = path.join(ROOT_DIR, "authoring", "courses");
export const DATA_DIR = path.join(ROOT_DIR, "assets", "data");
export const IMAGE_DIR = path.join(ROOT_DIR, "assets", "images");
export const DIST_DIR = path.join(ROOT_DIR, "dist");
export const LEGACY_RESOURCES_PATH = path.join(DATA_DIR, "resources.legacy.json");
export const RESOURCES_PATH = path.join(DATA_DIR, "resources.json");
export const COURSE_INDEX_PATH = path.join(DATA_DIR, "courses.json");

const COURSE_FILE_PATTERN = /^course-(?!summaries|index)(?!resources)(.+)\.json$/;

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function toCourseId(slug) {
  return `course-${slugify(slug).replace(/^course-/, "")}`;
}

export function toLessonId(courseSlug, lessonSlug) {
  return `${slugify(courseSlug)}--${slugify(lessonSlug)}`;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (const entry of argv) {
    if (!entry.startsWith("--")) {
      continue;
    }
    const [rawKey, ...rawValue] = entry.slice(2).split("=");
    args[rawKey] = rawValue.length ? rawValue.join("=") : true;
  }
  return args;
}

export function parseFrontmatter(markdown, filePath) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${relative(filePath)}`);
  }

  return {
    meta: parseSimpleFrontmatter(match[1], filePath),
    body: match[2].trim(),
  };
}

function parseSimpleFrontmatter(raw, filePath) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const data = {};
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch) {
      if (!currentKey) {
        throw new Error(`List item found before a key in ${relative(filePath)}`);
      }
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(parseScalar(listMatch[1].trim()));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      throw new Error(`Could not parse frontmatter line "${line}" in ${relative(filePath)}`);
    }

    const [, key, rawValue] = keyMatch;
    currentKey = key;
    if (!rawValue) {
      data[key] = [];
      continue;
    }
    data[key] = parseScalar(rawValue.trim());
  }

  return data;
}

function parseScalar(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === "null") {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

export function getMarkdownSection(body, heading) {
  const lines = String(body || "").replace(/\r\n/g, "\n").split("\n");
  const target = `## ${heading}`.trim();
  const startIndex = lines.findIndex((line) => line.trim() === target);
  if (startIndex < 0) {
    return "";
  }

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index].trim())) {
      break;
    }
    sectionLines.push(lines[index]);
  }
  return sectionLines.join("\n").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseBulletList(sectionText) {
  return sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^[-*]\s+(.*)$/);
      if (!match) {
        throw new Error(`Expected a bullet list item, found "${line}"`);
      }
      return match[1].trim();
    });
}

export function parseModules(sectionText, filePath) {
  const lines = sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error(`No module definitions found in ${relative(filePath)}`);
  }

  return lines.map((line, index) => {
    const match = line.match(/^\d+\.\s+(.+?)(?:\s+\|\s+(.+))?$/);
    if (!match) {
      throw new Error(`Invalid module line "${line}" in ${relative(filePath)}`);
    }
    const title = match[1].trim();
    const description = (match[2] || "").trim() || "Module description coming soon.";
    return {
      id: `module-${String(index + 1).padStart(2, "0")}-${slugify(title)}`,
      title,
      description,
      order: index + 1,
    };
  });
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```/, "").trim();
      index += 1;
      const codeLines = [];
      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      html.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      const { html: tableHtml, nextIndex } = consumeTable(lines, index);
      html.push(tableHtml);
      index = nextIndex;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const { html: blockquoteHtml, nextIndex } = consumeBlockquote(lines, index);
      html.push(blockquoteHtml);
      index = nextIndex;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const { html: listHtml, nextIndex } = consumeList(lines, index, false);
      html.push(listHtml);
      index = nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const { html: listHtml, nextIndex } = consumeList(lines, index, true);
      html.push(listHtml);
      index = nextIndex;
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length && lines[index].trim()) {
      if (
        /^```/.test(lines[index]) ||
        /^(#{1,6})\s+/.test(lines[index]) ||
        /^>\s?/.test(lines[index]) ||
        /^[-*]\s+/.test(lines[index]) ||
        /^\d+\.\s+/.test(lines[index]) ||
        isTableStart(lines, index)
      ) {
        break;
      }
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
  }

  return html.join("");
}

function consumeList(lines, startIndex, ordered) {
  const items = [];
  let index = startIndex;
  const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/;
  while (index < lines.length) {
    const match = lines[index].match(pattern);
    if (!match) {
      break;
    }
    items.push(`<li>${renderInline(match[1].trim())}</li>`);
    index += 1;
  }
  return {
    html: `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
    nextIndex: index,
  };
}

function consumeBlockquote(lines, startIndex) {
  const quoteLines = [];
  let index = startIndex;
  while (index < lines.length && /^>\s?/.test(lines[index])) {
    quoteLines.push(lines[index].replace(/^>\s?/, ""));
    index += 1;
  }

  let calloutLabel = "";
  if (/^\[![A-Z]+\]$/.test(quoteLines[0].trim())) {
    calloutLabel = quoteLines.shift().trim().slice(2, -1).toLowerCase();
  }

  const bodyHtml = markdownToHtml(quoteLines.join("\n"));
  if (!calloutLabel) {
    return { html: `<blockquote>${bodyHtml}</blockquote>`, nextIndex: index };
  }

  const label = calloutLabel.charAt(0).toUpperCase() + calloutLabel.slice(1);
  return {
    html: `<blockquote class="md-callout md-callout-${escapeHtml(calloutLabel)}"><p><strong>${escapeHtml(label)}.</strong></p>${bodyHtml}</blockquote>`,
    nextIndex: index,
  };
}

function isTableStart(lines, index) {
  if (index + 1 >= lines.length) {
    return false;
  }
  return /\|/.test(lines[index]) && /^\s*\|?[:\- ]+\|/.test(lines[index + 1]);
}

function consumeTable(lines, startIndex) {
  const header = splitTableRow(lines[startIndex]);
  let index = startIndex + 2;
  const rows = [];
  while (index < lines.length && /\|/.test(lines[index]) && lines[index].trim()) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }
  const thead = `<thead><tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return { html: `<table>${thead}${tbody}</table>`, nextIndex: index };
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderInline(text) {
  const tokens = [];
  let rendered = escapeHtml(String(text || ""));

  rendered = rendered.replace(/`([^`]+)`/g, (_, code) => {
    const token = `__CODE_${tokens.length}__`;
    tokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  rendered = rendered.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  tokens.forEach((value, index) => {
    rendered = rendered.replace(`__CODE_${index}__`, value);
  });
  return rendered;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseQuizSection(sectionText, filePath) {
  const blocks = sectionText
    .split(/^###\s+/m)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    throw new Error(`No quiz questions found in ${relative(filePath)}`);
  }

  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim());
    let cursor = 0;
    if (/^question\b/i.test(lines[0])) {
      cursor += 1;
    }
    while (cursor < lines.length && !lines[cursor]) {
      cursor += 1;
    }
    const prompt = lines[cursor];
    cursor += 1;

    const choices = [];
    let correctIndex = -1;
    for (; cursor < lines.length; cursor += 1) {
      const choiceMatch = lines[cursor].match(/^-\s+\[( |x|X)\]\s+(.*)$/);
      if (!choiceMatch) {
        break;
      }
      if (choiceMatch[1].toLowerCase() === "x") {
        correctIndex = choices.length;
      }
      choices.push(choiceMatch[2].trim());
    }

    const explanationLine = lines.slice(cursor).find((line) => /^Explanation:\s+/i.test(line));
    if (!prompt || choices.length !== 4 || correctIndex < 0 || !explanationLine) {
      throw new Error(`Quiz block is malformed in ${relative(filePath)}. Each question needs one prompt, four choices, one correct choice, and an explanation.`);
    }

    return {
      prompt,
      choices,
      correctIndex,
      explanation: explanationLine.replace(/^Explanation:\s+/i, "").trim(),
    };
  });
}

export function parseResourcesMarkdown(markdown, courseMeta, filePath) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (/^###\s+/.test(line.trim())) {
      if (current.length) {
        blocks.push(current.join("\n"));
      }
      current = [line];
      continue;
    }
    if (current.length) {
      current.push(line);
    }
  }
  if (current.length) {
    blocks.push(current.join("\n"));
  }

  if (!blocks.length) {
    return [];
  }

  return blocks.map((block) => {
    const [rawTitleLine, ...bodyLines] = block.trim().split("\n");
    const titleLine = rawTitleLine.replace(/^###\s+/, "");
    const fields = {};
    for (const line of bodyLines.map((item) => item.trim()).filter(Boolean)) {
      const match = line.match(/^-\s+([A-Za-z ]+):\s+(.*)$/);
      if (!match) {
        throw new Error(`Malformed resource line "${line}" in ${relative(filePath)}`);
      }
      fields[slugify(match[1]).replace(/-/g, "")] = match[2].trim();
    }

    const title = titleLine.trim();
    const tags = (fields.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      id: fields.id || `res-${slugify(courseMeta.slug)}-${slugify(title)}`,
      title,
      type: fields.type || "reference",
      description: fields.description || "",
      url: fields.url || "",
      tags,
      relatedCourseId: courseMeta.id,
    };
  });
}

export function loadLegacyResources() {
  if (!fs.existsSync(LEGACY_RESOURCES_PATH)) {
    return [];
  }
  return JSON.parse(readText(LEGACY_RESOURCES_PATH));
}

export function loadCourseIndex() {
  if (!fs.existsSync(COURSE_INDEX_PATH)) {
    return [];
  }
  return JSON.parse(readText(COURSE_INDEX_PATH));
}

export function findAuthoredCourseDirs() {
  if (!fs.existsSync(AUTHORING_DIR)) {
    return [];
  }
  return fs
    .readdirSync(AUTHORING_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(AUTHORING_DIR, entry.name))
    .filter((dirPath) => fs.existsSync(path.join(dirPath, "course.md")));
}

export function loadAuthoredCourse(courseDir) {
  const coursePath = path.join(courseDir, "course.md");
  const { meta, body } = parseFrontmatter(readText(coursePath), coursePath);
  const modules = parseModules(getMarkdownSection(body, "Modules"), coursePath);

  const courseMeta = {
    id: meta.id || toCourseId(meta.slug || path.basename(courseDir)),
    slug: meta.slug || slugify(meta.title || path.basename(courseDir)),
    title: meta.title || humanizeSlug(path.basename(courseDir)),
    subtitle: meta.subtitle || "Add a subtitle in course.md",
    description: meta.description || "Add a catalog description in course.md",
    category: meta.category || "Custom",
    difficulty: meta.difficulty || "Beginner",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    featured: Boolean(meta.featured),
    coverImage: meta.coverImage || `assets/images/${meta.slug || path.basename(courseDir)}-cover.svg`,
    coverTheme: meta.coverTheme || "ocean",
    coverIcon: meta.coverIcon || "spark",
    lastUpdated: meta.lastUpdated || null,
    modules,
    sourcePath: relative(courseDir).replace(/\\/g, "/"),
  };

  const lessonsDir = path.join(courseDir, "lessons");
  if (!fs.existsSync(lessonsDir)) {
    throw new Error(`Missing lessons directory in ${relative(courseDir)}`);
  }

  const lessonFiles = fs
    .readdirSync(lessonsDir)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!lessonFiles.length) {
    throw new Error(`No lesson markdown files found in ${relative(lessonsDir)}`);
  }

  const lessons = lessonFiles.map((fileName, fileIndex) => {
    const lessonPath = path.join(lessonsDir, fileName);
    const { meta: lessonMeta, body: lessonBody } = parseFrontmatter(readText(lessonPath), lessonPath);
    const lessonTitle = lessonMeta.title || humanizeSlug(path.basename(fileName, ".md"));
    const lessonSlug = lessonMeta.slug || slugify(lessonTitle);
    const moduleNumber = Number(lessonMeta.module || 1);
    const module = courseMeta.modules[moduleNumber - 1];
    if (!module) {
      throw new Error(`Lesson ${relative(lessonPath)} references module ${moduleNumber}, but course.md only defines ${courseMeta.modules.length} modules.`);
    }

    const objectives = parseBulletList(getMarkdownSection(lessonBody, "Objectives"));
    const contentMarkdown = getMarkdownSection(lessonBody, "Lesson");
    const checklist = parseBulletList(getMarkdownSection(lessonBody, "Checklist"));
    const reflectionQuestions = parseBulletList(getMarkdownSection(lessonBody, "Reflection"));
    const quiz = parseQuizSection(getMarkdownSection(lessonBody, "Quiz"), lessonPath);
    const resourcesSection = getMarkdownSection(lessonBody, "Resources");
    const resources = resourcesSection ? parseBulletList(resourcesSection) : [];

    return {
      id: lessonMeta.id || toLessonId(courseMeta.slug, lessonSlug),
      slug: lessonSlug,
      title: lessonTitle,
      durationMinutes: Number(lessonMeta.durationMinutes || 0),
      objectives,
      content: markdownToHtml(contentMarkdown),
      checklist,
      reflectionQuestions,
      quiz,
      resources,
      moduleNumber,
      order: Number(lessonMeta.order || fileIndex + 1),
    };
  });

  lessons.sort((a, b) => a.order - b.order);
  const flatLessons = lessons.map((lesson, index) => ({
    ...lesson,
    previousLessonId: index > 0 ? lessons[index - 1].id : null,
    nextLessonId: index < lessons.length - 1 ? lessons[index + 1].id : null,
  }));

  const moduleMap = new Map(courseMeta.modules.map((module) => [module.order, { ...module, lessons: [] }]));
  for (const lesson of flatLessons) {
    moduleMap.get(lesson.moduleNumber).lessons.push(stripLessonBuildFields(lesson));
  }

  const resourcesPath = path.join(courseDir, "resources.md");
  const resources = fs.existsSync(resourcesPath)
    ? parseResourcesMarkdown(readText(resourcesPath), courseMeta, resourcesPath)
    : [];

  const rawCourse = {
    id: courseMeta.id,
    slug: courseMeta.slug,
    title: courseMeta.title,
    subtitle: courseMeta.subtitle,
    description: courseMeta.description,
    coverImage: courseMeta.coverImage,
    category: courseMeta.category,
    tags: courseMeta.tags,
    difficulty: courseMeta.difficulty,
    estimatedHours: 0,
    featured: courseMeta.featured,
    lastUpdated: courseMeta.lastUpdated,
    sourceType: "markdown",
    sourcePath: courseMeta.sourcePath,
    modules: courseMeta.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      lessons: moduleMap.get(module.order).lessons,
    })),
  };

  const enriched = enrichCourse(rawCourse);
  return {
    course: {
      ...rawCourse,
      estimatedHours: enriched.estimatedHours,
      lastUpdated: courseMeta.lastUpdated,
      modules: enriched.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          durationMinutes: lesson.durationMinutes,
          objectives: lesson.objectives,
          content: lesson.content,
          checklist: lesson.checklist,
          reflectionQuestions: lesson.reflectionQuestions,
          quiz: lesson.quiz,
          resources: lesson.resources,
          previousLessonId: lesson.previousLessonId,
          nextLessonId: lesson.nextLessonId,
        })),
      })),
    },
    resources,
  };
}

function stripLessonBuildFields(lesson) {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    durationMinutes: lesson.durationMinutes,
    objectives: lesson.objectives,
    content: lesson.content,
    checklist: lesson.checklist,
    reflectionQuestions: lesson.reflectionQuestions,
    quiz: lesson.quiz,
    resources: lesson.resources,
    previousLessonId: lesson.previousLessonId,
    nextLessonId: lesson.nextLessonId,
  };
}

function humanizeSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCourseJsonPath(slug) {
  return path.join(DATA_DIR, `course-${slug}.json`);
}

export function cleanupMissingAuthoredCourseFiles() {
  const authoredSourcePaths = new Set(findAuthoredCourseDirs().map((dirPath) => relative(dirPath).replace(/\\/g, "/")));
  const files = fs.readdirSync(DATA_DIR).filter((file) => COURSE_FILE_PATTERN.test(file));
  for (const fileName of files) {
    const fullPath = path.join(DATA_DIR, fileName);
    const course = JSON.parse(readText(fullPath));
    if (course.sourceType === "markdown" && course.sourcePath && !authoredSourcePaths.has(course.sourcePath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

export function loadAllCourseFiles() {
  const files = fs.readdirSync(DATA_DIR).filter((file) => COURSE_FILE_PATTERN.test(file)).sort();
  return files.map((fileName) => ({
    fileName,
    path: path.join(DATA_DIR, fileName),
    course: JSON.parse(readText(path.join(DATA_DIR, fileName))),
  }));
}

export function buildCourseSummaries(previousSummaries = []) {
  const previousById = new Map(previousSummaries.map((course, index) => [course.id, { course, index }]));
  const detailed = loadAllCourseFiles().map(({ course }) => enrichCourse(course));
  return detailed
    .map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      coverImage: course.coverImage,
      category: course.category,
      tags: course.tags || [],
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      moduleCount: course.moduleCount,
      lessonCount: course.lessonCount,
      featured: typeof course.featured === "boolean" ? course.featured : Boolean(previousById.get(course.id)?.course?.featured),
      lastUpdated: course.lastUpdated || previousById.get(course.id)?.course?.lastUpdated || todayStamp(),
    }))
    .sort((left, right) => {
      const leftOrder = previousById.get(left.id)?.index ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = previousById.get(right.id)?.index ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.title.localeCompare(right.title);
    });
}

export function buildCombinedResources(authoredResources) {
  const combined = [...loadLegacyResources(), ...authoredResources];
  return combined.sort((left, right) => left.title.localeCompare(right.title));
}

export function relative(targetPath) {
  return path.relative(ROOT_DIR, targetPath) || ".";
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
