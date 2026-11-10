"""Validate CSV expenses before producing a separate atomic report file."""

import csv
import json
from pathlib import Path


def summarize_expenses(source_path: Path) -> dict:
    """Return integer-cent totals; fail on malformed headers or any invalid row."""
    totals_by_category = {}
    row_count = 0
    with source_path.open(encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        if reader.fieldnames != ["category", "amount_cents"]:
            raise ValueError("Expected category and amount_cents headers in that order.")
        for row_number, record in enumerate(reader, start=2):
            if None in record or not isinstance(record["category"], str):
                raise ValueError(f"Malformed CSV row {row_number}.")
            category = record["category"].strip()
            try:
                amount_cents = int(record["amount_cents"])
            except (ValueError, TypeError) as error:
                raise ValueError(f"Invalid amount at row {row_number}.") from error
            if not category or amount_cents < 0:
                raise ValueError(f"Invalid category or amount at row {row_number}.")
            totals_by_category[category] = totals_by_category.get(category, 0) + amount_cents
            row_count += 1
    return {
        "rows": row_count, "total_cents": sum(totals_by_category.values()),
        "categories": dict(sorted(totals_by_category.items())),
    }


def create_report(source_path: Path, destination_path: Path) -> dict:
    """Validate all rows before replacing a report; assume one writer per destination."""
    summary = summarize_expenses(source_path)
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    pending_path = destination_path.with_suffix(".pending")
    pending_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    pending_path.replace(destination_path)
    return summary
