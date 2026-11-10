"""Check learner exercise contracts or the separate reference solutions."""

import argparse
import copy
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES = {
    "01-shipping": ("shipping_cost", [
        ((0,), 1500), ((9999,), 1500), ((10000,), 0), ((10001,), 0), ((-1,), ValueError)]),
    "02-total": ("calculate_total", [
        ((125, 4), 500), ((0, 5), 0), ((125, 0), 0),
        ((-1, 2), ValueError), ((1, -1), ValueError)]),
    "03-positive-values": ("positive_values", [
        (([0, -2, 5, 3],), [5, 3]), (([],), []), (([-1, 0],), [])]),
    "04-word-counts": ("count_words", [
        ((["pen", "paper", "pen"],), {"pen": 2, "paper": 1}),
        (([],), {}), ((["A", "a"],), {"A": 1, "a": 1})]),
    "05-normalize-label": ("normalize_label", [
        (("  OFFICE  ",), "office"), (("Two Words",), "two words"),
        (("",), ""), (("Straße",), "strasse")]),
    "06-parse-quantity": ("parse_quantity", [
        (("4",), 4), (("0",), 0), (("-1",), None), (("three",), None),
        (("",), None), (("2.5",), None)]),
    "07-category-totals": ("category_totals", [
        (([{"category": "office", "amount_cents": 100},
           {"category": "office", "amount_cents": 50},
           {"category": "travel", "amount_cents": 20}],), {"office": 150, "travel": 20}),
        (([],), {}), (([{"category": "office", "amount_cents": -1}],), ValueError)]),
    "08-reserve-stock": ("reserve_stock", [
        ((5, 3), 2), ((5, 0), 5), ((5, 5), 0), ((5, 6), ValueError),
        ((-1, 0), ValueError), ((5, -1), ValueError)]),
    "09-find-price": ("find_price", [
        (({"PEN": 125, "GIFT": 0}, "PEN"), 125),
        (({"GIFT": 0}, "GIFT"), 0), (({}, "MISSING"), None)]),
    "10-unique-codes": ("unique_codes", [
        ((["B", "A", "B", "C", "A"],), ["B", "A", "C"]), (([],), []),
        ((["A", "A"],), ["A"])]),
    "11-money-to-cents": ("money_to_cents", [
        (("12.50",), 1250), (("0",), 0), (("0.01",), 1),
        (("-1",), ValueError), (("NaN",), ValueError), (("Infinity",), ValueError),
        (("abc",), ValueError), (("1.001",), ValueError)]),
    "12-validate-title": ("validate_title", [
        (("  Review report  ",), "Review report"), (("x" * 120,), "x" * 120),
        (("x" * 121,), ValueError), (("   ",), ValueError), (("",), ValueError)]),
}


def load_operation(directory: Path, slug: str, operation_name: str):
    """Load a standalone exercise file without adding learner paths to imports."""
    specification = importlib.util.spec_from_file_location("exercise", directory / f"{slug}.py")
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return getattr(module, operation_name)


def check_case(operation, arguments: tuple, expected) -> None:
    """Verify the result or exception and require input collections to stay intact."""
    original_arguments = copy.deepcopy(arguments)
    if isinstance(expected, type) and issubclass(expected, Exception):
        try:
            operation(*arguments)
        except expected:
            pass
        else:
            raise AssertionError(f"Expected {expected.__name__}.")
    else:
        actual = operation(*arguments)
        if actual != expected or type(actual) is not type(expected):
            raise AssertionError(f"Expected {expected!r}; received {actual!r}.")
    if arguments != original_arguments:
        raise AssertionError("Input arguments must not be mutated.")


def main() -> int:
    """Run selected contracts and return a nonzero exit code for incomplete exercises."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference", action="store_true", help="Check solutions instead of learner files.")
    parser.add_argument("--exercise", choices=[slug[:2] for slug in CASES], help="Check one exercise number.")
    options = parser.parse_args()
    directory = ROOT / ("solutions" if options.reference else "practice")
    passed_count = 0
    failed_count = 0
    for slug, (operation_name, scenarios) in CASES.items():
        if options.exercise and not slug.startswith(options.exercise):
            continue
        try:
            operation = load_operation(directory, slug, operation_name)
            for arguments, expected in scenarios:
                check_case(operation, copy.deepcopy(arguments), expected)
                passed_count += 1
            print(f"PASS {slug}")
        except Exception as error:
            failed_count += 1
            print(f"FAIL {slug}: {type(error).__name__}: {error}")
    print(f"Checked {passed_count} passing cases; {failed_count} failed exercises.")
    return 1 if failed_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
