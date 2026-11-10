"""Reject boundary values that violate a constrained title contract."""


def validate_title(title: str) -> str:
    """Return a trimmed title of 1–120 characters or raise ValueError."""
    normalized_title = title.strip()
    if not 1 <= len(normalized_title) <= 120:
        raise ValueError("Title length must be between 1 and 120 characters.")
    return normalized_title


print(validate_title("  Review report  "))
try:
    validate_title("   ")
except ValueError:
    print(False)
