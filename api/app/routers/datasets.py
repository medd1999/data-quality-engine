from sqlalchemy import text
from fastapi import APIRouter, UploadFile, Form, HTTPException
from ..db import SessionLocal
from ..s3 import s3, S3_BUCKET

router = APIRouter()


@router.post("/datasets")
async def upload_dataset(dataset_name: str = Form(...), file: UploadFile = Form(...)):
    print("UPLOAD ENDPOINT HIT")
    db = SessionLocal()

    # Upload file to S3 (MinIO)
    try:
        object_key = f"{dataset_name}/{file.filename}"
        s3.upload_fileobj(file.file, S3_BUCKET, object_key)

        # Insert dataset metadata into Postgres
        db.execute(
            text("""
            INSERT INTO datasets (name, file_name, object_key)
            VALUES (:name, :file_name, :object_key)
            """),
            {
                "name": dataset_name,
                "file_name": file.filename,
                "object_key": object_key,
            },
        )
        db.commit()

        return {
            "message": "Your dataset has successfully uploaded!",
            "dataset": dataset_name,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/datasets")
def list_datasets():
    db = SessionLocal()

    rows = db.execute(text("""
        SELECT 
            name, 
            id,
            file_name, 
            object_key,
            created_at
        FROM datasets
        ORDER BY created_at DESC
        """)).fetchall()

    return [dict(row._mapping) for row in rows]
