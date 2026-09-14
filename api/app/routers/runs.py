from fastapi import APIRouter, Depends, HTTPException, Query, APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from api.app.db import get_db
from api.app.models.runs import Run
from api.app.models.dataset import Dataset
from api.app.s3 import s3, S3_BUCKET
from api.app.run_queue import get_run_queue
from spark_engine.engine_runner import run_engine
from shared.serializers import serialize_datetime, serialize_alert, serialize_dataset, serialize_run
from api.app.state import runs_metrics, runs_alerts
import pandas as pd
import asyncio, json

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("")
async def create_run(dataset_id: int = Query(...), db: Session = Depends(get_db)):
    # Validate dataset exists
    dataset = db.query(Dataset).get(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Create run
    run = Run(dataset_id=dataset_id, status="pending")
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # Load file from S3
    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=dataset.object_key)
        df = pd.read_csv(obj["Body"])
    except Exception as e:
        print("S3 READ ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Failure to load dataset from S3: {e}")
    # Kick off async engine
    asyncio.create_task(run_engine(run.id, dataset_id, df))
    
    return serialize_run(run)


@router.get("")
def list_runs(db: Session = Depends(get_db)):
    runs = db.query(Run).order_by(Run.created_at.desc()).all()
    return [serialize_run(run) for run in runs]


@router.get("/all-metrics")
def get_all_metrics(db: Session = Depends(get_db)):
    runs = db.query(Run).all()

    results = []
    for run in runs:
        dataset = db.query(Dataset).get(run.dataset_id)
        
        metrics = runs_metrics.get(run.id, {
                "missing_values": {},
                "duplicate_rows": 0,
                "schema_mismatches": [],
                "outliers": {},
                "distributions": {},
            }
        )
        results.append(
            {
                "run_id": run.id,
                **serialize_run(run),
                "dataset_name": dataset.name,
                "metrics": metrics,
            }
        )

    return results


@router.get("/all-alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    runs = db.query(Run).all()

    results = []
    for run in runs:
        dataset = db.query(Dataset).get(run.dataset_id)
        
        alerts = runs_alerts.get(run.id, [])
        
        results.append(
            {
                "run_id": run.id,
                **serialize_run(run),
                "dataset_name": dataset.name,
                "alerts": alerts,
            }
        )

    return results


@router.get("/stream/{run_id}")
async def stream_run_logs(run_id: int, db: Session = Depends(get_db)):
    async def event_generator():
        queue = get_run_queue(run_id)
        valid_status = {"pending", "running", "completed", "failed"}
        
        if queue is None:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Queue not found'})}\n\n"
            return
        
        run = db.query(Run).get(run_id)
        try:    
            while True:
                message = await queue.get()
                
                if message.get("type") == "status":
                    status_value = message.get("message")
                    if status_value in valid_status:
                        run.status = status_value
                        db.commit()
                
                payload = json.dumps(message)
                yield f"data: {payload}\n\n"
                
        except Exception as e:
            err = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {err}\n\n"
                
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/{run_id}")
def get_run(run_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(Run, Dataset)
        .join(Dataset, Run.dataset_id == Dataset.id)
        .filter(Run.id == run_id)
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Run not found")

    run, dataset = result

    return {
        **serialize_run(run),
        "dataset_name": dataset.name,
    }


@router.get("/{run_id}/metrics")
def get_run_metrics(run_id: int, db: Session = Depends(get_db)):
    return runs_metrics.get(
        run_id,
        {
            "schema_validation": {
                "summary": {
                    "missing_values": 0,
                    "unexpected_values": 0,
                    "type_mismatches": 0,
                    "nullability_violations": 0,
                },
                "by_column": {},
            },
            "missing_values": {
                "summary": {"total_missing": 0},
                "by_column": {},
            },
            "duplicate_rows": {
                "summary": {"duplicate_rows": 0},
                "by_column": {},
            },
            "outliers": {
                "summary": {"total_outliers": 0},
                "by_column": {},
            },
        }
    )


@router.get("/{run_id}/alerts")
def get_run_alerts(run_id: int, db: Session = Depends(get_db)):
    return runs_alerts.get(run_id, [])
