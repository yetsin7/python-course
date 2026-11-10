"""Generate a localized CSV summary using project-anchored default paths."""

import argparse
import json
from pathlib import Path

from report import create_report

ROOT = Path(__file__).resolve().parent


def main() -> int:
    """Create a report and report failure without replacing a validated prior result."""
    messages = json.loads((ROOT / "locales/es.json").read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=messages["description"])
    parser.add_argument("--source", type=Path, default=ROOT / "sample-expenses.csv", help=messages["source_help"])
    parser.add_argument("--output", type=Path, default=ROOT / "build/report.json", help=messages["output_help"])
    arguments = parser.parse_args()
    try:
        summary = create_report(arguments.source, arguments.output)
    except (ValueError, OSError):
        print(messages["invalid"])
        return 1
    print(messages["result"].format(rows=summary["rows"], total=summary["total_cents"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
