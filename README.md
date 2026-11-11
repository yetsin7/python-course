# Python Course

A self-contained Spanish-language Python course for teenagers and adults who
are starting from zero. It includes 32 lessons, runnable examples, guided
practice, five reference projects, progress tracking, and an offline learning
interface.

## Open the course

Open `index.html` in a browser. The interface works without an application
server, account, or network connection. Learner progress is stored locally in
the browser and can be exported or imported from the interface.

Start with the "Empieza aquí" page. It explains how to install Python, work
with files and folders, use the required keyboard symbols, and run a first
program with IDLE.

## How the course keeps learners practising

- **Typing drill.** Every lesson asks the learner to type its code fragment by
  hand. Each line is checked as it is typed, pasting is disabled, and code in
  the interface cannot be selected or copied. The drill is required to complete
  a lesson.
- **Keyboard help per fragment.** Only the symbols that appear in the fragment
  are listed, each with its Alt code (for example `\` is Alt + 92) and its key
  combination on Spanish keyboards. Sources: `locales/es/keyboard.json`.
- **Motivation.** Experience points, levels, a daily practice streak, and
  badges are derived from saved progress. Sources: `assets/motivation.js` and
  `locales/es/motivation.json`.
- **Ideas workshop.** The "Taller de ideas" page gives a repeatable method and
  staged project ideas so learners can build their own tools. Source:
  `locales/es/project-ideas.json`.

Copy protection is a learning nudge, not a security feature: the example files
remain readable in this repository.

## Repository layout

```text
python-course/
├── index.html       Offline learning interface
├── assets/          Interface code, styles, and generated course bundle
├── locales/es/      Spanish lesson, project, and guide sources
├── examples/        One runnable program per lesson
├── practice/        Starter files for checkable exercises
├── solutions/       Reference solutions
├── projects/        Five reference projects with tests
└── scripts/         Build and verification tools
```

## Development

After editing files under `locales/es/`, rebuild the browser bundle:

```powershell
python scripts/build-course.py
```

Run all checks before publishing:

```powershell
pnpm install
pnpm check
```

The verification tool runs all 32 examples and compares their exact output,
checks the beginner materials, validates authored file conventions, requires
Python function documentation, and runs the reference project tests. It writes
its report to `build/verification.json`.

Learner-facing content is localized in Spanish. Code identifiers, technical
diagnostics, and implementation documentation remain in English.
