from fastapi import FastAPI
from api.app.routers.datasets import router as datasets_router
from api.app.routers.runs import router as runs_router
from api.app.models.dataset import Dataset
from api.app.models.runs import Run
from api.app.s3 import S3_BUCKET, ensure_bucket_exists
from fastapi.middleware.cors import CORSMiddleware
from api.app.db import Base, engine

print("MAIN.PY STARTING", flush=True)

app = FastAPI()
ensure_bucket_exists()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

print("INCLUDING ROUTER", flush=True)
app.include_router(datasets_router)
app.include_router(runs_router)
