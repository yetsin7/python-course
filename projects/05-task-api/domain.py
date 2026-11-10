"""Define task state and an explicit missing-resource exception."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Task:
    """Expose an immutable snapshot of a persisted task."""

    id: int
    title: str
    completed: bool


class TaskNotFoundError(LookupError):
    """Indicate that a requested task identifier has no stored record."""
