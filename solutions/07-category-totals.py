"""Aggregate amount_cents by category without mutation; reject negative amounts."""


def category_totals(records: list[dict]) -> dict[str, int]:
    """Aggregate amount_cents by category without mutation; reject negative amounts."""
    totals_by_category = {}
    for record in records:
        amount_cents = record["amount_cents"]
        if amount_cents < 0:
            raise ValueError("Amount must be nonnegative.")
        category = record["category"]
        totals_by_category[category] = totals_by_category.get(category, 0) + amount_cents
    return totals_by_category
