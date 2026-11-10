"""Return remaining stock; reject negative values or an unavailable quantity."""


def reserve_stock(stock: int, quantity: int) -> int:
    """Return remaining stock; reject negative values or an unavailable quantity."""
    if stock < 0 or quantity < 0 or quantity > stock:
        raise ValueError("Stock and quantity must be nonnegative and available.")
    return stock - quantity
