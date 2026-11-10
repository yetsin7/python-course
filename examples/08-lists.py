"""Filter order prices while preserving the original collection."""

prices_cents = [500, 1500, 900, 2000]
selected_prices = []
for price_cents in prices_cents:
    if price_cents >= 1000:
        selected_prices.append(price_cents)
print(selected_prices)
print(sum(selected_prices))
print(prices_cents)
