"""Validate a minimal technical release manifest before delivery."""

manifest = {
    "python": "3.13",
    "dependency_lock": "requirements-lock.txt",
    "test_command": "python -m unittest discover -s tests -p 'test_*.py'",
    "host": "127.0.0.1",
}
required_fields = {"python", "dependency_lock", "test_command", "host"}
print(required_fields.issubset(manifest))
print(manifest["host"] == "127.0.0.1")
