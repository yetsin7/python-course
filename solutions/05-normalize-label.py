"""Trim outer whitespace and casefold a label while preserving inner spaces."""


def normalize_label(label: str) -> str:
    """Trim outer whitespace and casefold a label while preserving inner spaces."""
    return label.strip().casefold()
