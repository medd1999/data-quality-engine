from fastapi import APIRouter
from api.shared.alert_schema import AlertPayload

router = APIRouter()

@router.post("/ingest")
async def ingest_alerts(payload: AlertPayload):
        return {
            "status": "ok",
            "received": len(payload.alerts),
            "run_id": payload.run_id,
            "dataset_id": payload.dataset_id
            }