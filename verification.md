# Delivery verification

Validated on Windows with Python 3.13.11 and Chrome.

- 32 authored lessons, 96 exercise prompts, 32 self-assessment questions,
  five project specifications and 32 glossary entries.
- All 32 runnable examples matched their documented output exactly.
- All 54 exercise reference cases passed; learner starter bodies remain
  intentionally incomplete and are never replaced by the checker.
- All 20 project test methods passed, including additional parameterized
  boundary cases, invalid inputs, persistence, backup recovery and HTTP contracts.
- API dependencies passed pip check and the API suite passed in a second,
  independently created project-local environment.
- A real loopback HTTP server passed health, create (201), list and complete.
  The verification server was stopped after the smoke check.
- The actual file-URL reader worked with external networking disabled.
  Browser checks covered all lesson and project routes, search, delayed answers,
  assessment gating, notes, export/import and malformed backups.
- Desktop (1440 × 1000) and mobile (390 × 844) screenshots were inspected.
  Browser checks found no document-level horizontal overflow or runtime errors.
- Browser storage denial preserved in-memory work and exposed an export reminder.
- Authored files were checked for size, filenames and Python function docstrings.
  The largest authored file has fewer than 400 lines.

Detailed evidence is in `build/verification.json`,
`build/qa/reader-verification.json` and the API project's
`build/http-smoke.json`. Browser screenshots are in `build/qa/`.

GitHub Actions, optional Docker execution, public hosting and multiuser
authentication are not validated delivery claims. Their learning steps and
required follow-up work are described in the course and API runbook.
