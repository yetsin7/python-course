"""Trim a title and require 1–120 characters; preserve its letter case."""


def validate_title(title: str) -> str:
    """Trim a title and require 1–120 characters; preserve its letter case."""
    normalized_title = title.strip()
    if not 1 <= len(normalized_title) <= 120:
        raise ValueError("Title length must be between 1 and 120 characters.")
    return normalized_title
