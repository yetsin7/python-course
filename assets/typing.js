/** Typing drill: the learner copies the snippet by hand, with keyboard help and no pasting. */
"use strict";

/** Select the snippet lines worth typing: real code, not comments or documentation prose. */
function typingLines(lesson) {
  const lines = [];
  for (const line of lesson.code.split("\n")) {
    const text = line.trim();
    if (text && !text.startsWith("#") && !text.startsWith('"""')) lines.push(line.replace(/\s+$/, ""));
  }
  return lines;
}

/** Reduce a line to what must match: indentation and symbols, ignoring accents and inner spacing. */
function typingKey(line) {
  const text = line.replace(/\t/g, "    ").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "").replace(/\s+$/, "");
  const indent = text.length - text.trimStart().length;
  return { indent, body: text.trim().replace(/\s+/g, "") };
}

/** Compare typed lines with the snippet and describe the state of each expected line. */
function evaluateTyping(targets, typedText) {
  const typed = typedText.split("\n").filter((line) => line.trim());
  const states = [];
  let complete = typed.length === targets.length;
  for (let index = 0; index < targets.length; index += 1) {
    if (index >= typed.length) { states.push({ state: "pending" }); complete = false; continue; }
    const expected = typingKey(targets[index]);
    const actual = typingKey(typed[index]);
    if (expected.indent === actual.indent && expected.body === actual.body) { states.push({ state: "done" }); continue; }
    complete = false;
    const lastTyped = index === typed.length - 1;
    if (expected.indent !== actual.indent && !(lastTyped && !actual.body)) {
      states.push({ state: "wrong", hint: translate("typingIndent").replace("{count}", expected.indent) });
    } else if (lastTyped && expected.body.startsWith(actual.body)) {
      states.push({ state: "typing" });
    } else {
      let position = 0;
      while (position < actual.body.length && actual.body[position] === expected.body[position]) position += 1;
      states.push({ state: "wrong", hint: translate("typingNear").replace("{text}", expected.body.slice(position, position + 8)) });
    }
  }
  return { states, complete, extra: typed.length > targets.length };
}

/** List only the special symbols that appear in this snippet, with two ways to type each one. */
function symbolHelpMarkup(code) {
  const keyboard = COURSE.keyboard;
  let rows = "";
  for (const [symbol, name, altCode, keys] of keyboard.symbols) {
    if (!code.includes(symbol)) continue;
    rows += '<div><dt><kbd class="symbol-key">' + escapeHtml(symbol) + "</kbd> " + escapeHtml(name) +
      "</dt><dd><strong>Alt + " + altCode + "</strong> · " + escapeHtml(keys) + "</dd></div>";
  }
  if (/^ +\S/m.test(code)) {
    rows += "<div><dt>" + escapeHtml(keyboard.indentName) + "</dt><dd>" + escapeHtml(keyboard.indentHelp) + "</dd></div>";
  }
  if (!rows) return "";
  return '<details class="symbol-help" open><summary>' + escapeHtml(translate("symbolsTitle")) +
    '</summary><dl class="definitions symbol-list">' + rows + '</dl><p class="muted">' +
    escapeHtml(keyboard.altHelp) + "</p></details>";
}

/** Render the drill with one status row per expected line and a paste-proof writing area. */
function typingMarkup(lesson) {
  const targets = typingLines(lesson);
  const done = learnerProgress.typed[lesson.id] === true;
  let rows = "";
  for (const line of targets) {
    rows += '<li data-state="pending"><code>' + escapeHtml(line) + '</code><span class="typing-status"></span></li>';
  }
  return "<p>" + escapeHtml(translate("typingIntro")) + "</p>" + symbolHelpMarkup(targets.join("\n")) +
    '<ol class="typing-lines">' + rows + '</ol><label for="typing-input">' + escapeHtml(translate("typingLabel")) +
    '</label><textarea id="typing-input" class="typing-input" rows="' + (targets.length + 1) +
    '" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="' +
    escapeHtml(translate("typingPlaceholder")) + '">' + escapeHtml(learnerProgress.drafts[lesson.id] || "") +
    '</textarea><p id="typing-result" class="typing-result' + (done ? " is-done" : "") + '" role="status">' +
    escapeHtml(translate(done ? "typingDone" : "typingStart")) + "</p>";
}

/** Refresh every status row and record the drill the first time it is completed. */
function refreshTyping(lesson, fromLearner) {
  const input = document.getElementById("typing-input");
  if (!input) return;
  const result = evaluateTyping(typingLines(lesson), input.value);
  const rows = document.querySelectorAll(".typing-lines li");
  result.states.forEach((entry, index) => {
    rows[index].dataset.state = entry.state;
    rows[index].querySelector(".typing-status").textContent =
      entry.state === "wrong" ? entry.hint : translate("typingState-" + entry.state);
  });
  const message = document.getElementById("typing-result");
  const alreadyDone = learnerProgress.typed[lesson.id] === true;
  if (result.complete || alreadyDone) message.textContent = translate("typingDone");
  else message.textContent = translate(result.extra ? "typingExtra" : "typingStart");
  message.classList.toggle("is-done", result.complete || alreadyDone);
  if (!fromLearner) return;
  learnerProgress.drafts[lesson.id] = input.value.slice(0, 20000);
  if (result.complete && !alreadyDone) {
    const badgesBefore = earnedBadgeIds();
    learnerProgress.typed[lesson.id] = true;
    recordActivity();
    showToast(translate("typingReward"));
    announceNewBadges(badgesBefore);
    document.getElementById("complete-lesson").disabled =
      !learnerProgress.completed.includes(lesson.id) && !canCompleteLesson(lesson);
    renderNavigation();
  }
  refreshRail(lesson);
  saveProgress();
}

/** Insert four spaces for Tab so indentation can be typed the way code editors do it. */
function handleTypingKeydown(event) {
  if (event.target.id !== "typing-input" || event.key !== "Tab" || event.shiftKey) return;
  event.preventDefault();
  const input = event.target;
  const start = input.selectionStart;
  input.value = input.value.slice(0, start) + "    " + input.value.slice(input.selectionEnd);
  input.selectionStart = input.selectionEnd = start + 4;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Refuse pasted or dropped text in the drill and explain why. */
function handleTypingPaste(event) {
  if (event.target.id !== "typing-input") return;
  event.preventDefault();
  showToast(translate("noPaste"));
}

/** Refuse copying code from the lesson, so examples are typed instead of pasted elsewhere. */
function handleCodeCopy(event) {
  const selection = document.getSelection();
  const anchor = selection && selection.anchorNode ? selection.anchorNode.parentElement : null;
  const insideCode = (node) => Boolean(node && node.closest && node.closest("pre, code, .typing-lines"));
  if (event.target.id === "typing-input" || event.target.id === "lesson-notes") return;
  if (!insideCode(event.target) && !insideCode(anchor)) return;
  event.preventDefault();
  if (event.type !== "contextmenu" && event.type !== "dragstart") showToast(translate("noCopy"));
}

/** Attach the drill and copy-protection handlers once for the whole reader. */
function bindTyping(main) {
  main.addEventListener("input", (event) => {
    const route = currentRoute();
    if (event.target.id === "typing-input" && route.kind === "lesson") refreshTyping(route.lesson, true);
  });
  main.addEventListener("keydown", handleTypingKeydown);
  main.addEventListener("paste", handleTypingPaste);
  main.addEventListener("drop", handleTypingPaste);
  for (const type of ["copy", "cut", "contextmenu", "dragstart"]) main.addEventListener(type, handleCodeCopy);
}
