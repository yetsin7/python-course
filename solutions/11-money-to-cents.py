"""Convert finite nonnegative decimal text to exact cents; reject fractional cents."""

from decimal import Decimal, InvalidOperation


def money_to_cents(raw_amount: str) -> int:
    """Convert finite nonnegative decimal text to exact cents; reject fractional cents."""
    try:
        amount = Decimal(raw_amount)
        if not amount.is_finite() or amount < 0:
            raise ValueError("Amount must be finite and nonnegative.")
        cents = amount * 100
        if cents != cents.to_integral_value():
            raise ValueError("Fractional cents are not supported.")
        return int(cents)
    except InvalidOperation as error:
        raise ValueError("Amount must be decimal text.") from error
