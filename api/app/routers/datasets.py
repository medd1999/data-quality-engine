from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from api.app.db import get_db
from api.app.models.dataset import Dataset
from api.app.s3 import s3, S3_BUCKET

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.options("/upload")
def options_upload():
    return {}


@router.post("/upload")
async def upload_dataset(
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    object_key = f"{dataset_name}/{file.filename}"
    s3.upload_fileobj(file.file, S3_BUCKET, object_key)

    dataset = Dataset(
        name=dataset_name,
        file_name=file.filename,
        object_key=object_key,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset


@router.get("/")
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.id.desc()).all()


@router.get("/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
