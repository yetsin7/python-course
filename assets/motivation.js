/** Turn saved progress into experience points, levels, daily streaks and badges. */
"use strict";

const EXPERIENCE = { lesson: 100, typing: 25, quiz: 15, perLevel: 400 };

/** Format a local calendar day so streaks follow the learner's own clock. */
function dayStamp(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/** Remember that the learner practised today. */
function recordActivity() {
  const today = dayStamp(new Date());
  if (!learnerProgress.days.includes(today)) learnerProgress.days.push(today);
}

/** Measure the streak that is still alive and the longest one ever reached. */
function streakInfo() {
  const days = new Set(learnerProgress.days);
  const cursor = new Date();
  if (!days.has(dayStamp(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(dayStamp(cursor))) { current += 1; cursor.setDate(cursor.getDate() - 1); }
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const stamp of [...days].sort()) {
    const day = new Date(stamp + "T12:00:00");
    run = previous && Math.round((day - previous) / 86400000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  return { current, longest, practisedToday: days.has(dayStamp(new Date())) };
}

/** Add up the points earned by finishing lessons, typing drills and correct quizzes. */
function experiencePoints() {
  let points = learnerProgress.completed.length * EXPERIENCE.lesson +
    Object.keys(learnerProgress.typed).length * EXPERIENCE.typing;
  for (const lesson of COURSE.lessons) {
    if (learnerProgress.quizzes[lesson.id] === lesson.quiz.correct) points += EXPERIENCE.quiz;
  }
  return points;
}

/** Describe the current level and how far the learner is from the next one. */
function levelInfo() {
  const points = experiencePoints();
  const names = COURSE.motivation.levels;
  const index = Math.min(names.length - 1, Math.floor(points / EXPERIENCE.perLevel));
  const isLast = index === names.length - 1;
  return { points, number: index + 1, name: names[index], isLast,
    intoLevel: isLast ? EXPERIENCE.perLevel : points % EXPERIENCE.perLevel };
}

/** Evaluate every badge rule against the saved progress. */
function badgeList() {
  const streak = streakInfo();
  const typedCount = Object.keys(learnerProgress.typed).length;
  let notedLessons = 0;
  for (const note of Object.values(learnerProgress.notes)) if (note.trim()) notedLessons += 1;
  const rules = {
    "first-typing": typedCount >= 1, "first-lesson": learnerProgress.completed.length >= 1,
    "streak-3": streak.longest >= 3, "streak-7": streak.longest >= 7, "typing-10": typedCount >= 10,
    "notes-5": notedLessons >= 5, halfway: learnerProgress.completed.length >= 16,
    graduate: learnerProgress.completed.length >= COURSE.lessons.length,
  };
  const badges = [];
  for (const [id, symbol, title, description] of COURSE.motivation.badges) {
    badges.push({ id, symbol, title, description, earned: rules[id] === true });
  }
  const [phaseSymbol, phaseTitle, phaseDescription] = COURSE.motivation.phaseBadge;
  COURSE.phases.forEach((phase, index) => {
    const lessons = COURSE.lessons.filter((lesson) => lesson.phase === index);
    badges.push({ id: "phase-" + index, symbol: phaseSymbol, title: phaseTitle.replace("{phase}", phase),
      description: phaseDescription, earned: lessons.every((lesson) => learnerProgress.completed.includes(lesson.id)) });
  });
  return badges;
}

/** List the identifiers of earned badges, to detect new ones after an action. */
function earnedBadgeIds() {
  return badgeList().filter((badge) => badge.earned).map((badge) => badge.id);
}

/** Show a short celebratory message that disappears on its own. */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 4200);
}

/** Celebrate each badge earned since the given snapshot. */
function announceNewBadges(previousIds) {
  for (const badge of badgeList()) {
    if (badge.earned && !previousIds.includes(badge.id)) {
      showToast(badge.symbol + " " + translate("badgeUnlocked") + " " + badge.title);
    }
  }
}

/** Summarise level, streak and next step at the top of the home page. */
function dashboardMarkup(upcoming) {
  const level = levelInfo();
  const streak = streakInfo();
  const percent = Math.round(level.intoLevel / EXPERIENCE.perLevel * 100);
  return '<section class="dashboard" aria-label="' + escapeHtml(translate("dashboard")) + '">' +
    '<div class="dash-card"><span class="dash-label">' + escapeHtml(translate("level")) + " " + level.number +
    '</span><strong>' + escapeHtml(level.name) + '</strong><div class="level-bar"><span style="width:' + percent +
    '%"></span></div><span class="dash-note">' + level.points + " XP" + (level.isLast ? "" : " · " +
    escapeHtml(translate("nextLevel").replace("{points}", EXPERIENCE.perLevel - level.intoLevel))) + "</span></div>" +
    '<div class="dash-card"><span class="dash-label">' + escapeHtml(translate("streak")) + '</span><strong>🔥 ' +
    streak.current + " " + escapeHtml(translate(streak.current === 1 ? "day" : "days")) + '</strong><span class="dash-note">' +
    escapeHtml(translate(streak.practisedToday ? "streakSafe" : streak.current ? "streakRisk" : "streakStart")) + "</span></div>" +
    '<a class="dash-card dash-next" href="#lesson-' + lessonNumber(upcoming.id) + '"><span class="dash-label">' +
    escapeHtml(translate("nextStep")) + "</span><strong>" + lessonNumber(upcoming.id) + " · " + escapeHtml(upcoming.title) +
    '</strong><span class="dash-note">' + escapeHtml(translate("nextStepNote")) + " →</span></a></section>";
}

/** Show every badge, dimming the ones that are still locked. */
function badgesMarkup() {
  let markup = '<ul class="badge-grid">';
  for (const badge of badgeList()) {
    markup += '<li class="badge' + (badge.earned ? " is-earned" : "") + '"><span class="badge-symbol" aria-hidden="true">' +
      (badge.earned ? badge.symbol : "🔒") + "</span><strong>" + escapeHtml(badge.title) + "</strong><span>" +
      escapeHtml(badge.description) + "</span></li>";
  }
  return markup + "</ul>";
}

/** Invite the learner to keep going right after finishing a lesson. */
function celebrationMarkup(lesson) {
  const following = COURSE.lessons.find((candidate) => candidate.id === lesson.id + 1);
  const streak = streakInfo();
  return '<div class="celebration"><strong>🎉 ' + escapeHtml(translate("lessonDone")) + "</strong><p>+" +
    EXPERIENCE.lesson + " XP · 🔥 " + streak.current + " " + escapeHtml(translate(streak.current === 1 ? "day" : "days")) +
    "</p>" + (following ? '<a class="primary" href="#lesson-' + lessonNumber(following.id) + '">' +
    escapeHtml(translate("keepGoing")) + " " + escapeHtml(following.title) + " →</a>" :
    '<a class="primary" href="#ideas">' + escapeHtml(translate("ideas")) + " →</a>") + "</div>";
}
