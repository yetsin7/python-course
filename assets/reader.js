/** Present a single lesson with practice, self-assessment and mastery criteria. */
"use strict";

/** Decide whether a learner has satisfied the lesson's visible completion checks. */
function canCompleteLesson(lesson) {
  const checked = learnerProgress.checks[lesson.id] || [false, false, false];
  return checked.every(Boolean) && learnerProgress.quizzes[lesson.id] === lesson.quiz.correct &&
    (learnerProgress.typed[lesson.id] === true || typingLines(lesson).length === 0);
}

/** Build a quiz whose feedback is revealed only after the learner submits an answer. */
function quizMarkup(lesson) {
  const selected = learnerProgress.quizzes[lesson.id];
  let markup = '<form id="lesson-quiz"><fieldset><legend>' + inlineMarkup(lesson.quiz.question) + "</legend>";
  for (let index = 0; index < lesson.quiz.options.length; index += 1) {
    markup += '<label class="quiz-option"><input type="radio" name="answer" value="' + index + '"' +
      (selected === index ? " checked" : "") + "><span>" + inlineMarkup(lesson.quiz.options[index]) + "</span></label>";
  }
  markup += '</fieldset><button class="secondary" type="submit">' + escapeHtml(translate("quizCheck")) + "</button>";
  if (selected !== undefined) {
    markup += '<p class="quiz-feedback" role="status"><strong>' +
      escapeHtml(translate(selected === lesson.quiz.correct ? "quizCorrect" : "quizIncorrect")) +
      "</strong> " + (selected === lesson.quiz.correct ? inlineMarkup(lesson.quiz.explanation) : "") + "</p>";
  }
  return markup + "</form>";
}

/** Render practice hints and answers as separate collapsed disclosures. */
function exercisesMarkup(lesson) {
  let markup = '<p class="muted">' + inlineMarkup(translate("solutionWarning")) + "</p>";
  let index = 0;
  for (const [prompt, hint, answer] of lesson.exercises) {
    index += 1;
    markup += '<article class="exercise"><h3><span class="exercise-number">' + index + "</span>" +
      inlineMarkup(prompt) + '</h3><details><summary>' + escapeHtml(translate("hint")) +
      "</summary><p>" + inlineMarkup(hint) + '</p></details><details class="solution"><summary>' +
      escapeHtml(translate("solution")) + "</summary><p>" + inlineMarkup(answer) + "</p></details></article>";
  }
  return markup;
}

/** Render a concrete checklist and require self-assessment before the completion action. */
function masteryMarkup(lesson) {
  const checked = learnerProgress.checks[lesson.id] || [false, false, false];
  const completed = learnerProgress.completed.includes(lesson.id);
  let markup = completed ? celebrationMarkup(lesson) : "";
  for (let index = 0; index < lesson.mastery.length; index += 1) {
    markup += '<label class="mastery-item"><input type="checkbox" data-check="' + index + '"' +
      (checked[index] ? " checked" : "") + "><span>" + inlineMarkup(lesson.mastery[index]) + "</span></label>";
  }
  markup += '<p class="muted">' + escapeHtml(translate("completionHelp")) + '</p><button id="complete-lesson" class="primary" data-action="complete"' +
    (!completed && !canCompleteLesson(lesson) ? " disabled" : "") + ">" +
    escapeHtml(translate(completed ? "undoComplete" : "markComplete")) + "</button>";
  return markup;
}

/** Render official reading links associated with the current lesson. */
function referencesMarkup(lesson) {
  let markup = "<ul>";
  for (const key of lesson.references) {
    const reference = COURSE.references[key];
    markup += '<li><a href="' + escapeHtml(reference[1]) + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(reference[0]) + "</a></li>";
  }
  return markup + "</ul>";
}

/** Explain how to run the full example and what the learner should observe. */
function runMarkup(lesson) {
  const steps = [inlineMarkup(translate("runOpen")), inlineMarkup(translate("runFolder")),
    inlineMarkup(translate("runCommand")) + commandMarkup(lesson.run.command)];
  if (lesson.run.answers.length) {
    steps.push(inlineMarkup(translate("runAnswers")) + commandMarkup(lesson.run.answers.join("\n")));
  }
  steps.push(inlineMarkup(translate("runOutput")) + commandMarkup(lesson.run.output.trimEnd()));
  return "<p>" + inlineMarkup(translate("runIntro")) + '</p><ol class="run-steps"><li>' + steps.join("</li><li>") +
    '</li></ol><p class="muted">' + inlineMarkup(translate("runDifferent")) + ' <a href="#setup">' +
    escapeHtml(translate("setupCallLink")) + "</a></p>";
}

/** Wrap one learning stage with its number and title. */
function stageMarkup(number, title, contents) {
  return '<div class="stage" id="stage-' + number + '"><div class="stage-head"><span class="stage-number">' + number +
    '</span><h2 class="stage-title">' + escapeHtml(title) + "</h2></div>" + contents + "</div>";
}

/** Describe which completion requirements the learner has already met. */
function lessonChecks(lesson) {
  const checked = learnerProgress.checks[lesson.id] || [false, false, false];
  return [
    ["typed", learnerProgress.typed[lesson.id] === true || typingLines(lesson).length === 0],
    ["quiz", learnerProgress.quizzes[lesson.id] === lesson.quiz.correct],
    ["mastery", checked.every(Boolean)],
  ];
}

/** Render the sticky side panel: stage shortcuts and the completion checklist. */
function railMarkup(lesson, stages) {
  let markup = '<aside class="lesson-rail"><p class="rail-title">' + escapeHtml(translate("railStages")) + '</p><ol class="rail-stages">';
  stages.forEach((title, index) => {
    markup += '<li><button type="button" data-action="scroll" data-target="stage-' + (index + 1) + '"><span>' +
      (index + 1) + "</span>" + escapeHtml(title) + "</button></li>";
  });
  markup += '</ol><p class="rail-title">' + escapeHtml(translate("railChecks")) + '</p><ul class="rail-checks">';
  for (const [key, done] of lessonChecks(lesson)) {
    markup += '<li id="rail-' + key + '"' + (done ? ' class="is-done"' : "") + ">" + escapeHtml(translate("check-" + key)) + "</li>";
  }
  const completed = learnerProgress.completed.includes(lesson.id);
  return markup + '</ul><p class="rail-reward">' + escapeHtml(translate(completed ? "railDone" : "railReward")) + "</p></aside>";
}

/** Update the checklist in place after typing, answering or ticking a criterion. */
function refreshRail(lesson) {
  for (const [key, done] of lessonChecks(lesson)) {
    const item = document.getElementById("rail-" + key);
    if (item) item.classList.toggle("is-done", done);
  }
}

/** Compose the full lesson without loading external fonts, libraries or lesson files. */
function lessonMarkup(lesson) {
  const stages = ["stageIdea", "stageRead", "stageType", "stageRun", "stagePractice", "stageProve"].map(translate);
  let markup = '<article class="lesson" data-lesson="' + lesson.id + '"><header class="lesson-hero">' +
    '<p class="eyebrow">' + escapeHtml(COURSE.phases[lesson.phase]) + " · " + escapeHtml(translate("lesson")) + " " +
    lessonNumber(lesson.id) + " / " + COURSE.lessons.length + '</p><h1 tabindex="-1">' + escapeHtml(lesson.title) +
    '</h1><div class="hero-chips"><span>⏱ ' + lesson.minutes + " " + escapeHtml(translate("estimated")) +
    "</span><span>⭐ +" + EXPERIENCE.lesson + " XP</span><span>🧩 " + lesson.exercises.length + " " +
    escapeHtml(translate("statsExercises")) + "</span></div></header><div class=\"lesson-body\">";
  markup += stageMarkup(1, stages[0],
    sectionMarkup(translate("objectives"), listMarkup(lesson.objectives), "goal-panel") +
    sectionMarkup(translate("plain"), paragraphsMarkup([lesson.plain]), "plain-panel") +
    sectionMarkup(translate("terms"), definitionsMarkup(lesson.terms)) +
    sectionMarkup(translate("concepts"), paragraphsMarkup(lesson.concepts)));
  markup += stageMarkup(2, stages[1],
    sectionMarkup(translate("example"), '<div class="code-toolbar"><span>' + escapeHtml(translate("snippetLabel")) +
      '</span></div><pre class="source-code"><code>' + escapeHtml(lesson.code) + "</code></pre>" +
      '<aside class="external-practice"><strong>' + escapeHtml(translate("snippetPracticeTitle")) +
      "</strong><p>" + inlineMarkup(translate("snippetPracticeText")) + "</p></aside>") +
    sectionMarkup(translate("walkthrough"), listMarkup(lesson.walkthrough, true)));
  markup += stageMarkup(3, stages[2], sectionMarkup(translate("typing"), typingMarkup(lesson), "typing-panel"));
  markup += stageMarkup(4, stages[3], sectionMarkup(translate("run"), runMarkup(lesson)));
  markup += stageMarkup(5, stages[4],
    sectionMarkup(translate("practice"), exercisesMarkup(lesson)) +
    sectionMarkup(translate("mistakes"), listMarkup(lesson.mistakes), "mistake-panel"));
  markup += stageMarkup(6, stages[5],
    sectionMarkup(translate("quiz"), quizMarkup(lesson)) +
    sectionMarkup(translate("mastery"), masteryMarkup(lesson), "goal-panel") +
    sectionMarkup(translate("notes"), '<label class="sr-only" for="lesson-notes">' + escapeHtml(translate("notes")) +
      '</label><textarea id="lesson-notes" maxlength="10000" rows="6" placeholder="' +
      escapeHtml(translate("notesPlaceholder")) + '">' + escapeHtml(learnerProgress.notes[lesson.id] || "") + "</textarea>") +
    sectionMarkup(translate("references"), referencesMarkup(lesson)));
  markup += '<nav class="lesson-pager">';
  if (lesson.id > 1) markup += '<a class="secondary" href="#lesson-' + lessonNumber(lesson.id - 1) + '">← ' +
    escapeHtml(translate("previous")) + "</a>";
  else markup += "<span></span>";
  if (lesson.id < COURSE.lessons.length) markup += '<a class="primary" href="#lesson-' +
    lessonNumber(lesson.id + 1) + '">' + escapeHtml(translate("next")) + " →</a>";
  return markup + "</nav></div>" + railMarkup(lesson, stages) + "</article>";
}
