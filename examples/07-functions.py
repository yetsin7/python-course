"""Define a reusable calculation with a documented business contract."""


def calculate_total(unit_price_cents: int, quantity: int) -> int:
    """Return a line total; reject negative price or quantity with ValueError."""
    if unit_price_cents < 0 or quantity < 0:
        raise ValueError("Price and quantity must be nonnegative.")
    return unit_price_cents * quantity


print(calculate_total(125, 4))
print(calculate_total(125, 0))
