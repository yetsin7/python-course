/** Remember the most recently visited lesson and its reading position in this browser. */
function createCourseSession(storageKey, isLessonHash) {
  let savedSession = null;
  let restorePending = true;
  let saveTimer;

  /** Save only supported lesson routes, leaving the last lesson available from other pages. */
  function record() {
    if (restorePending || !isLessonHash(window.location.hash)) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ hash: window.location.hash, scroll: window.scrollY }));
    } catch (error) {
      console.warn("Course session could not be saved.", error);
    }
  }

  /** Restore a saved destination only when the URL does not specify one. */
  function prepare() {
    try {
      const candidate = JSON.parse(localStorage.getItem(storageKey));
      if (candidate && isLessonHash(candidate.hash) && Number.isFinite(candidate.scroll) && candidate.scroll >= 0) {
        savedSession = candidate;
        if (!window.location.hash) history.replaceState(null, "", candidate.hash);
      }
    } catch (error) {
      console.warn("Course session could not be read.", error);
    }
  }

  /** Restore the reading position after rendering and start tracking later changes. */
  function restore() {
    if (savedSession && savedSession.hash === window.location.hash) window.scrollTo(0, savedSession.scroll);
    restorePending = false;
    record();
  }

  /** Debounce scroll writes while retaining the final position on page exit. */
  function scheduleRecord() {
    if (restorePending) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(record, 200);
  }

  window.addEventListener("scroll", scheduleRecord, { passive: true });
  window.addEventListener("pagehide", record);
  return { prepare, restore, record };
}
