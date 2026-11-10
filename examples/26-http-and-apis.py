"""Model the JSON body of a successful resource creation response."""

import json

response_status = 201
response_body = {"id": 1, "title": "Review report", "completed": False}
serialized_body = json.dumps(response_body)
print(response_status)
print(json.loads(serialized_body)["completed"])
print(json.loads(serialized_body)["id"])
