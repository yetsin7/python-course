"""Present a localized command interface for quote calculations."""

import argparse
import json
from pathlib import Path

from domain import calculate_quote


def main() -> int:
    """Read integer arguments and present a localized result or validation failure."""
    messages = json.loads((Path(__file__).parent / "locales/es.json").read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=messages["description"])
    parser.add_argument("--price-cents", type=int, required=True, help=messages["price_help"])
    parser.add_argument("--quantity", type=int, required=True, help=messages["quantity_help"])
    parser.add_argument("--discount-percent", type=int, default=0, help=messages["discount_help"])
    arguments = parser.parse_args()
    try:
        total_cents = calculate_quote(arguments.price_cents, arguments.quantity, arguments.discount_percent)
    except ValueError:
        print(messages["invalid"])
        return 1
    print(messages["total"].format(total_cents=total_cents))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
