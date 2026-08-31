from datetime import datetime, timezone
from shared.alert_schema import Alert, AlertPayload
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
    "created_at": {"type": "datetime", "required": True},
}

def sanitize(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    
    return obj

def result_normalization(metric_name: str, results):
    if metric_name == "schema_validation":
        # results is expected to be a dict with keys:
        # missing_values, unexpected_values, type_mismatches, nullability_violations
        return {
            "name": metric_name,
            "summary": {
                "missing_values": len(results.get("missing_values", [])),
                "unexpected_values": len(results.get("unexpected_values", [])),
                "type_mismatches": len(results.get("type_mismatches", [])),
                "nullability_violations": len(
                    results.get("nullability_violations", [])
                ),
            },
            "by_column": results.get("missing_values_by_column", {}),
        }

    # Missing values: pandas Series -> dict of col -> count
    if metric_name == "missing_values":
        if isinstance(results, pd.Series):
            by_col = results.to_dict()
        elif isinstance(results, dict):
            by_col = results
        else:
            by_col = {}

        total_missing = sum(by_col.values())
        return {
            "name": metric_name,
            "summary": {"total_missing": total_missing},
            "by_column": by_col,
        }

    # Duplicate rows: scalar count
    if metric_name == "duplicate_rows":
        # results is a scalar (int)
        dup_count = int(results) if results is not None else 0
        return {
            "name": metric_name,
            "summary": {"duplicate_rows": dup_count},
            "by_column": {},  # no per-column breakdown
        }

    # Outliers: dict of col -> count
    if metric_name == "outliers":
        if results is None:
            results = {}
        if isinstance(results, pd.Series):
            by_col = results.to_dict()
        elif isinstance(results, dict):
            by_col = results
        else:
            by_col = {}

        total_outliers = sum(by_col.values())
        return {
            "name": metric_name,
            "summary": {"total_outliers": total_outliers},
            "by_column": by_col,
        }

    # Fallback (shouldn't really happen)
    return {
        "name": metric_name,
        "summary": {"value": results},
        "by_column": {},
    }


async def run_engine(run_id: int, dataset_id: int, df):
    queue = get_run_queue(run_id)

    await queue.put(sanitize({"type": "phase", "value": "started"}))
    await queue.put(sanitize({"type": "status", "message": "Your engine is live!"}))
    await queue.put(sanitize({"type": "progress", "value": 10}))
    await asyncio.sleep(2.0)

    await queue.put(sanitize({"type": "phase", "value": "loading_dataset"}))
    await queue.put(sanitize({"type": "log", "message": "Got the dataset loaded!"}))
    await asyncio.sleep(2.0)

    checks = [
        (
            "schema_validation",
            lambda df: check_schema(df, expected_schema),
            20,
            "Let's validate the schema first...",
        ),
        (
            "missing_values",
            lambda df: df.isna().sum(),
            40,
            "Checking the missing values next...",
        ),
        (
            "duplicate_rows",
            lambda df: df.duplicated().sum(),
            60,
            "Looking for any duplicates...",
        ),
        ("outliers", lambda df: check_outliers(df), 80, "Scanning for any outliers..."),
    ]

    all_alerts = []

    for metric_name, fn, progress_value, log_message in checks:
        await queue.put(sanitize({"type": "phase", "value": metric_name}))
        await queue.put(sanitize({"type": "log", "message": log_message}))

        results = fn(df)
        metric = result_normalization(metric_name, results)
        alerts = []

        await queue.put(sanitize({"type": "metric", "metric": metric}))

        await queue.put(sanitize({"type": "progress", "value": progress_value}))
        await asyncio.sleep(2.0)

        if metric_name == "schema_validation":
            summary = metric["summary"]
            missing_values = summary["missing_values"]
            unexpected_values = summary["unexpected_values"]
            type_mismatches = summary["type_mismatches"]
            nullability_violations = summary["nullability_violations"]

            if missing_values > 0:
                alerts.append(
                    {
                        "severity": "error",
                        "code": "MISSING_VALUES",
                        "column": None,
                        "value": missing_values,
                        "message": f"Wait a minute, this dataset is missing some data",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                )

            if unexpected_values > 0:
                alerts.append(
                    {
                        "severity": "warning",
                        "code": "UNEXPECTED_VALUES",
                        "column": None,
                        "value": unexpected_values,
                        "message": f"Interesting, I wasn't expecting this",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                )

            if type_mismatches > 0:
                alerts.append(
                    {
                        "severity": "error",
                        "code": "TYPE_MISMATCHES",
                        "column": None,
                        "value": type_mismatches,
                        "message": f"Wait a second, there's type mismatches",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                )

            if nullability_violations > 0:
                alerts.append(
                    {
                        "severity": "error",
                        "code": "NULLABILITY_VIOLATIONS",
                        "column": None,
                        "value": nullability_violations,
                        "message": f"There's a column (or columns) you might wanna check out",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                )

        if metric_name == "missing_values":
            by_col = metric["by_column"]
            for col, count in by_col.items():
                if count > 0:
                    required = expected_schema.get(col, {}).get("required", False)
                    alerts.append(
                        {
                            "severity": "error" if required else "warning",
                            "code": "MISSING_VALUES",
                            "column": col,
                            "value": count,
                            "message": (
                                f"Hold on, column '{col}' has {count} missing values!"
                                + (" (required column)" if required else "")
                            ),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                    )

        if metric_name == "duplicate_rows":
            dup_count = metric["summary"]["duplicate_rows"]
            if dup_count > 0:
                alerts.append(
                    {
                        "severity": "warning",
                        "code": "DUPLICATE_ROWS",
                        "column": None,
                        "value": dup_count,
                        "message": f"Just a heads up, this dataset has {dup_count} duplicate rows.",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                )

        if metric_name == "outliers":
            by_col = metric["by_column"]
            for col, count in by_col.items():
                if count > 0:
                    alerts.append(
                        {
                            "severity": "warning",
                            "code": "OUTLIERS_DETECTED",
                            "column": col,
                            "value": count,
                            "message": f"Just a heads up, my Z-score method detected {count} outlier(s) inside {col}.",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                    )

        if alerts:
            await queue.put(sanitize({"type": "alert", "alerts": alerts}))
            all_alerts.extend(alerts)

    await queue.put(sanitize({"type": "log", "message": "Schema validation finished!"}))

    payload = AlertPayload(
        run_id=run_id, 
        dataset_id=dataset_id, 
        alerts=all_alerts
    )
    print("SENDING FINAL ALERT PAYLOAD")

    await send_alerts(sanitize(payload))

    await queue.put(sanitize({"type": "phase", "value": "completed"}))
    await queue.put(sanitize({"type": "log", "message": "The run is now complete!"}))
    await queue.put(sanitize({"type": "progress", "value": 100}))
    await queue.put(sanitize({"type": "status", "message": "completed"}))
