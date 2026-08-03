from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.runs import Run

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
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
