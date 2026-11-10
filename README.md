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
