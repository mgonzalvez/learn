export function shellTemplate({ currentPage, mainContent }) {
  const navItems = [
    ["dashboard", "Dashboard", "index.html"],
    ["courses", "Courses", "courses.html"],
    ["progress", "Progress", "progress.html"],
    ["notes", "Notes", "notes.html"],
    ["resources", "Resources", "resources.html"],
  ];

  return `
    <div class="site-shell">
      <div class="ambient-layer" aria-hidden="true">
        <span class="ambient-orb ambient-orb-a"></span>
        <span class="ambient-orb ambient-orb-b"></span>
        <span class="ambient-grid"></span>
      </div>
      <header class="site-header">
        <div class="nav-bar">
          <a class="brand" href="index.html" aria-label="Personal Learning Hub home">
            <span class="brand-mark">PL</span>
            <span class="brand-copy">
              <strong>Personal Learning Hub</strong>
              <small>Premium static LMS</small>
            </span>
          </a>
          <button class="mobile-nav-toggle" type="button" data-mobile-toggle aria-expanded="false">Menu</button>
          <nav class="nav-links" data-nav-links>
            ${navItems
              .map(
                ([key, label, href]) => `
                  <a href="${href}" ${currentPage === key ? 'aria-current="page"' : ""}>${label}</a>
                `
              )
              .join("")}
          </nav>
          <div class="nav-actions">
            <label class="nav-search" aria-label="Global site search">
              <span>⌘K</span>
              <input type="search" placeholder="Search courses, lessons, concepts, sources" data-global-search-trigger />
            </label>
            <button class="theme-toggle" type="button" data-theme-toggle>Theme</button>
          </div>
        </div>
      </header>
      <main id="main-content" class="page-wrap">${mainContent}</main>
      <footer class="footer">
        <div class="footer-inner">
          <p class="footer-copy">Built as a premium flat-site learning platform for GitHub Pages, with local-first state and zero backend dependencies.</p>
          <p class="footer-copy">© Personal Learning Hub</p>
        </div>
      </footer>
      <dialog class="search-panel" data-search-panel>
        <div class="search-panel-inner">
          <div class="search-shell">
            <header>
              <input class="control" type="search" placeholder="Search everything" data-global-search-input />
              <button class="button-secondary" type="button" data-close-search>Close</button>
            </header>
            <div class="results-list" data-global-search-results></div>
          </div>
        </div>
      </dialog>
    </div>
  `;
}

export function progressBar(progress, label = "Progress") {
  return `
    <div aria-label="${label}: ${progress}%">
      <div class="progress-track">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
    </div>
  `;
}

export function statusPill(progress) {
  const status = progress >= 100 ? "completed" : progress > 0 && progress < 35 ? "started" : progress > 0 ? "in-progress" : "not-started";
  const label = status === "completed" ? "Completed" : status === "in-progress" ? "In Progress" : status === "started" ? "Started" : "Not Started";
  return `<span class="status-pill" data-status="${status}">${label}</span>`;
}

export function emptyState(title, copy, actionHtml = "") {
  return `
    <div class="empty-state">
      <h3>${title}</h3>
      <p class="muted">${copy}</p>
      ${actionHtml}
    </div>
  `;
}

export function toast(message) {
  let stack = document.querySelector("[data-toast-stack]");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.dataset.toastStack = "true";
    document.body.append(stack);
  }
  const node = document.createElement("div");
  node.className = "chip toast";
  node.textContent = message;
  stack.append(node);
  window.setTimeout(() => {
    node.remove();
  }, 1800);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
