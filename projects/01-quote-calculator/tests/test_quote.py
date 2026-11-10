"""Protect quote boundaries and the documented half-up rounding rule."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from domain import calculate_quote


class QuoteTests(unittest.TestCase):
    """Verify independent monetary examples and invalid business inputs."""

    def test_known_totals(self) -> None:
        """Require known undiscounted, discounted, zero, and free-order results."""
        for arguments, expected in [
            ((1250, 2, 0), 2500), ((1250, 2, 10), 2250),
            ((1250, 0, 0), 0), ((1250, 2, 100), 0), ((1, 1, 50), 1),
        ]:
            with self.subTest(arguments=arguments):
                self.assertEqual(calculate_quote(*arguments), expected)

    def test_rejects_invalid_inputs(self) -> None:
        """Reject negatives and discounts outside the closed 0–100 interval."""
        for arguments in [(-1, 1, 0), (1, -1, 0), (1, 1, -1), (1, 1, 101)]:
            with self.subTest(arguments=arguments), self.assertRaises(ValueError):
                calculate_quote(*arguments)
