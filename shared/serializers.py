from datetime import datetime

def serialize_datetime(dt):
    if dt is None:
        return None
    return dt.isoformat()

def serialize_run(run):
    return {
        "id": run.id,
        "dataset_id": run.dataset_id,
        "status": run.status,
        "created_at": serialize_datetime(run.created_at),
        "updated_at": serialize_datetime(run.updated_at),
    }


def serialize_dataset(dataset):
    return {
        "id": dataset.id,
        "name": dataset.name,
        "file_name": dataset.file_name,
        "object_key": dataset.object_key,
        "created_at": serialize_datetime(dataset.created_at),
    }


def serialize_alert(alert):
    return {
        "id": alert.id,
        "run_id": alert.run_id,
        "dataset_id": alert.dataset_id,
        "severity": alert.severity,
        "message": alert.message,
        "timestamp": serialize_datetime(alert.timestamp),
    }