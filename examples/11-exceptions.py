"""Recover only from a known conversion failure."""

raw_quantity = "three"
try:
    quantity = int(raw_quantity)
except ValueError:
    quantity = None
print(quantity)

try:
    quantity = int("3")
except ValueError:
    quantity = None
print(quantity)
