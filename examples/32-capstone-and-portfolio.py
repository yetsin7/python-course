"""Check whether a sample portfolio contains the required evidence categories."""

required_evidence = {"requirements", "tests", "persistence", "security", "runbook", "demo"}
submitted_evidence = {"requirements", "tests", "persistence", "security", "runbook", "demo"}
print(sorted(required_evidence - submitted_evidence))
print(required_evidence.issubset(submitted_evidence))
