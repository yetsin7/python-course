"""Calculate a small order using explicit quantities and derived values."""

quantity = 3
unit_price = 12
subtotal = quantity * unit_price
tax_rate = 0.10
total = subtotal + subtotal * tax_rate
print(subtotal)
print(total)
print(type(quantity).__name__)
