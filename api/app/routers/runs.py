from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.runs import Run
from app.models.dataset import Dataset

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
