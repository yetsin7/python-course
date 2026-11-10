/** Render trusted structure while escaping every localized or learner-authored value. */
"use strict";

/** Escape text before inserting it into HTML attributes or text nodes. */
function escapeHtml(value) {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  /** Resolve an HTML-sensitive character to its entity. */
  function replaceCharacter(character) { return replacements[character]; }
  return String(value).replace(/[&<>"']/g, replaceCharacter);
}

/** Produce a consistent numbered label for file and lesson navigation. */
function lessonNumber(identifier) { return String(identifier).padStart(2, "0"); }

/** Render plain localized paragraphs without interpreting embedded markup. */
function paragraphsMarkup(paragraphs) {
  let markup = "";
  for (const paragraph of paragraphs) markup += "<p>" + escapeHtml(paragraph) + "</p>";
  return markup;
}

/** Render an ordered or unordered collection of localized prose. */
function listMarkup(items, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  let markup = "<" + tag + ">";
  for (const item of items) markup += "<li>" + escapeHtml(item) + "</li>";
  return markup + "</" + tag + ">";
}

/** Render paired terms and explanations as a semantic definition list. */
function definitionsMarkup(pairs) {
  let markup = '<dl class="definitions">';
  for (const [term, explanation] of pairs) {
    markup += "<div><dt>" + escapeHtml(term) + "</dt><dd>" + escapeHtml(explanation) + "</dd></div>";
  }
  return markup + "</dl>";
}

/** Wrap a cohesive reader section with a localized heading. */
function sectionMarkup(title, contents, className = "") {
  return '<section class="reader-section ' + escapeHtml(className) + '"><h2>' +
    escapeHtml(title) + "</h2>" + contents + "</section>";
}

/** Render a technical command with no executable HTML or shell interpolation. */
function commandMarkup(command) {
  return '<pre class="command"><code>' + escapeHtml(command) + "</code></pre>";
}

/** Select the next unfinished lesson, defaulting to the first for review. */
function nextLesson() {
  for (const lesson of COURSE.lessons) if (!learnerProgress.completed.includes(lesson.id)) return lesson;
  return COURSE.lessons[0];
}

/** Produce a heading shared by non-lesson pages. */
function pageHeading(title, introduction = "") {
  return '<header class="page-heading"><p class="eyebrow">' + escapeHtml(COURSE.subtitle) +
    '</p><h1 tabindex="-1">' + escapeHtml(title) + "</h1>" +
    (introduction ? "<p>" + escapeHtml(introduction) + "</p>" : "") + "</header>";
}
