"""Check an API-shaped contract using an independent expected value."""

response = {"status": 201, "body": {"id": 1, "title": "Review report", "completed": False}}
assert response["status"] == 201
assert response["body"]["completed"] is False
assert response["body"]["title"] == "Review report"
print(True)
