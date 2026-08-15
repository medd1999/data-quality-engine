from datetime import datetime
from api.shared.alert_schema import Alert, AlertPayload
from spark_engine.alert_sender import send_alerts
from spark_engine.checks.schema_validation import check_schema
from spark_engine.checks.outliers import check_outliers
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
    
    checks = [
        (
            "schema_validation",
            lambda df: check_schema(df, expected_schema),
            20,
            "Let's validate the schema first..."
        ),
        (
            "missing_values",
            lambda df: df.isna().sum().to_dict(),
            40,
            "Checking the missing values next..."
        ),
        (
            "duplicate_rows",
            lambda df: int(df.duplicated().sum()),
            60,
            "Now I'm looking for any duplicates..."
        ),
        (
            "outliers",
            lambda df: check_outliers(df),
            80,
            "Now I'm checking the numeric columns for any outliers..."
        )
    ]
    
    for metric_name, fn, progress_value, log_message in checks:
        await queue.put({"type": "log", "message": log_message})
        
        schema_results = fn(df)
        
        await queue.put({"type": "metric", metric_name: schema_results})
        
        await queue.put({"type": "progress", "value": progress_value})
        await asyncio.sleep(0.2)
        
        if metric_name == "schema_validation":
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
                await queue.put({"type": "alert", "alerts": alerts})
                
        if metric_name == "outliers":
            outlier_alerts = []
            
            for col, count in schema_results.items():
                if count > 0:
                    outlier_alerts.append({
                        "severity": "warning",
                        "code": "OUTLIERS_DETECTED",
                        "message": f"Just a heads up, my Z-score method detected {count} outlier(s) inside {col}."
                    })
                    
            if outlier_alerts:
                await queue.put({"type": "alert", "alerts": outlier_alerts})
    
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
            await queue.put({"type": "alert", "alerts": alerts})


    await queue.put({"type": "The run is now complete!"})
    await queue.put({"type": "progress", "value": 100})
    await queue.put({"type": "progress", "message": "completed"})