"""Persist task transitions with one short-lived SQLite connection per operation."""

import sqlite3
from contextlib import closing
from pathlib import Path

from domain import Task, TaskNotFoundError


class TaskRepository:
    """Provide reusable storage operations independent of HTTP and terminal output."""

    def __init__(self, database_path: Path) -> None:
        """Initialize project-owned storage with title and boolean constraints."""
        self.database_path = database_path
        database_path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self.connect()) as connection, connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, "
                "title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120), "
                "completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)))")

    def connect(self) -> sqlite3.Connection:
        """Open a fresh connection to avoid sharing mutable connections across requests."""
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        return connection

    def create(self, title: str) -> Task:
        """Persist a trimmed title of 1–120 characters or reject it before insertion."""
        title = title.strip()
        if not 1 <= len(title) <= 120:
            raise ValueError("Title length must be between 1 and 120 characters.")
        with closing(self.connect()) as connection, connection:
            cursor = connection.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
            return Task(cursor.lastrowid, title, False)

    def list_tasks(self, limit: int = 20, offset: int = 0) -> list[Task]:
        """Return an ordered page; require a 1–100 limit and nonnegative offset."""
        if not 1 <= limit <= 100 or offset < 0:
            raise ValueError("Pagination is outside its permitted range.")
        with closing(self.connect()) as connection:
            rows = connection.execute(
                "SELECT id, title, completed FROM tasks ORDER BY id LIMIT ? OFFSET ?", (limit, offset))
            return [Task(row["id"], row["title"], bool(row["completed"])) for row in rows]

    def complete(self, task_id: int) -> Task:
        """Complete an existing task idempotently; raise TaskNotFoundError if absent."""
        with closing(self.connect()) as connection, connection:
            cursor = connection.execute("UPDATE tasks SET completed = 1 WHERE id = ?", (task_id,))
            if cursor.rowcount == 0:
                raise TaskNotFoundError("Task identifier was not found.")
            row = connection.execute(
                "SELECT id, title, completed FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return Task(row["id"], row["title"], bool(row["completed"]))
