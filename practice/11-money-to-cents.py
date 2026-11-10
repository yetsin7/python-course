"""Convert finite nonnegative decimal text to exact cents; reject fractional cents."""

from decimal import Decimal, InvalidOperation


def money_to_cents(raw_amount: str) -> int:
    """Convert finite nonnegative decimal text to exact cents; reject fractional cents."""
    raise NotImplementedError("Complete this exercise before checking it.")
