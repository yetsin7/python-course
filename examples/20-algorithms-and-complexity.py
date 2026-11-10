"""Deduplicate product codes while preserving first appearance."""


def unique_codes(codes: list[str]) -> list[str]:
    """Return first occurrences using a set only for membership checks."""
    seen = set()
    result = []
    for code in codes:
        if code not in seen:
            seen.add(code)
            result.append(code)
    return result


print(unique_codes(["B", "A", "B", "C", "A"]))
print(unique_codes([]))
