"""Expose a local teaching API with constrained schemas and isolated persistence."""

import os
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path as RoutePath, Query
from pydantic import BaseModel, ConfigDict, Field

from domain import TaskNotFoundError
from storage import TaskRepository

ROOT = Path(__file__).resolve().parent


class TaskPayload(BaseModel):
    """Accept only a trimmed nonempty title, rejecting unknown request fields."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    title: str = Field(strict=True, min_length=1, max_length=120)


class TaskResponse(BaseModel):
    """Document the stable fields returned for a persisted task."""

    id: int
    title: str
    completed: bool


def create_app(database_path: Path) -> FastAPI:
    """Build an application around a chosen database; this reference has no user authentication."""
    repository = TaskRepository(database_path)
    application = FastAPI(title="Teaching Task API", version="1.0.0")

    @application.get("/health")
    def health() -> dict[str, str]:
        """Expose process liveness; this endpoint does not test external dependencies."""
        return {"status": "ok"}

    @application.post("/tasks", status_code=201, response_model=TaskResponse)
    def create_task(payload: TaskPayload):
        """Validate and persist one task, returning its generated identifier."""
        return repository.create(payload.title)

    @application.get("/tasks", response_model=list[TaskResponse])
    def list_tasks(
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        offset: Annotated[int, Query(ge=0)] = 0,
    ):
        """Return a bounded page ordered by id without changing task state."""
        return repository.list_tasks(limit, offset)

    @application.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
    def complete_task(task_id: Annotated[int, RoutePath(ge=1)]):
        """Complete an existing task idempotently or return a stable 404 error code."""
        try:
            return repository.complete(task_id)
        except TaskNotFoundError as error:
            raise HTTPException(status_code=404, detail="task_not_found") from error

    return application


app = create_app(Path(os.environ.get("TASK_DATABASE_PATH", str(ROOT / "build/tasks.sqlite3"))))
