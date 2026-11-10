"""Protect storage behavior shared conceptually with the API project."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from domain import TaskNotFoundError
from storage import TaskRepository


class TaskTests(unittest.TestCase):
    """Use independent SQLite databases for state-transition contracts."""

    def test_reopen_complete_and_page(self) -> None:
        """Persist tasks, paginate deterministically and allow repeated completion."""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "tasks.sqlite3"
            repository = TaskRepository(path)
            first = repository.create("  First task  ")
            second = repository.create("Second task")
            self.assertEqual(first.title, "First task")
            self.assertEqual(repository.list_tasks(1, 1)[0].id, second.id)
            self.assertTrue(repository.complete(first.id).completed)
            self.assertTrue(repository.complete(first.id).completed)
            self.assertTrue(TaskRepository(path).list_tasks()[0].completed)

    def test_rejects_invalid_titles_and_missing_ids(self) -> None:
        """Reject invalid inputs without introducing records."""
        with tempfile.TemporaryDirectory() as directory:
            repository = TaskRepository(Path(directory) / "tasks.sqlite3")
            for title in ["", "  ", "x" * 121]:
                with self.subTest(title=title), self.assertRaises(ValueError):
                    repository.create(title)
            with self.assertRaises(TaskNotFoundError):
                repository.complete(999)
            self.assertEqual(repository.list_tasks(), [])

    def test_pagination_boundaries(self) -> None:
        """Reject invalid page sizes and offsets at the repository boundary."""
        with tempfile.TemporaryDirectory() as directory:
            repository = TaskRepository(Path(directory) / "tasks.sqlite3")
            for limit, offset in [(0, 0), (101, 0), (1, -1)]:
                with self.subTest(limit=limit, offset=offset), self.assertRaises(ValueError):
                    repository.list_tasks(limit, offset)
