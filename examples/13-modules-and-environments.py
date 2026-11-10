"""Reuse standard-library operations through explicit module imports."""

import math
from statistics import mean

print(math.ceil(2.1))
print(mean([10, 20, 30]))
print(__name__ == "__main__")
