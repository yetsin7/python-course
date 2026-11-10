"""Verify HTTP contracts using temporary databases and no public listener."""

import sys
import os
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
with tempfile.TemporaryDirectory() as import_directory:
    previous_path = os.environ.get("TASK_DATABASE_PATH")
    os.environ["TASK_DATABASE_PATH"] = str(Path(import_directory) / "import.sqlite3")
    try:
        from application import create_app
    finally:
        if previous_path is None:
            os.environ.pop("TASK_DATABASE_PATH", None)
        else:
            os.environ["TASK_DATABASE_PATH"] = previous_path


class ApiTests(unittest.TestCase):
    """Give every test a fresh database separate from normal-use records."""

    def setUp(self) -> None:
        """Create a private directory and client for the next test."""
        self.directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.directory.name) / "tasks.sqlite3"
        self.client = TestClient(create_app(self.database_path))

    def tearDown(self) -> None:
        """Close the client and remove only this test's temporary directory."""
        self.client.close()
        self.directory.cleanup()

    def test_health(self) -> None:
        """Require a documented liveness response from the HTTP layer."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_creation_and_idempotent_completion(self) -> None:
        """Preserve trimmed titles and allow completion to be repeated safely."""
        response = self.client.post("/tasks", json={"title": "  Review report  "})
        self.assertEqual(response.status_code, 201)
        task = response.json()
        self.assertEqual(task["title"], "Review report")
        self.assertIs(task["completed"], False)
        for attempt in range(2):
            with self.subTest(attempt=attempt):
                completed = self.client.patch(f"/tasks/{task['id']}/complete")
                self.assertEqual(completed.status_code, 200)
                self.assertIs(completed.json()["completed"], True)

    def test_invalid_payloads_do_not_insert(self) -> None:
        """Reject missing, blank, excessive, non-string and unknown fields."""
        for payload in [
            {}, {"title": ""}, {"title": "   "}, {"title": "x" * 121},
            {"title": 3}, {"title": "Allowed", "owner_id": 4},
        ]:
            with self.subTest(payload=payload):
                self.assertEqual(self.client.post("/tasks", json=payload).status_code, 422)
        self.assertEqual(self.client.get("/tasks").json(), [])

    def test_title_upper_boundary(self) -> None:
        """Accept the inclusive 120-character title boundary."""
        response = self.client.post("/tasks", json={"title": "x" * 120})
        self.assertEqual(response.status_code, 201)

    def test_missing_identifier(self) -> None:
        """Translate an absent resource to a stable 404 rather than creating a row."""
        response = self.client.patch("/tasks/999/complete")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "task_not_found")
        self.assertEqual(self.client.get("/tasks").json(), [])

    def test_ordered_pagination_and_boundaries(self) -> None:
        """Verify offset behavior and reject invalid limit, offset and path ids."""
        for title in ["First", "Second", "Third"]:
            self.client.post("/tasks", json={"title": title})
        response = self.client.get("/tasks?limit=1&offset=1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([task["title"] for task in response.json()], ["Second"])
        for query in ["limit=0", "limit=101", "offset=-1"]:
            with self.subTest(query=query):
                self.assertEqual(self.client.get(f"/tasks?{query}").status_code, 422)
        self.assertEqual(self.client.patch("/tasks/0/complete").status_code, 422)

    def test_persistence_between_application_instances(self) -> None:
        """Require a second application to recover the first application's record."""
        created = self.client.post("/tasks", json={"title": "Persistent"}).json()
        with TestClient(create_app(self.database_path)) as reopened:
            self.assertEqual(reopened.get("/tasks").json(), [created])

    def test_sql_looking_title_remains_literal(self) -> None:
        """Protect literal storage of a title containing quotes and SQL punctuation."""
        title = "Review'; DROP TABLE tasks; --"
        response = self.client.post("/tasks", json={"title": title})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get("/tasks").json()[0]["title"], title)
