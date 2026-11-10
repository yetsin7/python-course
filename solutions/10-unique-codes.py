"""Return first occurrences in original order without changing the input."""


def unique_codes(codes: list[str]) -> list[str]:
    """Return first occurrences in original order without changing the input."""
    seen = set()
    result = []
    for code in codes:
        if code not in seen:
            seen.add(code)
            result.append(code)
    return result
