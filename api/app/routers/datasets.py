from fastapi import APIRouter, UploadFile, Form
from ..db import SessionLocal
from ..s3 import s3, S3_BUCKET

router = APIRouter()

@router.post("/datasets")
async def upload_dataset(
    dataset_name: str = Form(...),
    file: UploadFile = Form(...)
):
    db = SessionLocal()

    # Upload file to S3 (MinIO)
    s3.upload_fileobj(file.file, S3_BUCKET, f"{dataset_name}/{file.filename}")

    # Insert dataset metadata into Postgres
    db.execute(
        """
        INSERT INTO datasets (name, file_name)
        VALUES (:name, :file_name)
        """,
        {"name": dataset_name, "file_name": file.filename}
    )
    db.commit()

    return {"message": "Dataset uploaded", "dataset": dataset_name}
