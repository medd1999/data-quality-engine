from fastapi import FastAPI
from app.routers.datasets import router as datasets_router
from app.routers.runs import router as runs_router
from app.models.dataset import Dataset
from app.models.runs import Run
from app.s3 import S3_BUCKET, ensure_bucket_exists
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine

print("MAIN.PY STARTING", flush=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

print("INCLUDING ROUTER", flush=True)
app.include_router(datasets_router)
app.include_router(runs_router)
