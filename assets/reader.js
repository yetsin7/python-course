/** Present a single lesson with practice, self-assessment and mastery criteria. */
"use strict";

/** Decide whether a learner has satisfied the lesson's visible completion checks. */
function canCompleteLesson(lesson) {
  const checked = learnerProgress.checks[lesson.id] || [false, false, false];
  return checked.every(Boolean) && learnerProgress.quizzes[lesson.id] === lesson.quiz.correct;
}

/** Build a quiz whose feedback is revealed only after the learner submits an answer. */
function quizMarkup(lesson) {
  const selected = learnerProgress.quizzes[lesson.id];
  let markup = '<form id="lesson-quiz"><fieldset><legend>' + escapeHtml(lesson.quiz.question) + "</legend>";
  for (let index = 0; index < lesson.quiz.options.length; index += 1) {
    markup += '<label class="quiz-option"><input type="radio" name="answer" value="' + index + '"' +
      (selected === index ? " checked" : "") + "><span>" + escapeHtml(lesson.quiz.options[index]) + "</span></label>";
  }
  markup += '</fieldset><button class="secondary" type="submit">' + escapeHtml(translate("quizCheck")) + "</button>";
  if (selected !== undefined) {
    markup += '<p class="quiz-feedback" role="status"><strong>' +
      escapeHtml(translate(selected === lesson.quiz.correct ? "quizCorrect" : "quizIncorrect")) +
      "</strong> " + (selected === lesson.quiz.correct ? escapeHtml(lesson.quiz.explanation) : "") + "</p>";
  }
  return markup + "</form>";
}

/** Render practice hints and answers as separate collapsed disclosures. */
function exercisesMarkup(lesson) {
  let markup = '<p class="muted">' + escapeHtml(translate("solutionWarning")) + "</p>";
  let index = 0;
  for (const [prompt, hint, answer] of lesson.exercises) {
    index += 1;
    markup += '<article class="exercise"><h3><span class="exercise-number">' + index + "</span>" +
      escapeHtml(prompt) + '</h3><details><summary>' + escapeHtml(translate("hint")) +
      "</summary><p>" + escapeHtml(hint) + '</p></details><details class="solution"><summary>' +
      escapeHtml(translate("solution")) + "</summary><p>" + escapeHtml(answer) + "</p></details></article>";
  }
  return markup;
}

/** Render a concrete checklist and require self-assessment before the completion action. */
function masteryMarkup(lesson) {
  const checked = learnerProgress.checks[lesson.id] || [false, false, false];
  const completed = learnerProgress.completed.includes(lesson.id);
  let markup = "";
  for (let index = 0; index < lesson.mastery.length; index += 1) {
    markup += '<label class="mastery-item"><input type="checkbox" data-check="' + index + '"' +
      (checked[index] ? " checked" : "") + "><span>" + escapeHtml(lesson.mastery[index]) + "</span></label>";
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
  const steps = [escapeHtml(translate("runOpen")), escapeHtml(translate("runFolder")),
    escapeHtml(translate("runCommand")) + commandMarkup(lesson.run.command)];
  if (lesson.run.answers.length) {
    steps.push(escapeHtml(translate("runAnswers")) + commandMarkup(lesson.run.answers.join("\n")));
  }
  steps.push(escapeHtml(translate("runOutput")) + commandMarkup(lesson.run.output.trimEnd()));
  return "<p>" + escapeHtml(translate("runIntro")) + '</p><ol class="run-steps"><li>' + steps.join("</li><li>") +
    '</li></ol><p class="muted">' + escapeHtml(translate("runDifferent")) + ' <a href="#setup">' +
    escapeHtml(translate("setupCallLink")) + "</a></p>";
}

/** Compose the full reader without loading external fonts, libraries or lesson files. */
function lessonMarkup(lesson) {
  let markup = '<article class="lesson" data-lesson="' + lesson.id + '"><header class="page-heading">' +
    '<p class="eyebrow">' + escapeHtml(COURSE.phases[lesson.phase]) + " / " +
    escapeHtml(translate("lesson")) + " " + lessonNumber(lesson.id) + '</p><h1 tabindex="-1">' +
    escapeHtml(lesson.title) + '</h1><p class="lesson-meta">' + lesson.minutes + " " +
    escapeHtml(translate("estimated")) + "</p></header>";
  markup += sectionMarkup(translate("objectives"), listMarkup(lesson.objectives), "goal-panel");
  markup += sectionMarkup(translate("plain"), paragraphsMarkup([lesson.plain]), "plain-panel");
  markup += sectionMarkup(translate("terms"), definitionsMarkup(lesson.terms));
  markup += sectionMarkup(translate("concepts"), paragraphsMarkup(lesson.concepts));
  markup += sectionMarkup(translate("example"),
    '<div class="code-toolbar"><span>' + escapeHtml(translate("snippetLabel")) +
    '</span></div><pre class="source-code"><code>' + escapeHtml(lesson.code) + "</code></pre>" +
    '<aside class="external-practice"><strong>' + escapeHtml(translate("snippetPracticeTitle")) +
    '</strong><p>' + escapeHtml(translate("snippetPracticeText")) + "</p></aside>");
  markup += sectionMarkup(translate("walkthrough"), listMarkup(lesson.walkthrough, true));
  markup += sectionMarkup(translate("run"), runMarkup(lesson));
  markup += sectionMarkup(translate("practice"), exercisesMarkup(lesson));
  markup += sectionMarkup(translate("mistakes"), listMarkup(lesson.mistakes), "mistake-panel");
  markup += sectionMarkup(translate("quiz"), quizMarkup(lesson));
  markup += sectionMarkup(translate("mastery"), masteryMarkup(lesson), "goal-panel");
  markup += sectionMarkup(translate("notes"),
    '<label class="sr-only" for="lesson-notes">' + escapeHtml(translate("notes")) +
    '</label><textarea id="lesson-notes" maxlength="10000" rows="6" placeholder="' +
    escapeHtml(translate("notesPlaceholder")) + '">' + escapeHtml(learnerProgress.notes[lesson.id] || "") + "</textarea>");
  markup += sectionMarkup(translate("references"), referencesMarkup(lesson));
  markup += '<nav class="lesson-pager">';
  if (lesson.id > 1) markup += '<a class="secondary" href="#lesson-' + lessonNumber(lesson.id - 1) + '">' +
    escapeHtml(translate("previous")) + "</a>";
  if (lesson.id < COURSE.lessons.length) markup += '<a class="primary" href="#lesson-' +
    lessonNumber(lesson.id + 1) + '">' + escapeHtml(translate("next")) + " →</a>";
  return markup + "</nav></article>";
}
