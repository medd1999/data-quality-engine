from datetime import datetime
from api.shared.alert_schema import Alert, AlertPayload
from spark_engine.alert_sender import send_alerts
from spark_engine.checks.schema_validation import check_schema
from api.app.run_queue import get_run_queue
import pandas as pd
import asyncio

expected_schema = {
    "id": {"type": "int", "required": True},
    "name": {"type": "string", "required": True},
    "age": {"type": "int", "required": False},
    "created _at": {"type": "datetime", "required": True}
}


async def run_engine(run_id: int, dataset_id: int, df):
    queue = get_run_queue(run_id)

    await queue.put({"type": "status", "message": "Your engine is live!"})
    await queue.put({"type": "progress", "value": 10})
    await asyncio.sleep(0.2)
    
    await queue.put("Now I'm loading the dataset...")
    await asyncio.sleep(0.2)
    
    await queue.put({"type": "status", "message": "Let's validate the schema first..."})
    schema_results = check_schema(df, expected_schema)
    await queue.put({"type": "metric", "schema_validation": schema_results})
    await queue.put({"type": "progress", "value": 20})
    
    alerts = []
    
    if schema_results["missing_columns"]:
        alerts.append({
            "severity": "error",
            "code": "MISSING_COLUMNS",
            "message": f"Wait a minute, this dataset is missing some data: {schema_results['missing_columns']}",
        })
        
        if schema_results["unexpected_columns"]:
            alerts.append({
                "severity": "warning",
                "code": "UNEXPECTED_COLUMNS",
                "message": f"Interesting, it seems we've got some unexpected data: {schema_results['unexpected_columns']}",
            })
            
        if schema_results["type_mismatches"]:
            alerts.append({
                "severity": "error",
                "code": "TYPE_MISMATCHES",
                "message": f"Something doesn't add up, these types don't match: {schema_results['type_mismatches']}",
            })
        
        if schema_results["nullability_violations"]:
            alerts.append({
                "severity": "error",
                "code": "NULLABILITY_VIOLATIONS",
                "message": f"There's some columns (or a column) that need values: {schema_results['nullability_violations']}",
            })
            
        if alerts:
            await queue.pu({"type": "alert", "alerts": alerts})

    await queue.put({"type": "log", "message": "Checking the missing values next..."})
    missing = df.isna().sum().to_dict()
    await queue.put({"type": "metric", "missing_values": missing})
    await queue.put({"type": "progress", "value": 40})
    await asyncio.sleep(0.2)

    await queue.put({"type": "log", "message": "Now I'm looking for any duplicates..."})
    dup = int(df.duplicated().sum())
    await queue.put({"type": "metric", "duplicate_rows": dup})
    await queue.put({"type": "progress", "value": 60})
    await asyncio.sleep(0.2)

    await queue.put({"type": "The run is now complete!"})
    await queue.put({"type": "progress", "value": 100})
    await queue.put({"type": "progress", "message": "completed"})