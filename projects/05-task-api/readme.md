# 05-task-api

This is an independent teaching reference. Build your own attempt before
consulting it. The Spanish specification, milestones, and acceptance criteria
are available in the offline reader's Projects view.

## Run

For projects 01–04, run these commands from the course root:

```powershell
Set-Location projects/05-task-api
python -m venv build/api-env
build/api-env/Scripts/python.exe -m pip install -r requirements-lock.txt
build/api-env/Scripts/python.exe -m pip check
build/api-env/Scripts/python.exe -m unittest discover -s tests -p 'test_*.py' -v
build/api-env/Scripts/python.exe -m uvicorn application:app --host 127.0.0.1 --port 8017
```

For project 05, the first command changes to this project. Create its environment,
install the lock and run tests before launching Uvicorn. See runbook.md for
storage, backup and the optional container lab. The reference has no user
authentication; keep the listener on 127.0.0.1.

## Study

Source identifiers, docstrings and technical messages use English. Learner-facing
CLI text lives in locales/es.json. Printed JSON field names are machine-readable
contracts. Tests use temporary sample directories and never the learner's normal
working database.

Reference implementations favor a small, readable scope. They do not implement
all real-world requirements such as multiple currencies, multiuser authorization,
concurrent report writers or a complete schema migration system. The reader's
extensions describe how to practice those requirements deliberately.
