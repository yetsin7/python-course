"""Select an order discount from an inclusive business threshold."""

subtotal = 100
if subtotal >= 100:
    discount_rate = 0.10
else:
    discount_rate = 0.0
print(subtotal * (1 - discount_rate))
print(1 <= 3 <= 10)
