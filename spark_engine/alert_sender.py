import httpx
from api.shared.alert_schema import AlertPayload

ALERTING_URL = "http://localhost:8002/api/alerts/ingest"
ENGINE_TOKEN = "super-secret-engine-token"

async def send_alerts(payload: AlertPayload):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            ALERTING_URL,
            json=payload.model_dump(),
            headers={"X-Engine-Token": ENGINE_TOKEN}
        )
        response.raise_for_status()
        
        return response.json()