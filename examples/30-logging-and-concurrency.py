"""Demonstrate cooperative tasks and an English diagnostic event."""

import asyncio
import io
import logging


async def fetch_sample(identifier: int) -> int:
    """Yield control once and return a deterministic sample value."""
    await asyncio.sleep(0)
    return identifier * 10


async def collect_samples() -> list[int]:
    """Wait for both teaching tasks while preserving argument order."""
    return await asyncio.gather(fetch_sample(1), fetch_sample(2))


stream = io.StringIO()
logger = logging.getLogger("course.concurrency")
logger.handlers.clear()
logger.propagate = False
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler(stream))
logger.info("Sample collection completed.")
print(asyncio.run(collect_samples()))
print(stream.getvalue().strip())
