"""Compare binary floats and decimal text for monetary teaching values."""

from decimal import Decimal

print(0.1 + 0.2 == 0.3)
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
amount = Decimal("12.50")
print(int(amount * 100))
