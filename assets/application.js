/** Bind the offline reader to navigation and learner-state actions. */
"use strict";
let noteSaveTimer;
const courseSession = createCourseSession("adult-course-session", (hash) =>
  /^#lesson-\d{2}$/.test(hash) && COURSE.lessons.some((lesson) => hash === "#lesson-" + String(lesson.id).padStart(2, "0")));

/** Resolve a hash to a supported page, avoiding out-of-range lesson identifiers. */
function currentRoute() {
  const hash = location.hash.slice(1);
  const lessonMatch = /^lesson-(\d{2})$/.exec(hash);
  if (lessonMatch) {
    const identifier = Number(lessonMatch[1]);
    for (const lesson of COURSE.lessons) if (lesson.id === identifier) return { kind: "lesson", lesson };
  }
  const projectMatch = /^project-(\d)$/.exec(hash);
  if (projectMatch) {
    for (const project of COURSE.projects) {
      if (project.id === Number(projectMatch[1])) return { kind: "project", project };
    }
  }
  if (["setup", "projects", "plan", "glossary", "graduation"].includes(hash)) return { kind: hash };
  return { kind: "home" };
}

/** Render searchable lesson links and indicate completed and currently selected lessons. */
function renderNavigation() {
  const route = currentRoute();
  const query = document.getElementById("lesson-search").value.trim().toLocaleLowerCase("es");
  let markup = "";
  let matchCount = 0;
  for (let phase = 0; phase < COURSE.phases.length; phase += 1) {
    let links = "";
    for (const lesson of COURSE.lessons) {
      const searchable = lesson.title + " " + lesson.objectives.join(" ");
      if (lesson.phase !== phase || !searchable.toLocaleLowerCase("es").includes(query)) continue;
      matchCount += 1;
      const selected = route.kind === "lesson" && route.lesson.id === lesson.id;
      const completed = learnerProgress.completed.includes(lesson.id);
      links += '<a href="#lesson-' + lessonNumber(lesson.id) + '"' + (selected ? ' aria-current="page"' : "") +
        '><span class="nav-number">' + lessonNumber(lesson.id) + '</span><span>' +
        escapeHtml(lesson.title) + "</span>" + (completed ? '<span class="done-marker" aria-label="' +
        escapeHtml(translate("completed")) + '">✓</span>' : "") + "</a>";
    }
    if (links) markup += '<div class="nav-group"><h2>' + escapeHtml(COURSE.phases[phase]) + "</h2>" + links + "</div>";
  }
  document.getElementById("lesson-navigation").innerHTML = markup || '<p class="search-empty">' +
    escapeHtml(translate("noResults")) + "</p>";
  const count = learnerProgress.completed.length;
  document.getElementById("course-progress").value = count;
  document.getElementById("course-progress").setAttribute("aria-label", translate("progress"));
  document.getElementById("progress-caption").textContent = count + " / 32 · " + translate("progressDetail");
  for (const link of document.querySelectorAll("#primary-navigation a")) {
    const page = link.hash.slice(1);
    if (page === route.kind || (page === "projects" && route.kind === "project")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

/** Render the current page, preserving reading position for in-page state changes. */
function renderApplication(moveFocus = false) {
  const route = currentRoute();
  let markup;
  if (route.kind === "lesson") markup = lessonMarkup(route.lesson);
  else if (route.kind === "project") markup = projectMarkup(route.project);
  else if (route.kind === "setup") markup = setupMarkup();
  else if (route.kind === "projects") markup = projectsMarkup();
  else if (route.kind === "plan") markup = planMarkup();
  else if (route.kind === "graduation") markup = graduationMarkup();
  else if (route.kind === "glossary") markup = pageHeading(translate("glossary")) + definitionsMarkup(COURSE.glossary);
  else markup = homeMarkup();
  markup += '<footer class="reader-footer"><p>' + escapeHtml(translate("footer")) +
    '</p><button data-action="print">' + escapeHtml(translate("print")) + "</button></footer>";
  document.getElementById("main-content").innerHTML = markup;
  renderNavigation();
  const heading = document.querySelector("#main-content h1");
  document.title = heading.textContent + translate("documentTitleSuffix");
  if (moveFocus) {
    window.scrollTo(0, 0);
    heading.focus({ preventScroll: true });
  }
}

/** Toggle the small-screen navigation without hiding desktop navigation. */
function toggleMenu() {
  const open = document.getElementById("menu-toggle").getAttribute("aria-expanded") !== "true";
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("sidebar-collapsed", !open);
  const button = document.getElementById("menu-toggle");
  button.setAttribute("aria-expanded", String(open));
  button.textContent = translate(open ? "closeMenu" : "menu");
}

/** Close the navigation drawer after a destination is selected. */
function closeMenu() {
  if (window.matchMedia("(min-width: 641px)").matches) return;
  document.body.classList.remove("menu-open");
  document.body.classList.add("sidebar-collapsed");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  document.getElementById("menu-toggle").textContent = translate("menu");
}

/** Navigate to the new hash and move focus to the reader's heading. */
function handleHashChange() {
  closeMenu();
  const route = currentRoute();
  if (route.kind === "lesson") { learnerProgress.lastLesson = route.lesson.id; saveProgress(); }
  renderApplication(true);
  courseSession.record();
}

/** Update a mastery checkbox without replacing the focused element. */
function handleMainChange(event) {
  if (!event.target.matches("[data-check]")) return;
  const route = currentRoute();
  if (route.kind !== "lesson") return;
  const checks = learnerProgress.checks[route.lesson.id] || [false, false, false];
  checks[Number(event.target.dataset.check)] = event.target.checked;
  learnerProgress.checks[route.lesson.id] = checks;
  saveProgress();
  document.getElementById("complete-lesson").disabled =
    !learnerProgress.completed.includes(route.lesson.id) && !canCompleteLesson(route.lesson);
}

/** Store notes in memory immediately and debounce browser writes. */
function handleNotesInput(event) {
  if (event.target.id !== "lesson-notes") return;
  const route = currentRoute();
  if (route.kind !== "lesson") return;
  learnerProgress.notes[route.lesson.id] = event.target.value;
  clearTimeout(noteSaveTimer);
  /** Persist the latest notes after typing pauses, without rebuilding the reader. */
  function persistNotes() { if (saveProgress()) announce(translate("notesSaved")); }
  noteSaveTimer = setTimeout(persistNotes, 350);
}

/** Evaluate an explicit quiz submission and preserve the current reading position. */
function handleQuizSubmit(event) {
  if (event.target.id !== "lesson-quiz") return;
  event.preventDefault();
  const route = currentRoute();
  const selected = new FormData(event.target).get("answer");
  if (selected === null) { announce(translate("quizChoose")); return; }
  learnerProgress.quizzes[route.lesson.id] = Number(selected);
  saveProgress();
  const previousFeedback = event.target.querySelector(".quiz-feedback");
  if (previousFeedback) previousFeedback.remove();
  event.target.insertAdjacentHTML("beforeend", '<p class="quiz-feedback" role="status"><strong>' +
    escapeHtml(translate(Number(selected) === route.lesson.quiz.correct ? "quizCorrect" : "quizIncorrect")) +
    "</strong> " + (Number(selected) === route.lesson.quiz.correct ? escapeHtml(route.lesson.quiz.explanation) : "") + "</p>");
  const completionButton = document.getElementById("complete-lesson");
  completionButton.disabled = !learnerProgress.completed.includes(route.lesson.id) && !canCompleteLesson(route.lesson);
}

/** Handle lesson completion and print actions delegated from the reader. */
function handleMainClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const route = currentRoute();
  if (button.dataset.action === "print") { window.print(); return; }
  if (route.kind !== "lesson") return;
  if (button.dataset.action === "complete") {
    const identifier = route.lesson.id;
    if (learnerProgress.completed.includes(identifier)) {
      learnerProgress.completed.splice(learnerProgress.completed.indexOf(identifier), 1);
    } else if (canCompleteLesson(route.lesson)) learnerProgress.completed.push(identifier);
    saveProgress();
    const readingPosition = window.scrollY;
    renderApplication();
    window.scrollTo(0, readingPosition);
    document.getElementById("complete-lesson").focus({ preventScroll: true });
  }
}

/** Open the backup picker from an explicit learner action. */
function chooseProgressFile() { document.getElementById("progress-file").click(); }

/** Dismiss the mobile navigation with the keyboard and restore its toggle focus. */
function handleKeyboard(event) {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
    closeMenu();
    document.getElementById("menu-toggle").focus();
  }
}

/** Localize the shell and attach a single stable handler per interaction. */
function initializeApplication() {
  document.getElementById("brand-title").textContent = translate("brand");
  document.getElementById("search-label").textContent = translate("search");
  document.getElementById("lesson-search").placeholder = translate("searchPlaceholder");
  for (const key of ["exportProgress", "importProgress"]) {
    document.getElementById(key === "exportProgress" ? "export-progress" : "import-progress").textContent = translate(key);
  }
  let primaryMarkup = "";
  for (const key of ["home", "setup", "projects", "plan", "glossary", "graduation"]) {
    primaryMarkup += '<a href="#' + key + '">' + escapeHtml(translate(key)) + "</a>";
  }
  document.getElementById("primary-navigation").innerHTML = primaryMarkup;
  document.getElementById("lesson-search").addEventListener("input", renderNavigation);
  document.getElementById("export-progress").addEventListener("click", exportProgress);
  document.getElementById("import-progress").addEventListener("click", chooseProgressFile);
  document.getElementById("progress-file").addEventListener("change", importProgress);
  document.getElementById("menu-toggle").addEventListener("click", toggleMenu);
  document.getElementById("sidebar").addEventListener("click", handleSidebarClick);
  const main = document.getElementById("main-content");
  main.addEventListener("click", handleMainClick);
  main.addEventListener("change", handleMainChange);
  main.addEventListener("input", handleNotesInput);
  main.addEventListener("submit", handleQuizSubmit);
  document.addEventListener("keydown", handleKeyboard);
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("pagehide", saveProgress);
  courseSession.prepare();
  const route = currentRoute();
  if (route.kind === "lesson") { learnerProgress.lastLesson = route.lesson.id; saveProgress(); }
  if (window.matchMedia("(min-width: 641px)").matches) {
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "true");
    document.getElementById("menu-toggle").textContent = translate("closeMenu");
    document.body.classList.add("menu-open");
  } else closeMenu();
  renderApplication();
  courseSession.restore();
}

/** Close the drawer even when selecting the already active destination. */
function handleSidebarClick(event) { if (event.target.closest("a")) closeMenu(); }

initializeApplication();
