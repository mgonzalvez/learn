import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ensureDir, IMAGE_DIR, parseArgs, parseFrontmatter, readText, slugify } from "./course-authoring-lib.mjs";

const THEMES = {
  ocean: { start: "#0f4c81", end: "#62c0ff", accent: "#dff4ff", glow: "#9fe2ff" },
  ember: { start: "#7b2f1f", end: "#ff9160", accent: "#fff1e8", glow: "#ffc6a8" },
  forest: { start: "#16463d", end: "#79d0b1", accent: "#e8fff6", glow: "#adeed7" },
  ink: { start: "#0f1729", end: "#6c8cff", accent: "#edf2ff", glow: "#b9c6ff" },
  sunrise: { start: "#7f3b22", end: "#ffcf76", accent: "#fff5df", glow: "#ffe3aa" },
};

const ICONS = {
  spark: '<circle cx="232" cy="120" r="44" fill="url(#glow)" opacity="0.75"/><path d="M232 78l10 28 28 10-28 10-10 28-10-28-28-10 28-10z" fill="white"/>',
  branch: '<path d="M210 84a12 12 0 1 1 24 0 12 12 0 0 1-24 0Zm0 72a12 12 0 1 1 24 0 12 12 0 0 1-24 0Zm48 48a12 12 0 1 1 24 0 12 12 0 0 1-24 0Z" fill="white"/><path d="M222 96v48a24 24 0 0 0 24 24h24" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>',
  compass: '<circle cx="236" cy="144" r="54" fill="none" stroke="white" stroke-width="8"/><path d="M214 166l18-52 22 18-40 34Z" fill="white"/>',
  grid: '<rect x="194" y="102" width="84" height="84" rx="18" fill="none" stroke="white" stroke-width="8"/><path d="M222 102v84M250 102v84M194 130h84M194 158h84" stroke="white" stroke-width="6" opacity="0.95"/>',
};

export function renderCourseCoverSvg({ title, subtitle = "", theme = "ocean", icon = "spark" }) {
  const palette = THEMES[theme] || THEMES.ocean;
  const iconMarkup = ICONS[icon] || ICONS.spark;
  const titleLines = wrapText(title, 18, 4);
  const subtitleLines = wrapText(subtitle, 42, 2);
  const titleFontSize = titleLines.length >= 4 ? 58 : 66;
  const titleLineHeight = titleLines.length >= 4 ? 72 : 78;
  const titleStartY = 208;
  const subtitleStartY = titleStartY + titleLines.length * titleLineHeight + 40;
  const subtitleMarkup = subtitleLines
    .map(
      (line, index) =>
        `<text x="72" y="${subtitleStartY + index * 34}" class="cover-subtitle">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(subtitle || title)}</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}"/>
      <stop offset="100%" stop-color="${palette.end}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .cover-kicker, .cover-title, .cover-subtitle {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
    }
    .cover-kicker {
      font-size: 22px;
      letter-spacing: 0.04em;
      fill: ${palette.accent};
      opacity: 0.9;
    }
    .cover-title {
      font-size: ${titleFontSize}px;
      font-weight: 700;
      letter-spacing: -0.04em;
      fill: white;
    }
    .cover-subtitle {
      font-size: 27px;
      font-weight: 520;
      letter-spacing: -0.01em;
      fill: ${palette.accent};
      opacity: 0.95;
    }
  </style>
  <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
  <circle cx="1040" cy="140" r="210" fill="url(#glow)" opacity="0.55"/>
  <circle cx="990" cy="700" r="260" fill="url(#glow)" opacity="0.18"/>
  <circle cx="170" cy="760" r="220" fill="url(#glow)" opacity="0.12"/>
  <rect x="48" y="48" width="1104" height="804" rx="40" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
  <rect x="72" y="112" width="618" height="676" rx="34" fill="rgba(8,15,30,0.18)" stroke="rgba(255,255,255,0.1)"/>
  <rect x="742" y="164" width="370" height="370" rx="44" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.16)"/>
  <rect x="742" y="572" width="370" height="128" rx="32" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
  <text x="72" y="94" class="cover-kicker">Personal Learning Hub</text>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="72" y="${titleStartY + index * titleLineHeight}" class="cover-title">${escapeXml(line)}</text>`,
    )
    .join("")}
  ${subtitleMarkup}
  <g transform="translate(748 182)">
    ${iconMarkup}
  </g>
  <text x="782" y="626" class="cover-kicker">Curated course</text>
  <text x="782" y="666" class="cover-subtitle">Premium, self-paced learning</text>
</svg>`;
}

function wrapText(text, maxChars, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [];
  }
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) {
    lines.push(current);
  }
  if (lines.length <= maxLines) {
    return lines;
  }
  return [...lines.slice(0, maxLines - 1), `${lines.slice(maxLines - 1).join(" ").slice(0, maxChars - 1)}…`];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const args = parseArgs();
  const courseDir = args.course ? path.resolve(args.course) : null;
  let title = args.title;
  let subtitle = args.subtitle || "";
  let slug = args.slug;
  let theme = args.theme || "ocean";
  let icon = args.icon || "spark";
  let output = args.output;

  if (courseDir) {
    const coursePath = path.join(courseDir, "course.md");
    const { meta } = parseFrontmatter(readText(coursePath), coursePath);
    title = title || meta.title;
    subtitle = subtitle || meta.subtitle || "";
    slug = slug || meta.slug || slugify(meta.title);
    theme = args.theme || meta.coverTheme || theme;
    icon = args.icon || meta.coverIcon || icon;
    output = output || path.join(process.cwd(), meta.coverImage || path.join("assets", "images", `${slug}-cover.svg`));
  }

  if (!title) {
    throw new Error("A title is required. Use --title=\"Course Title\" or --course=authoring/courses/<slug>.");
  }

  output = output || path.join(IMAGE_DIR, `${slugify(slug || title)}-cover.svg`);
  ensureDir(path.dirname(output));
  const svg = renderCourseCoverSvg({ title, subtitle, theme, icon });
  fs.writeFileSync(output, svg);
  console.log(`Generated ${path.relative(process.cwd(), output)}`);

  if (args.png) {
    const pngOutput = output.replace(/\.svg$/i, ".png");
    try {
      execFileSync("magick", [output, pngOutput], { stdio: "ignore" });
      console.log(`Generated ${path.relative(process.cwd(), pngOutput)} with ImageMagick`);
    } catch (error) {
      console.log("ImageMagick raster export skipped. `magick` is not available or failed on this machine.");
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
