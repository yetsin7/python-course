"""Calculate a calendar interval and serialize an aware UTC instant."""

from datetime import date, datetime, timedelta, timezone

start_date = date.fromisoformat("2026-10-07")
due_date = start_date + timedelta(days=7)
print(due_date.isoformat())
print((due_date - start_date).days)
recorded_at = datetime(2026, 10, 7, 12, 0, tzinfo=timezone.utc)
print(recorded_at.isoformat())
