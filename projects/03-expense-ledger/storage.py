"""Persist integer-cent expenses and copy them with SQLite's backup API."""

import sqlite3
from contextlib import closing
from pathlib import Path


class ExpenseLedger:
    """Own expense persistence without depending on a terminal interface."""

    def __init__(self, database_path: Path) -> None:
        """Create the parent directory and initialize a constrained expense table."""
        self.database_path = database_path
        database_path.parent.mkdir(parents=True, exist_ok=True)
        with closing(sqlite3.connect(database_path)) as connection, connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS expenses ("
                "id INTEGER PRIMARY KEY, category TEXT NOT NULL CHECK(length(trim(category)) > 0), "
                "amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0))")

    def add(self, category: str, amount_cents: int) -> int:
        """Insert a valid expense atomically and return its generated identifier."""
        category = category.strip()
        if not category or amount_cents < 0:
            raise ValueError("Category must be nonempty and amount nonnegative.")
        with closing(sqlite3.connect(self.database_path)) as connection, connection:
            cursor = connection.execute(
                "INSERT INTO expenses (category, amount_cents) VALUES (?, ?)", (category, amount_cents))
            return cursor.lastrowid

    def list_expenses(self) -> list[dict]:
        """Return recorded expenses ordered by identifier without modifying state."""
        with closing(sqlite3.connect(self.database_path)) as connection:
            connection.row_factory = sqlite3.Row
            return [dict(row) for row in connection.execute("SELECT * FROM expenses ORDER BY id")]

    def total_cents(self) -> int:
        """Return the total in the ledger's single assumed currency, including zero."""
        with closing(sqlite3.connect(self.database_path)) as connection:
            return connection.execute("SELECT COALESCE(SUM(amount_cents), 0) FROM expenses").fetchone()[0]

    def backup(self, destination_path: Path) -> None:
        """Create a consistent backup without overwriting the source or an existing backup."""
        if destination_path.resolve() == self.database_path.resolve():
            raise ValueError("Backup destination must differ from the source.")
        if destination_path.exists():
            raise FileExistsError("Backup destination already exists.")
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        with closing(sqlite3.connect(self.database_path)) as source:
            with closing(sqlite3.connect(destination_path)) as destination:
                source.backup(destination)
