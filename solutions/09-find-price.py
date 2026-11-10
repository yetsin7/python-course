"""Return recorded cents or None for an absent code without changing the input."""


def find_price(prices_by_code: dict[str, int], product_code: str) -> int | None:
    """Return recorded cents or None for an absent code without changing the input."""
    return prices_by_code.get(product_code)
