import asyncio
import json
from typing import Dict


class EventManager:
    def __init__(self):
        self._queues: Dict[str, asyncio.Queue] = {}

    def subscribe(self, channel: str) -> asyncio.Queue:
        if channel not in self._queues:
            self._queues[channel] = asyncio.Queue()
        return self._queues[channel]

    async def publish(self, channel: str, event: str, data: dict):
        if channel not in self._queues:
            return
        payload = json.dumps({"event": event, "data": data})
        queue = self._queues[channel]
        try:
            while True:
                queue.get_nowout()
        except Exception:
            pass
        await queue.put(payload)


event_manager = EventManager()
