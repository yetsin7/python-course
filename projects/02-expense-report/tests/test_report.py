"""Check report contracts and preservation of earlier output on invalid input."""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from report import create_report, summarize_expenses


class ReportTests(unittest.TestCase):
    """Use isolated sample files rather than learner or application records."""

    def test_sample_totals(self) -> None:
        """Require the delivered sample to total 2000 cents across three rows."""
        source = Path(__file__).resolve().parents[1] / "sample-expenses.csv"
        self.assertEqual(summarize_expenses(source), {
            "rows": 3, "total_cents": 2000, "categories": {"office": 1500, "travel": 500}})

    def test_invalid_input_preserves_output(self) -> None:
        """Reject malformed values before touching the prior report."""
        for contents in [
            "wrong,amount_cents\noffice,1\n", "category,amount_cents\noffice,-1\n",
            "category,amount_cents\noffice,abc\n", "category,amount_cents\n,1\n",
            "category,amount_cents\noffice\n", "category,amount_cents\noffice,1,extra\n",
        ]:
            with self.subTest(contents=contents), tempfile.TemporaryDirectory() as directory:
                source = Path(directory) / "source.csv"
                output = Path(directory) / "report.json"
                source.write_text(contents, encoding="utf-8")
                output.write_text("previous", encoding="utf-8")
                with self.assertRaises(ValueError):
                    create_report(source, output)
                self.assertEqual(output.read_text(encoding="utf-8"), "previous")

    def test_quoted_category_and_output(self) -> None:
        """Accept a comma inside a quoted field and write the exact summary."""
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.csv"
            output = Path(directory) / "report.json"
            source.write_text('category,amount_cents\n"office,home",25\n', encoding="utf-8")
            summary = create_report(source, output)
            self.assertEqual(summary["categories"], {"office,home": 25})
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), summary)
