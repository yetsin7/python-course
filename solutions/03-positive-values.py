"""Return positive values in input order without mutating the input."""


def positive_values(values: list[int]) -> list[int]:
    """Return positive values in input order without mutating the input."""
    return [value for value in values if value > 0]
