"""Expose a localized expense ledger CLI with project-owned default storage."""

import argparse
import json
import sqlite3
from pathlib import Path

from storage import ExpenseLedger

ROOT = Path(__file__).resolve().parent


def main() -> int:
    """Run a ledger operation; validation or filesystem failures return a nonzero code."""
    messages = json.loads((ROOT / "locales/es.json").read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=messages["description"])
    parser.add_argument("--database", type=Path, default=ROOT / "build/expenses.sqlite3", help=messages["database_help"])
    commands = parser.add_subparsers(dest="command", required=True)
    add_parser = commands.add_parser("add", help=messages["add_help"])
    add_parser.add_argument("--category", required=True, help=messages["category_help"])
    add_parser.add_argument("--amount-cents", type=int, required=True, help=messages["amount_help"])
    commands.add_parser("list", help=messages["list_help"])
    commands.add_parser("total", help=messages["total_help"])
    commands.add_parser("backup", help=messages["backup_help"])
    arguments = parser.parse_args()
    try:
        ledger = ExpenseLedger(arguments.database)
        if arguments.command == "add":
            print(messages["added"].format(identifier=ledger.add(arguments.category, arguments.amount_cents)))
        elif arguments.command == "list":
            print(json.dumps(ledger.list_expenses(), ensure_ascii=False))
        elif arguments.command == "total":
            print(messages["total"].format(total=ledger.total_cents()))
        else:
            ledger.backup(ROOT / "build/expenses-backup.sqlite3")
            print(messages["backed_up"])
    except (ValueError, OSError, sqlite3.Error):
        print(messages["invalid"])
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
