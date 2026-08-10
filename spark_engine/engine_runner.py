from datetime import datetime
from api.shared.alert_schema import Alert, AlertPayload
from spark_engine.alert_sender import send_alerts

async def run_engine(run_id: int, dataset_id: int, df):
    alerts = []
    
    missing = df.isNull().sum()
    for col, count in missing.items():
        if count > 0:
            alerts.append(Alert(
                severity="warning",
                code="MISSING_VALUES",
                message=f"Your column '{col}' is missing '{count}' values!",
                column=col,
                row=None,
                timestamp=datetime.utcow()
            ))
            
        payload = AlertPayload(
            run_id=run_id,
            dataset_id=dataset_id,
            alerts=alerts
        )
        
        await send_alerts(payload)