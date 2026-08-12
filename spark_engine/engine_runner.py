from datetime import datetime
from api.shared.alert_schema import Alert, AlertPayload
from spark_engine.alert_sender import send_alerts
from api.app.run_queue import get_run_queue
import asyncio

async def run_engine(run_id: int, dataset_id: int, df):
    queue = get_run_queue(run_id)

    await queue.put({"type": "status", "message": "Your engine is live!"})
    await queue.put('{"type": "progress", "value": 10}')
    await asyncio.sleep(0.2)
    
    await queue.put("Loading dataset...")
    await asyncio.sleep(0.2)

    missing = df.isna().sum().to_dict()
    await queue.put({"type": "metric", "missing_values": missing})
    await queue.put('{"type": "progress", "value": 30}')
    await asyncio.sleep(0.2)

    dup = df.duplicated().sum()
    await queue.put({"type": "metric", "duplicate_rows": dup})
    await queue.put('{"type": "progress", "value": 60}')
    await asyncio.sleep(0.2)

    await queue.put({"type": "I've completed the run!"})
    await queue.put('{"type": "progress", "value": 100}')