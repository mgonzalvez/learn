import fs from "node:fs";
import path from "node:path";

import { DIST_DIR, ROOT_DIR, ensureDir } from "./course-authoring-lib.mjs";

const filesToCopy = [
  "index.html",
  "courses.html",
  "course.html",
  "lesson.html",
  "progress.html",
  "notes.html",
  "resources.html",
  "404.html",
];

fs.rmSync(DIST_DIR, { recursive: true, force: true });
ensureDir(DIST_DIR);

for (const fileName of filesToCopy) {
  fs.copyFileSync(path.join(ROOT_DIR, fileName), path.join(DIST_DIR, fileName));
}

fs.cpSync(path.join(ROOT_DIR, "assets"), path.join(DIST_DIR, "assets"), { recursive: true });

const cnamePath = path.join(ROOT_DIR, "CNAME");
if (fs.existsSync(cnamePath)) {
  fs.copyFileSync(cnamePath, path.join(DIST_DIR, "CNAME"));
}

console.log("Built dist/ for GitHub Pages deployment.");

