from fastapi import FastAPI
from .routers import datasets
from app.s3 import S3_BUCKET, ensure_bucket_exists

app = FastAPI()
app.include_router(datasets.router)
