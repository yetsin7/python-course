"""Check persisted records, rejected transitions and backup recovery."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from storage import ExpenseLedger


class LedgerTests(unittest.TestCase):
    """Exercise real SQLite files isolated from learner work."""

    def test_reopen_and_restore(self) -> None:
        """Require reopening and a backup to retain rows and the 1700-cent total."""
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "ledger.sqlite3"
            backup = Path(directory) / "backup.sqlite3"
            ledger = ExpenseLedger(source)
            ledger.add("office", 1200)
            ledger.add("travel", 500)
            self.assertEqual(ExpenseLedger(source).total_cents(), 1700)
            ledger.backup(backup)
            restored = ExpenseLedger(backup)
            self.assertEqual(restored.list_expenses(), ledger.list_expenses())
            self.assertEqual(restored.total_cents(), 1700)

    def test_invalid_records_leave_total_unchanged(self) -> None:
        """Reject invalid fields without inserting partial records."""
        with tempfile.TemporaryDirectory() as directory:
            ledger = ExpenseLedger(Path(directory) / "ledger.sqlite3")
            ledger.add("office", 100)
            for category, amount in [("", 1), ("  ", 1), ("office", -1)]:
                with self.subTest(category=category, amount=amount), self.assertRaises(ValueError):
                    ledger.add(category, amount)
            self.assertEqual(ledger.total_cents(), 100)
            self.assertEqual(len(ledger.list_expenses()), 1)

    def test_backup_rejects_source_path(self) -> None:
        """Prevent accidentally using the source database as its own backup."""
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "ledger.sqlite3"
            ledger = ExpenseLedger(source)
            with self.assertRaises(ValueError):
                ledger.backup(source)

    def test_backup_preserves_existing_destination(self) -> None:
        """Reject an existing backup destination without changing its recorded expenses."""
        with tempfile.TemporaryDirectory() as directory:
            source = ExpenseLedger(Path(directory) / "source.sqlite3")
            destination = Path(directory) / "backup.sqlite3"
            backup = ExpenseLedger(destination)
            backup.add("preserved", 250)
            with self.assertRaises(FileExistsError):
                source.backup(destination)
            self.assertEqual(ExpenseLedger(destination).total_cents(), 250)
