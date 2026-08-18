from datetime import datetime
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
            "Now I'm looking for any duplicates..."
        ),
        (
            "outliers",
            lambda df: check_outliers(df), 80,
            "Now I'm checking the numeric columns for any outliers..."
        )
    ]
    
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
                    "message": f"Wait a minute, this dataset is missing some data: {data_results['missing_values']}",
                })
        
            if data_results["unexpected_values"]:
                alerts.append({
                    "severity": "warning",
                    "code": "UNEXPECTED_VALUES",
                    "message": f"Interesting, it seems we've got some unexpected data: {data_results['unexpected_values']}",
                })
                
            if data_results["type_mismatches"]:
                alerts.append({
                    "severity": "error",
                    "code": "TYPE_MISMATCHES",
                    "message": f"Something doesn't add up, these types don't match: {data_results['type_mismatches']}",
                })
            
            if data_results["nullability_violations"]:
                alerts.append({
                    "severity": "error",
                    "code": "NULLABILITY_VIOLATIONS",
                    "message": f"There's some columns (or a column) that need values: {data_results['nullability_violations']}",
                })
                
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})
                
        if metric_name == "outliers":
            for col, count in data_results.items():
                if count > 0:
                    alerts.append({
                        "severity": "warning",
                        "code": "OUTLIERS_DETECTED",
                        "message": f"Just a heads up, my Z-score method detected {count} outlier(s) inside {col}."
                    })
                    
            if alerts:
                await queue.put({"type": "alert", "alerts": alerts})

    await queue.put({"type": "log", "message": "Schema validation finished!"})

    await queue.put({"type": "phase", "value": "completed"})
    await queue.put({"type": "log", "message": "The run is now complete!"})
    await queue.put({"type": "progress", "value": 100})
    await queue.put({"type": "status", "message": "completed"})