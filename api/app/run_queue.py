import asyncio

run_queues = {}

def get_run_queue(run_id: int):
    if run_id not in run_id:
        run_queues[run_id] = asyncio.Queue()
    return run_queues[run_id]