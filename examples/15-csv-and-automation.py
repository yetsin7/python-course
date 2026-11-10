"""Parse a CSV sample and aggregate integer cents by category."""

import csv
from io import StringIO

source = StringIO("category,amount_cents\noffice,1200\ntravel,500\noffice,300\n")
totals_by_category = {}
for record in csv.DictReader(source):
    category = record["category"]
    amount_cents = int(record["amount_cents"])
    totals_by_category[category] = totals_by_category.get(category, 0) + amount_cents
print(totals_by_category)
print(sum(totals_by_category.values()))
