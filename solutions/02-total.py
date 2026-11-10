"""Return a line total in cents; reject a negative price or quantity."""


def calculate_total(unit_price_cents: int, quantity: int) -> int:
    """Return a line total in cents; reject a negative price or quantity."""
    if unit_price_cents < 0 or quantity < 0:
        raise ValueError("Price and quantity must be nonnegative.")
    return unit_price_cents * quantity
