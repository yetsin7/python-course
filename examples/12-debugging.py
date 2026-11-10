"""Compute an average with an explicit policy for an empty collection."""


def calculate_average(values: list[int]) -> float:
    """Return the arithmetic mean; reject empty input instead of inventing a value."""
    if not values:
        raise ValueError("At least one value is required.")
    return sum(values) / len(values)


print(calculate_average([10, 20]))
print(calculate_average([10, 20, 30]))
