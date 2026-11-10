"""Calculate integer-cent quotes with an explicit decimal rounding rule."""

from decimal import Decimal, ROUND_HALF_UP


def calculate_quote(price_cents: int, quantity: int, discount_percent: int = 0) -> int:
    """Return cents after a 0–100 integer discount, rounding half cents upward."""
    if price_cents < 0 or quantity < 0 or not 0 <= discount_percent <= 100:
        raise ValueError("Price, quantity, or discount is outside its permitted range.")
    subtotal = Decimal(price_cents * quantity)
    discounted_total = subtotal * (Decimal(100 - discount_percent) / 100)
    return int(discounted_total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
