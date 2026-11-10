"""Model a balance with explicit initial-state and transition rules."""

from dataclasses import dataclass


@dataclass
class Wallet:
    """Hold a nonnegative integer balance for a teaching example."""

    balance_cents: int

    def __post_init__(self) -> None:
        """Reject an invalid opening balance before use."""
        if self.balance_cents < 0:
            raise ValueError("Opening balance must be nonnegative.")

    def spend(self, amount_cents: int) -> int:
        """Subtract an affordable amount or leave the state unchanged."""
        if amount_cents < 0 or amount_cents > self.balance_cents:
            raise ValueError("Amount must be nonnegative and affordable.")
        self.balance_cents -= amount_cents
        return self.balance_cents


wallet = Wallet(1000)
print(wallet.spend(250))
print(wallet.balance_cents)
