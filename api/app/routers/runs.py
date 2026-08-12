from fastapi import APIRouter, Depends, HTTPException, Query, APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from api.app.db import get_db
from api.app.models.runs import Run
from api.app.models.dataset import Dataset
from api.app.s3 import s3, S3_BUCKET
from api.app.run_queue import get_run_queue
from spark_engine.engine_runner import run_engine
import pandas as pd
import asyncio

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
    
    return run


@router.get("")
def list_runs(db: Session = Depends(get_db)):
    return db.query(Run).order_by(Run.created_at.desc()).all()


@router.get("/all-metrics")
def get_all_metrics(db: Session = Depends(get_db)):
    runs = db.query(Run).all()

    results = []
    for run in runs:
        results.append(
            {
                "run_id": run.id,
                "dataset_id": run.dataset_id,
                "dataset_name": db.query(Dataset).get(run.dataset_id).name,
                "status": run.status,
                "created_at": run.created_at,
                "updated_at": run.updated_at,
                "metrics": {
                    "missing_values": {},
                    "duplicate_rows": 0,
                    "schema_mismatches": [],
                    "outliers": {},
                    "distributions": {},
                },
            }
        )

    return results


@router.get("/all-alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    runs = db.query(Run).all()

    results = []
    for run in runs:
        results.append(
            {
                "run_id": run.id,
                "dataset_id": run.dataset_id,
                "dataset_name": db.query(Dataset).get(run.dataset_id).name,
                "status": run.status,
                "created_at": run.created_at,
                "updated_at": run.updated_at,
                "alerts": [
                    {
                        "id": 1,
                        "severity": "warning",
                        "message": "Sample warning",
                        "timestamp": run.updated_at,
                    },
                    {
                        "id": 2,
                        "severity": "error",
                        "message": "Sample error",
                        "timestamp": run.updated_at,
                    },
                ],
            }
        )

    return results


@router.get("/stream/{run_id}")
async def stream_run_logs(run_id: int):
    async def event_generator():
        queue = get_run_queue(run_id)
            
        while True:
            message = await queue.get()
            yield f"data response: {message}\n\n"
                
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
        "id": run.id,
        "dataset_id": run.dataset_id,
        "dataset_name": dataset.name,
        "status": run.status,
        "created_at": run.created_at,
        "updated_at": run.updated_at,
    }


@router.get("/{run_id}/metrics")
def get_run_metrics(run_id: int, db: Session = Depends(get_db)):
    return {
        "missing_values": {},
        "duplicate_rows": 0,
        "schema_mismatches": [],
        "outliers": {},
        "distributions": {},
    }


@router.get("/{run_id}/alerts")
def get_run_alerts(run_id: int, db: Session = Depends(get_db)):
    return [
        {
            "id": 1,
            "severity": "warning",
            "message": "Sample warning",
            "timestamp": "2026-08-03T20:00:00Z",
        },
        {
            "id": 2,
            "severity": "error",
            "message": "Sample error",
            "timestamp": "2026-08-03T20:00:00Z",
        },
    ]
