# 03-expense-ledger

This is an independent teaching reference. Build your own attempt before
consulting it. The Spanish specification, milestones, and acceptance criteria
are available in the offline reader's Projects view.

## Run

For projects 01–04, run these commands from the course root:

```powershell
python projects/03-expense-ledger/cli.py add --category office --amount-cents 1200
python projects/03-expense-ledger/cli.py list
python projects/03-expense-ledger/cli.py total
python projects/03-expense-ledger/cli.py backup
python -m unittest discover -s projects/03-expense-ledger/tests -p 'test_*.py' -v
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
