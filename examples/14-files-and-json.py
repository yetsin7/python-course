"""Round-trip a JSON document inside the course-owned build directory."""

import json
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
lab_directory = project_root / "build" / "labs"
lab_directory.mkdir(parents=True, exist_ok=True)
record_path = lab_directory / "sample-order.json"
order = {"version": 1, "quantity": 3, "price_cents": 1200}
record_path.write_text(json.dumps(order), encoding="utf-8")
restored_order = json.loads(record_path.read_text(encoding="utf-8"))
print(restored_order == order)
print(restored_order["quantity"])
