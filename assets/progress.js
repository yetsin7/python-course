/** Persist only validated learner state and provide portable backups. */
"use strict";
const COURSE = window.COURSE_CONTENT;
const STORAGE_KEY = "python-programming-course-v1";

/** Construct independent empty progress records for a new learner. */
function emptyProgress() {
  return { version: 1, completed: [], notes: {}, checks: {}, quizzes: {}, drafts: {}, lastLesson: null };
}

/** Reject incompatible backups, excessive notes and unknown lesson identifiers. */
function validateProgress(candidate) {
  if (!candidate || candidate.version !== 1 || !Array.isArray(candidate.completed)) {
    throw new Error("Unsupported progress document.");
  }
  const validIds = new Set();
  for (const lesson of COURSE.lessons) validIds.add(String(lesson.id));
  const result = emptyProgress();
  for (const identifier of candidate.completed) {
    if (!Number.isInteger(identifier) || !validIds.has(String(identifier))) {
      throw new Error("Unknown completed lesson identifier.");
    }
    if (!result.completed.includes(identifier)) result.completed.push(identifier);
  }
  for (const field of ["notes", "checks", "quizzes", "drafts"]) {
    const records = candidate[field] || {};
    if (typeof records !== "object" || Array.isArray(records)) throw new Error("Invalid progress fields.");
    for (const [identifier, value] of Object.entries(records)) {
      if (!validIds.has(identifier)) throw new Error("Unknown lesson identifier.");
      if (field === "notes") {
        if (typeof value !== "string" || value.length > 10000) throw new Error("Invalid note size.");
      } else if (field === "drafts") {
        if (typeof value !== "string" || value.length > 20000) throw new Error("Invalid draft size.");
      } else if (field === "checks") {
        if (!Array.isArray(value) || value.length !== 3) throw new Error("Invalid mastery checklist.");
        for (const checked of value) if (typeof checked !== "boolean") throw new Error("Invalid checklist value.");
      } else if (!Number.isInteger(value) || value < 0 || value > 2) {
        throw new Error("Invalid quiz selection.");
      }
      result[field][identifier] = value;
    }
  }
  if (Number.isInteger(candidate.lastLesson) && validIds.has(String(candidate.lastLesson))) {
    result.lastLesson = candidate.lastLesson;
  }
  return result;
}

/** Recover safe stored progress, retaining a flag when browser persistence is unavailable. */
function readProgress() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    return serialized ? validateProgress(JSON.parse(serialized)) : emptyProgress();
  } catch (error) {
    console.warn("Stored progress could not be read.", error);
    return emptyProgress();
  }
}

let learnerProgress = readProgress();

/** Translate an interface key from the selected learner locale. */
function translate(key) {
  return COURSE.ui[key] || key;
}

/** Announce user-facing outcomes without interrupting the current reading position. */
function announce(message) {
  document.getElementById("status-message").textContent = message;
}

/** Save current progress and keep export usable when the browser denies local storage. */
function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learnerProgress));
    return true;
  } catch (error) {
    console.warn("Browser progress storage is unavailable.", error);
    announce(translate("storageError"));
    return false;
  }
}

/** Download learner state without relying on clipboard or network permissions. */
function exportProgress() {
  const blob = new Blob([JSON.stringify(learnerProgress, null, 2)], { type: "application/json" });
  const address = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = address;
  anchor.download = translate("downloadName");
  anchor.click();
  /** Release the download URL after the browser has had a chance to consume it. */
  function releaseDownload() { URL.revokeObjectURL(address); }
  setTimeout(releaseDownload, 1000);
}

/** Import a bounded backup after validation, preserving current state on any failure. */
async function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 2000000) throw new Error("Progress document exceeds the size limit.");
    const restored = validateProgress(JSON.parse(await file.text()));
    learnerProgress = restored;
    const persisted = saveProgress();
    renderApplication();
    announce(translate(persisted ? "importSuccess" : "storageError"));
  } catch (error) {
    console.warn("Progress import failed.", error);
    announce(translate("importError"));
  }
  event.target.value = "";
}
