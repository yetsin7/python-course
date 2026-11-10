"""Accumulate a sequence and demonstrate a terminating countdown."""

total = 0
for current_number in range(1, 6):
    total += current_number
print(total)

remaining_attempts = 3
while remaining_attempts > 0:
    print(remaining_attempts)
    remaining_attempts -= 1
