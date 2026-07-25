from fastapi import FastAPI
from .routers import datasets
from app.s3 import S3_BUCKET, ensure_bucket_exists

app = FastAPI()

@app.on_event("startup")
def startup_event():
    ensure_bucket_exists()
app.include_router(datasets.router)
