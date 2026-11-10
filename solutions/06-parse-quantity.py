"""Parse integer text; return None for invalid text or negative quantities."""


def parse_quantity(raw_quantity: str) -> int | None:
    """Parse integer text; return None for invalid text or negative quantities."""
    try:
        quantity = int(raw_quantity)
    except ValueError:
        return None
    return quantity if quantity >= 0 else None
