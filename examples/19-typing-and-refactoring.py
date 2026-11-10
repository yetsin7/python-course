"""Represent missing lookup results without inventing a zero price."""


def find_price(prices_by_code: dict[str, int], product_code: str) -> int | None:
    """Return recorded cents for a code, or None when absent."""
    return prices_by_code.get(product_code)


print(find_price({"PEN": 125, "GIFT": 0}, "PEN"))
print(find_price({"PEN": 125, "GIFT": 0}, "GIFT"))
print(find_price({"PEN": 125}, "MISSING"))
