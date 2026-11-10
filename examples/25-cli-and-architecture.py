"""Parse explicit arguments without reading global process arguments."""

import argparse

parser = argparse.ArgumentParser(add_help=False)
parser.add_argument("--quantity", type=int, required=True)
arguments = parser.parse_args(["--quantity", "4"])
print(arguments.quantity)
print(arguments.quantity * 125)
