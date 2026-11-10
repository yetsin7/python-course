"""Normalize a category for matching without mutating the original string."""

raw_category = "  OFFICE  "
normalized_category = raw_category.strip().casefold()
print(normalized_category)
print(raw_category == normalized_category)
words = "paper   and pen".split()
print(words)
print("-".join(words))
