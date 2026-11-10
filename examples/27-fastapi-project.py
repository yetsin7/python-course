"""Describe a task payload before implementing its HTTP transport."""

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class Task:
    """Carry the fields exposed by a task response."""

    id: int
    title: str
    completed: bool = False


print(asdict(Task(1, "Review report")))
