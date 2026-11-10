# 01-quote-calculator

This is an independent teaching reference. Build your own attempt before
consulting it. The Spanish specification, milestones, and acceptance criteria
are available in the offline reader's Projects view.

## Run

For projects 01–04, run these commands from the course root:

```powershell
python projects/01-quote-calculator/cli.py --price-cents 1250 --quantity 2 --discount-percent 10
python -m unittest discover -s projects/01-quote-calculator/tests -p 'test_*.py' -v
```

Default generated files, when applicable, remain inside this project's build/
directory. Explicit --database or --output paths are caller-selected practice
paths; keep them inside the project you own.

## Study

Source identifiers, docstrings and technical messages use English. Learner-facing
CLI text lives in locales/es.json. Printed JSON field names are machine-readable
contracts. Tests use temporary sample directories and never the learner's normal
working database.

Reference implementations favor a small, readable scope. They do not implement
all real-world requirements such as multiple currencies, multiuser authorization,
concurrent report writers or a complete schema migration system. The reader's
extensions describe how to practice those requirements deliberately.
