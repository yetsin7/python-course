"""Return 0 cents for orders of at least 10000 cents, otherwise 1500; reject negatives."""


def shipping_cost(subtotal_cents: int) -> int:
    """Return 0 cents for orders of at least 10000 cents, otherwise 1500; reject negatives."""
    if subtotal_cents < 0:
        raise ValueError("Subtotal must be nonnegative.")
    return 0 if subtotal_cents >= 10000 else 1500
