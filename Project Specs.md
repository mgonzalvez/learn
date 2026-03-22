Project Title:
Personal Learning Hub

Goal:
Build a static personal learning website that feels like a modern LMS but can be hosted entirely on GitHub Pages. It must use plain HTML, CSS, and vanilla JavaScript only. No backend, no database, no server-side auth, no frameworks required. All user state must persist in localStorage.

Core Product Vision:
This is a single-user personal learning portal, not a school LMS. It should feel like a polished, modern learning dashboard with:
- a home dashboard
- a course catalog
- course detail pages
- lesson pages
- progress tracking
- notes
- bookmarks
- search
- dark/light mode
- responsive design

Design Direction:
Create a clean, premium, app-like interface inspired by modern SaaS dashboards and online learning platforms.
Visual goals:
- elegant, minimal, modern
- rounded cards
- soft shadows
- spacious layout
- strong typography hierarchy
- subtle hover states
- responsive on desktop, tablet, and phone
- not academic-looking
- not corporate LMS-looking
- not docs-looking unless heavily polished

Technical Constraints:
- Plain HTML, CSS, JavaScript only
- No build step required
- Must work as a static site on GitHub Pages
- No external APIs required
- No login system
- No server-side code
- Keep dependencies at zero if possible
- If any dependency is used, it must be lightweight and CDN-based

Required Pages:
1. index.html = Dashboard / Home
2. courses.html = Course catalog
3. course.html = Single course detail page
4. lesson.html = Single lesson page
5. progress.html = Progress overview
6. notes.html = Saved notes
7. resources.html = Resource library
8. 404.html = Friendly not found page

Required Folder Structure:
/
  index.html
  courses.html
  course.html
  lesson.html
  progress.html
  notes.html
  resources.html
  404.html
  README.md
  /assets/
    /css/
      styles.css
    /js/
      app.js
      storage.js
      data.js
      search.js
      progress.js
      quiz.js
      notes.js
      ui.js
    /data/
      courses.json
      course-homelab.json
      course-boardgame.json
      resources.json
    /images/
      placeholder-course-1.jpg
      placeholder-course-2.jpg
    /icons/

Site-Wide Layout Requirements:
- Top navigation bar with:
  - logo/site title: Personal Learning Hub
  - links: Dashboard, Courses, Progress, Notes, Resources
  - theme toggle
- Mobile-friendly collapsible menu
- Optional sidebar on course and lesson pages
- Footer with small GitHub Pages-friendly copyright text

Data Architecture:
All content must be data-driven from JSON files.

1. courses.json
Used for course catalog and dashboard summaries.
Each course object must include:
- id
- slug
- title
- subtitle
- description
- coverImage
- category
- tags
- difficulty
- estimatedHours
- moduleCount
- lessonCount
- featured
- lastUpdated

2. Individual course JSON files
Each course file must include:
- id
- slug
- title
- subtitle
- description
- coverImage
- category
- tags
- difficulty
- estimatedHours
- modules

Each module must include:
- id
- title
- description
- lessons

Each lesson must include:
- id
- slug
- title
- durationMinutes
- objectives (array)
- content (HTML string or structured sections)
- checklist (array)
- reflectionQuestions (array)
- quiz (array of questions)
- resources (array)
- previousLessonId
- nextLessonId

3. resources.json
Each resource object must include:
- id
- title
- type
- description
- url
- tags
- relatedCourseId

Routing Strategy:
Since this is a static site, do not use server routing.
Use query parameters:
- course.html?course=homelab-basics
- lesson.html?course=homelab-basics&lesson=compose-fundamentals

If query params are missing or invalid, show a friendly error state and link back to Courses.

Core Features:
1. Dashboard
Show:
- welcome hero
- continue learning card
- featured courses
- active courses with progress bars
- recently viewed lessons
- bookmarks
- quick stats:
  - total courses
  - lessons completed
  - current streak or recent activity
- quick links to notes and resources

2. Course Catalog
Show:
- responsive grid of course cards
- search bar
- filters:
  - category
  - difficulty
  - status (not started / in progress / completed)
  - tags
- sort options:
  - alphabetical
  - recently updated
  - progress
- each card should show:
  - image
  - title
  - short description
  - difficulty
  - estimated hours
  - lesson count
  - progress bar
  - start/resume button

3. Course Detail Page
Show:
- course hero section
- title, subtitle, description
- metadata chips
- overall progress bar
- start/resume button
- module list with expandable sections
- lessons within modules
- completion indicators for lessons
- estimated total time
- tags
- related resources

4. Lesson Page
Show:
- breadcrumbs
- lesson title
- duration
- course name / module name
- learning objectives
- lesson content
- checklist with completion toggles
- reflection prompts
- quiz section
- personal notes area
- bookmark button
- mark complete button
- previous / next lesson navigation
- side panel or sticky lesson progress summary on desktop

5. Progress Page
Show:
- all courses with completion percentage
- lessons completed total
- modules completed total
- learning streak or simple recent activity tracker
- bar or ring visual summaries using CSS/JS only
- list of recently completed lessons
- filters for completed / in progress / not started

6. Notes Page
Show:
- all user notes saved from lesson pages
- grouped by course and lesson
- search notes
- edit and delete notes
- empty state if no notes exist

7. Resources Page
Show:
- searchable/filterable resource list
- resource cards or rows
- filter by course or tag
- clear labels for type: article, video, download, tool, reference

State Management Requirements:
Use localStorage for all user state.

Implement storage for:
- completedLessons = array of lesson IDs
- completedChecklistItems = object keyed by lesson ID
- bookmarkedLessons = array
- notes = object keyed by lesson ID
- recentLessons = array with timestamps
- themePreference = light/dark
- lastVisitedLesson = object
- quizResults = object keyed by lesson ID

Create a storage helper module with functions like:
- getState(key, fallback)
- setState(key, value)
- toggleCompletedLesson(lessonId)
- isLessonCompleted(lessonId)
- saveNote(lessonId, text)
- getNote(lessonId)
- toggleBookmark(lessonId)
- getRecentLessons()
- setLastVisitedLesson(courseSlug, lessonSlug)

Progress Logic Requirements:
Implement:
- lesson completion state
- checklist completion state
- course progress as percent of completed lessons
- module progress as percent of completed lessons in module
- resume logic:
  - if there is a last visited incomplete lesson, offer Resume
  - otherwise offer Start Course or Review Course
- completed courses should display clearly

Search Requirements:
Build client-side search across:
- course titles
- course descriptions
- lesson titles
- lesson content text
- tags
- resource titles/descriptions

Search behavior:
- instant results as user types
- reusable search component
- highlight matching terms if practical
- graceful empty states

Quiz Requirements:
Support simple multiple-choice quizzes embedded in lesson data.
Each quiz question should include:
- prompt
- choices
- correctIndex
- explanation

Quiz behavior:
- render questions on lesson page
- allow answer selection
- show correct/incorrect state after submit
- save last submitted result in localStorage
- keep styling clean and lightweight

Notes Requirements:
Each lesson page must include a personal notes textarea.
Behavior:
- auto-save notes to localStorage after short delay
- show “Saved” status
- notes must appear on Notes page
- notes can be edited from Notes page too

Bookmarks Requirements:
Users can bookmark lessons.
Show bookmarks:
- on dashboard
- optionally on lesson pages
- in a small section on courses or notes page

Theme Requirements:
Implement dark/light mode with:
- persistent preference in localStorage
- accessible contrast
- smooth but subtle transitions
- no flash of incorrect theme on page load if possible

Responsive Requirements:
- mobile-first support
- nav collapses well on smaller screens
- cards stack gracefully
- lesson content remains readable on phone
- buttons remain tappable
- filters/search usable on mobile

Accessibility Requirements:
- semantic HTML
- keyboard-accessible navigation
- visible focus states
- form labels
- adequate color contrast
- buttons must be actual buttons
- no interaction that requires hover only

Performance Requirements:
- fast initial load
- avoid oversized assets
- minimal JS
- modular code
- no unnecessary animations
- clean DOM structure

Styling Requirements:
Use CSS custom properties for theme tokens:
- background
- surface
- text
- muted text
- accent
- border
- shadow
- success
- warning

Suggested UI components:
- top nav
- mobile menu
- hero
- dashboard stat cards
- course cards
- progress bars
- chips/tags
- accordion modules
- lesson content blocks
- quiz cards
- note panel
- resource cards
- empty states
- toast or inline save message

Sample Content Requirements:
Create at least 2 complete sample courses with real-looking content.

Sample Course 1:
Course title: Homelab Foundations
Subtitle: Build a reliable personal server stack step by step
Suggested modules:
- Planning Your Homelab
- Docker Basics
- Storage and Backups
- Remote Access and Security

Include 8–10 lessons total.

Sample Course 2:
Course title: Board Game Design Workshop
Subtitle: From rough concept to playable prototype
Suggested modules:
- Core Loop and Player Experience
- Mechanisms and Constraints
- Prototyping and Testing
- Iteration and Polish

Include 8–10 lessons total.

Each lesson should include:
- 2–4 objectives
- several paragraphs of content
- 3–5 checklist items
- 1–3 reflection questions
- 2–3 quiz questions where appropriate

Required JavaScript Modules:
1. app.js
- bootstraps page behavior
- initializes theme
- initializes nav
- loads page-specific logic

2. data.js
- fetches JSON data
- helpers for finding course/lesson by slug or ID

3. storage.js
- localStorage wrapper and state helpers

4. progress.js
- compute lesson/module/course progress
- recent activity logic
- resume logic

5. search.js
- build and query search index
- render search/filter results

6. quiz.js
- render quizzes
- score quizzes
- persist results

7. notes.js
- notes autosave
- notes rendering and editing

8. ui.js
- shared UI rendering helpers
- toasts, badges, cards, chips, progress bars, empty states

Page-Level Behavior Requirements:
index.html:
- render dashboard data dynamically
- show featured courses
- show in-progress courses
- show bookmarks and recent lessons

courses.html:
- load courses.json
- render filters, search, sort, cards
- apply progress indicators to cards

course.html:
- read course slug from query param
- load specific course JSON
- render modules and lessons
- show resume button

lesson.html:
- read course and lesson params
- render lesson data
- wire up checklist, quiz, notes, bookmark, complete button
- update recent lessons and last visited lesson

progress.html:
- aggregate all progress across courses
- render stats and course progress summaries

notes.html:
- collect all saved notes
- render grouped notes
- support inline edit/delete

resources.html:
- render resource library with search/filter

README.md Requirements:
Include:
- project overview
- file structure
- how content JSON works
- how to add a new course
- how to deploy to GitHub Pages
- how query-parameter routing works
- note that all progress is stored locally in browser storage

Content Authoring Requirements:
Make it easy to add future courses by:
1. creating a new course JSON file
2. adding a summary entry to courses.json
3. optionally adding image/resources
No code edits should be required to add normal new content.

Non-Goals:
Do not build:
- authentication
- multi-user support
- backend APIs
- instructor grading
- certificates
- SCORM
- server search
- admin panel

Code Quality Requirements:
- comment key logic clearly
- keep functions small and readable
- avoid duplication
- write maintainable vanilla JS
- use consistent naming
- avoid overengineering

Final Deliverables:
Produce:
1. complete file/folder structure
2. all HTML files
3. all CSS files
4. all JS files
5. all JSON data files with 2 sample courses
6. placeholder imagery references or simple gradients if images are unavailable
7. README with setup and deployment steps

Success Criteria:
The project is successful if:
- it can be committed directly to a GitHub repo
- it can be hosted on GitHub Pages without a backend
- it feels like a modern personal LMS
- progress, notes, bookmarks, theme, and recent activity persist locally
- new courses can be added via JSON
- it works well on desktop and mobile