"""Read a customer name and integer quantity before calculating an order."""

customer_name = input()
quantity_text = input()
quantity = int(quantity_text)
unit_price = 12
print(customer_name)
print(quantity * unit_price)
