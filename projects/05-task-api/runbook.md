# Local API runbook

This reference has no authentication and must be accessed only through a
loopback interface during study. It uses a single SQLite file and synchronous
storage operations. Production requires identity, resource authorization,
HTTPS, limits, monitoring, persistent storage, and a tested recovery plan.

## Start and check

Run from this project's directory:

```powershell
build/api-env/Scripts/python.exe -m uvicorn application:app --host 127.0.0.1 --port 8017
Invoke-RestMethod http://127.0.0.1:8017/health
```

The health response proves process liveness, not database integrity. Check
create/list/complete against sample records to verify those operations.
Stop the server with Ctrl+C.

Default storage is anchored to this project's `build/tasks.sqlite3`.
For an isolated sample instance, set `$env:TASK_DATABASE_PATH` to another
absolute path within your own project's `build/`. Remove that variable
after the session with `Remove-Item Env:TASK_DATABASE_PATH`.

## Diagnose

Record interpreter, locked dependency versions, command, HTTP status,
and the smallest reproducible sample. Do not log secrets or private task titles.
An occupied port is different from a failed database operation.
Do not reset the database to conceal an error.

## Backup and restore lab

Stop the teaching server before this simple filesystem-copy exercise.
Copy only your sample database to `build/tasks-backup.sqlite3` using
`Copy-Item -LiteralPath build/tasks.sqlite3 -Destination build/tasks-backup.sqlite3`.
Do not overwrite your sole existing backup. For a live SQLite database use
SQLite's backup API, demonstrated in project 03, instead of copying a file
that may have active journal sidecars.

Copy the backup to a separate `build/tasks-restored.sqlite3`, select it
with `TASK_DATABASE_PATH`, start the server, and compare rows and completion
states with your recorded sample. A successful copy without a verified read
is not evidence of recovery.

## Change and rollback lab

Record the current commit and dependency lock. Back up and verify sample data.
Introduce a schema change with a versioned migration and regression tests.
If rollback requires an older schema, demonstrate the migration or verified
restore procedure on the isolated sample before attempting any real change.
Restart the previous code version with compatible data and run the smoke flow.

## Optional container lab

The Dockerfile is provided as an unverified extension; Docker was not required
for the course validation. Build from this project, bind the host port only
to loopback (`-p 127.0.0.1:8017:8017`), and mount a persistent directory
at `/app/build`. The container's user has uid 10001; ensure that the mounted
directory is writable by it. Do not expose this unauthenticated reference
publicly. Pin an image digest and verify the platform, dependencies, storage,
security, and restoration before using a container for a real release.
