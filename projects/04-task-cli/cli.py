"""Present localized task commands over a reusable repository."""

import argparse
import json
import sqlite3
from dataclasses import asdict
from pathlib import Path

from domain import TaskNotFoundError
from storage import TaskRepository

ROOT = Path(__file__).resolve().parent


def main() -> int:
    """Execute one command and preserve a nonzero status for known failures."""
    messages = json.loads((ROOT / "locales/es.json").read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=messages["description"])
    parser.add_argument("--database", type=Path, default=ROOT / "build/tasks.sqlite3", help=messages["database_help"])
    commands = parser.add_subparsers(dest="command", required=True)
    add_parser = commands.add_parser("add", help=messages["add_help"])
    add_parser.add_argument("--title", required=True, help=messages["title_help"])
    list_parser = commands.add_parser("list", help=messages["list_help"])
    list_parser.add_argument("--limit", type=int, default=20, help=messages["limit_help"])
    list_parser.add_argument("--offset", type=int, default=0, help=messages["offset_help"])
    complete_parser = commands.add_parser("complete", help=messages["complete_help"])
    complete_parser.add_argument("--id", type=int, required=True, help=messages["id_help"])
    arguments = parser.parse_args()
    try:
        repository = TaskRepository(arguments.database)
        if arguments.command == "add":
            task = repository.create(arguments.title)
            print(messages["created"].format(identifier=task.id))
        elif arguments.command == "list":
            print(json.dumps([asdict(task) for task in repository.list_tasks(arguments.limit, arguments.offset)]))
        else:
            task = repository.complete(arguments.id)
            print(messages["completed"].format(identifier=task.id))
    except TaskNotFoundError:
        print(messages["not_found"])
        return 1
    except (ValueError, OSError, sqlite3.Error):
        print(messages["invalid"])
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
