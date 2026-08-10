from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.runs import Run
from app.models.dataset import Dataset
from spark_engine.engine_runner import run_engine
import asyncio

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("/")
def start_run(dataset_id: int, db: Session = Depends(get_db)):
    run = Run(dataset_id=dataset_id, status="pending")
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.get("/")
def list_runs(db: Session = Depends(get_db)):
    runs = db.query(Run).order_by(Run.created_at.desc()).all()
    return runs


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

@router.post("/start")
async def start_run(dataset_id: int, db=Depends(get_db)):
    run = Run(dataset_id=dataset_id, status="pending")
    db.add(run)
    db.commit()
    db.refresh(run)
    
    asyncio.create_task(run_engine(run.id, dataset_id))
    
    return run

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
    # Placeholder until real engine is built
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
