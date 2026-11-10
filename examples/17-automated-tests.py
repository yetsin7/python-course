"""Execute a minimal contract test without external packages."""

import io
import unittest


def calculate_total(price_cents: int, quantity: int) -> int:
    """Return the line amount for already validated nonnegative inputs."""
    return price_cents * quantity


class TotalContractTests(unittest.TestCase):
    """Protect an independently specified line-total example."""

    def test_calculates_known_total(self) -> None:
        """Require four units at 125 cents to produce 500 cents."""
        self.assertEqual(calculate_total(125, 4), 500)


suite = unittest.defaultTestLoader.loadTestsFromTestCase(TotalContractTests)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun)
print(result.wasSuccessful())
