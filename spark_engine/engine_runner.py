from datetime import datetime, timezone
from api.shared.alert_schema import Alert, AlertPayload
from spark_engine.alert_sender import send_alerts
from spark_engine.checks.schema_validation import check_schema
from spark_engine.checks.outliers import check_outliers
from api.app.run_queue import get_run_queue
import pandas as pd
import numpy as np
import asyncio

expected_schema = {
    "id": {"type": "int", "required": True},
    "name": {"type": "string", "required": True},
    "age": {"type": "int", "required": False},
    "created_at": {"type": "datetime", "required": True}
}

def result_normalization(results):
    if results is None:
        return {}
    
    if isinstance(results, pd.Series):
        results = results.to_dict()
        
    if not isinstance(results, dict):
        if hasattr(results, "item"):
            return {"value": results.item()}
        return {"value": results}
    
    normalized = {}
    for key, value in results.items():
        if hasattr(value, "item"):
            normalized[key] = value.item()
        else:
            normalized[key] = value
        
    return normalized

async def run_engine(run_id: int, dataset_id: int, df):
    queue = get_run_queue(run_id)

    await queue.put({"type": "phase", "value": "started"})
    await queue.put({"type": "status", "message": "Your engine is live!"})
    await queue.put({"type": "progress", "value": 10})
    await asyncio.sleep(2.0)
    
    await queue.put({"type": "phase", "value": "loading_dataset"})
    await queue.put({"type": "log", "message": "Got the dataset loaded!"})
    await asyncio.sleep(2.0)
    
    checks = [
        (
            "schema_validation",
            lambda df: check_schema(df, expected_schema), 20,
            "Let's validate the schema first..."
        ),
        (
            "missing_values",
            lambda df: df.isna().sum(), 40,
            "Checking the missing values next..."
        ),
        (
            "duplicate_rows",
            lambda df: df.duplicated().sum(), 60,
            "Looking for any duplicates..."
        ),
        (
            "outliers",
            lambda df: check_outliers(df), 80,
            "Scanning for any outliers..."
        )
    ]
    
    all_alerts = []
    
    for metric_name, fn, progress_value, log_message in checks:
        await queue.put({"type": "phase", "value": metric_name})
        await queue.put({"type": "log", "message": log_message})
        
        data_results = result_normalization(fn(df))
        alerts = []
        
        await queue.put({"type": "metric", metric_name: data_results})
            
        await queue.put({"type": "progress", "value": progress_value})
        await asyncio.sleep(2.0)
        
        if metric_name == "schema_validation":
            data_results.setdefault("missing_values", [])
            data_results.setdefault("unexpected_values", [])
            data_results.setdefault("type_mismatches", [])
            data_results.setdefault("nullability_violations", [])
            
            if data_results["missing_values"]:
                alerts.append({
                    "severity": "error",
                    "code": "MISSING_VALUES",
                    "column": None,
                    "value": len(data_results["missing_values"]),
                    "message": f"Wait a minute, this dataset is missing some data: {data_results['missing_values']}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        
            if data_results["unexpected_values"]:
                alerts.append({
                    "severity": "warning",
                    "code": "UNEXPECTED_VALUES",
                    "column": None,
                    "value": len(data_results["unexpected_values"]),
                    "message": f"Interesting, I wasn't expecting this: {data_results['unexpected_values']}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
            if data_results["type_mismatches"]:
                alerts.append({
                    "severity": "error",
                    "code": "TYPE_MISMATCHES",
                    "column": None,
                    "value": len(data_results["type_mismatches"]),
                    "message": f"Wait a second, there's type mismatches: {data_results['type_mismatches']}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            
            if data_results["nullability_violations"]:
                alerts.append({
                    "severity": "error",
                    "code": "NULLABILITY_VIOLATIONS",
                    "column": None,
                    "value": len(data_results["nullability_violations"]),
                    "message": f"There's a column (or columns) you might wanna check out: {data_results['nullability_violations']}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})
                all_alerts.extend(alerts)
                
        if metric_name == "missing_values":
            for col, count in data_results.items():
                if count > 0:
                    required = expected_schema.get(col, {}).get("required", False)
                    alerts.append({
                        "severity": "error" if required else "warning",
                        "code": "MISSING_VALUES",
                        "column": col,
                        "value": count,
                        "message": (f"Hold on, column '{col}' has {count} missing values!"
                                + (" (required column)" if required else "")),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})
                all_alerts.extend(alerts)
                
        if metric_name == "duplicate_rows":
            dup_count = data_results["value"]
            if dup_count > 0:
                alerts.append({
                    "severity": "warning",
                    "code": "DUPLICATE_ROWS",
                    "column": None,
                    "value": dup_count,
                    "message": f"Just a heads up, this dataset has {dup_count} duplicate rows.",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})
                all_alerts.extend(alerts)
        
        if metric_name == "outliers":
            for col, count in data_results.items():
                if count > 0:
                    alerts.append({
                        "severity": "warning",
                        "code": "OUTLIERS_DETECTED",
                        "column": col,
                        "value": count,
                        "message": f"Just a heads up, my Z-score method detected {count} outlier(s) inside {col}.",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})
                all_alerts.extend(alerts)

    await queue.put({"type": "log", "message": "Schema validation finished!"})

    payload = AlertPayload(
        run_id=run_id,
        dataset_id=dataset_id,
        alerts=all_alerts
    )
    
    await send_alerts(payload)
    
    await queue.put({"type": "phase", "value": "completed"})
    await queue.put({"type": "log", "message": "The run is now complete!"})
    await queue.put({"type": "progress", "value": 100})
    await queue.put({"type": "status", "message": "completed"})