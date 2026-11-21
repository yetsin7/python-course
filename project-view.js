"use strict";

/** Render complete file contents while preserving Python indentation and escaping markup. */
function projectFileMarkup(name, source) {
  return '<h3>' + escapeHtml(name) + '</h3><a download="' + escapeHtml(name) +
    '" href="data:text/plain;charset=utf-8,' + encodeURIComponent(source + "\n") + '">' +
    escapeHtml(window.PROJECT_PATH.download) + ' ' + escapeHtml(name) + '</a><pre class="source-code" tabindex="0"><code>' +
    escapeHtml(source) + '</code></pre>';
}

/** Show this stage's edits and let returning learners inspect the inherited files. */
function projectStageMarkup(id) {
  const path = window.PROJECT_PATH;
  const stage = path.steps[id - 1];
  let markup = '<section class="reader-section goal-panel"><h2>' + escapeHtml(path.title) + ' · ' +
    escapeHtml(path.counter) + ' ' + id + '/32</h2><h3>' + escapeHtml(stage.title) + '</h3><p>' +
    inlineMarkup(stage.guide) + '</p><p>' + inlineMarkup(path.notes[id - 1]) + '</p><p>' + escapeHtml(path.action) + '</p>';
  const inherited = Object.assign({}, ...path.steps.slice(0, id - 1).map(previous => previous.files));
  for (const [name, source] of Object.entries(stage.files)) {
    markup += projectFileMarkup(name, source);
    delete inherited[name];
  }
  markup += '<h3>' + escapeHtml(path.run) + '</h3><pre class="source-code"><code>' +
    escapeHtml(stage.command) + '</code></pre>';
  if (stage.input) markup += '<p>' + escapeHtml(path.inputLabel) + ' <code>' + escapeHtml(stage.input) + '</code></p>';
  markup += '<h3>' + escapeHtml(path.expected) + '</h3><pre class="source-code"><code>' + escapeHtml(stage.output) + '</code></pre>';
  if (Object.keys(inherited).length) {
    markup += '<details><summary>' + escapeHtml(path.filesLabel) + '</summary>';
    for (const [name, source] of Object.entries(inherited)) markup += projectFileMarkup(name, source);
    markup += '</details>';
  }
  return markup + '</section>';
}
